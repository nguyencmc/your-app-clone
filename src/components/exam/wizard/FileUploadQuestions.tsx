import { useState, useRef, useEffect } from "react";
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Question } from "../CreateExamWizard";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface FileUploadQuestionsProps {
  onQuestionsLoaded: (questions: Question[]) => void;
  onClose: () => void;
}

interface ParsedQuestion {
  question: string;
  type: "multiple_choice" | "long_answer";
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export default function FileUploadQuestions({ onQuestionsLoaded, onClose }: FileUploadQuestionsProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (content: string): ParsedQuestion[] => {
    const lines = content.split('\n').filter(line => line.trim());
    const questions: ParsedQuestion[] = [];

    // Skip header row if present
    const startIndex = lines[0]?.toLowerCase().includes('question') ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];
      // Handle CSV with commas in quoted fields
      const parts: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim());

      if (parts.length >= 3) {
        const questionText = parts[0].replace(/^"|"$/g, '');
        const optionsRaw = parts.slice(1, -2);
        const correctAnswer = parts[parts.length - 2]?.replace(/^"|"$/g, '');
        const explanation = parts[parts.length - 1]?.replace(/^"|"$/g, '') || '';

        // Filter out empty options and format them
        const options = optionsRaw
          .map(opt => opt.replace(/^"|"$/g, '').trim())
          .filter(opt => opt.length > 0);

        if (questionText && options.length >= 2 && options.length <= 8) {
          // Format options with letters
          const formattedOptions = options.map((opt, idx) => 
            opt.match(/^[A-H][\.\)]\s*/) ? opt : `${String.fromCharCode(65 + idx)}. ${opt}`
          );

          questions.push({
            question: questionText,
            type: "multiple_choice",
            options: formattedOptions,
            correctAnswer: correctAnswer || formattedOptions[0],
            explanation,
          });
        }
      }
    }

    return questions;
  };

  const parseTXT = (content: string): ParsedQuestion[] => {
    const questions: ParsedQuestion[] = [];
    const lines = content.split('\n');
    
    // Regex patterns
    const questionPattern = /^(question|câu hỏi|câu)\s*(\d+)?[\.\:\)]*\s*/i;
    const optionPattern = /^([A-H])[\.\)]\s*(.+)/i;
    const answerPattern = /^(answer|correct|đáp án|dap an)[:\s]+([A-H])/i;
    const explanationPattern = /^(explanation|giải thích|giai thich)[:\s]+(.+)/i;

    let currentQuestion: string | null = null;
    let currentOptions: string[] = [];
    let currentCorrectAnswer = '';
    let currentExplanation = '';
    let isReadingQuestion = false;
    let questionLines: string[] = [];

    const saveCurrentQuestion = () => {
      if (currentQuestion && currentOptions.length >= 2 && currentOptions.length <= 8) {
        questions.push({
          question: currentQuestion,
          type: "multiple_choice",
          options: currentOptions,
          correctAnswer: currentCorrectAnswer || currentOptions[0],
          explanation: currentExplanation,
        });
      }
      // Reset
      currentQuestion = null;
      currentOptions = [];
      currentCorrectAnswer = '';
      currentExplanation = '';
      isReadingQuestion = false;
      questionLines = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check if this line starts a new question
      const questionMatch = line.match(questionPattern);
      if (questionMatch) {
        // Save previous question if exists
        saveCurrentQuestion();
        
        // Extract question text after the prefix
        const questionText = line.replace(questionPattern, '').trim();
        if (questionText) {
          questionLines.push(questionText);
        }
        isReadingQuestion = true;
        continue;
      }

      // Check if this line is an option (A., B., etc.)
      const optionMatch = line.match(optionPattern);
      if (optionMatch) {
        // If we were reading question text, finalize it
        if (isReadingQuestion && questionLines.length > 0) {
          currentQuestion = questionLines.join(' ').trim();
          isReadingQuestion = false;
        }

        const letter = optionMatch[1].toUpperCase();
        let text = optionMatch[2].trim();
        
        // Check if this option is marked as correct (with *, [x], (correct), etc.)
        if (text.includes('*') || text.toLowerCase().includes('[x]') || text.toLowerCase().includes('(correct)')) {
          text = text.replace(/[\*\[\]x]|\(correct\)/gi, '').trim();
          currentCorrectAnswer = `${letter}. ${text}`;
          currentOptions.push(currentCorrectAnswer);
        } else {
          currentOptions.push(`${letter}. ${text}`);
        }
        continue;
      }

      // Check for answer line
      const answerMatch = line.match(answerPattern);
      if (answerMatch) {
        const answerLetter = answerMatch[2].toUpperCase();
        const answerOption = currentOptions.find(opt => opt.startsWith(answerLetter));
        if (answerOption) {
          currentCorrectAnswer = answerOption;
        }
        continue;
      }

      // Check for explanation line
      const explainMatch = line.match(explanationPattern);
      if (explainMatch) {
        currentExplanation = explainMatch[2].trim();
        continue;
      }

      // If we're reading a multi-line question, append this line
      if (isReadingQuestion) {
        questionLines.push(line);
      }
    }

    // Don't forget to save the last question
    if (questionLines.length > 0 && !currentQuestion) {
      currentQuestion = questionLines.join(' ').trim();
    }
    saveCurrentQuestion();

    return questions;
  };

  const parseDOCX = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const parsePDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  };

  const handleFile = async (uploadedFile: File) => {
    setError(null);
    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      const fileName = uploadedFile.name.toLowerCase();
      let content: string;
      
      if (fileName.endsWith('.csv')) {
        content = await uploadedFile.text();
        const parsed = parseCSV(content);
        if (parsed.length === 0) {
          throw new Error('No valid questions found in the file. Please check the format.');
        }
        setParsedQuestions(parsed);
      } else if (fileName.endsWith('.txt')) {
        content = await uploadedFile.text();
        const parsed = parseTXT(content);
        if (parsed.length === 0) {
          throw new Error('No valid questions found in the file. Please check the format.');
        }
        setParsedQuestions(parsed);
      } else if (fileName.endsWith('.docx')) {
        content = await parseDOCX(uploadedFile);
        const parsed = parseTXT(content); // Use TXT parser for extracted text
        if (parsed.length === 0) {
          throw new Error('No valid questions found in the DOCX file. Please check the format.');
        }
        setParsedQuestions(parsed);
      } else if (fileName.endsWith('.pdf')) {
        content = await parsePDF(uploadedFile);
        const parsed = parseTXT(content); // Use TXT parser for extracted text
        if (parsed.length === 0) {
          throw new Error('No valid questions found in the PDF file. Please check the format.');
        }
        setParsedQuestions(parsed);
      } else {
        throw new Error('Unsupported file format. Please use .txt, .csv, .docx or .pdf files.');
      }
    } catch (err) {
      console.error('File parsing error:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse file');
      setParsedQuestions([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const handleConfirm = () => {
    const questions: Question[] = parsedQuestions.map((q, idx) => ({
      id: Date.now() + idx,
      question: q.question,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: 1,
    }));
    onQuestionsLoaded(questions);
    onClose();
  };

  const clearFile = () => {
    setFile(null);
    setParsedQuestions([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="border-2 border-dashed border-border/60 bg-card/50">
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Upload Questions from File</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {!file ? (
          <div
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
              ${isDragging ? 'border-primary bg-primary/10' : 'border-border/60 hover:border-primary/50'}
            `}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag and drop a file here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports .txt, .csv, .docx and .pdf files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.docx,.pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Processing State */}
            {isProcessing && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Processing file...</span>
              </div>
            )}

            {/* Error */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Preview */}
            {parsedQuestions.length > 0 && (
              <div className="space-y-3">
                <Alert className="bg-green-500/10 border-green-500/30">
                  <Check className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    Found {parsedQuestions.length} questions ready to import
                  </AlertDescription>
                </Alert>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {parsedQuestions.slice(0, 5).map((q, idx) => (
                    <div key={idx} className="p-3 bg-muted/30 rounded-lg">
                      <p className="text-sm font-medium mb-1">Q{idx + 1}: {q.question}</p>
                      {q.options && (
                        <p className="text-xs text-muted-foreground">
                          {q.options.length} options • Correct: {q.correctAnswer.charAt(0)}
                        </p>
                      )}
                    </div>
                  ))}
                  {parsedQuestions.length > 5 && (
                    <p className="text-xs text-muted-foreground text-center py-2">
                      + {parsedQuestions.length - 5} more questions
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleConfirm} className="flex-1">
                    <Check className="w-4 h-4 mr-2" />
                    Import {parsedQuestions.length} Questions
                  </Button>
                  <Button variant="outline" onClick={clearFile}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Format Guide */}
        <div className="mt-4 p-3 bg-muted/20 rounded-lg">
          <p className="text-xs font-medium text-muted-foreground mb-2">File Format Guide:</p>
          <div className="text-xs text-muted-foreground space-y-1">
            <p><strong>TXT / DOCX / PDF format:</strong></p>
            <pre className="bg-muted/30 p-2 rounded text-[10px] overflow-x-auto">
{`Câu 1: What is the capital of France?
A. London
B. Paris*
C. Berlin
D. Madrid
Answer: B
Explanation: Paris is the capital of France.

Câu 2: Which planet is largest?
A. Earth
B. Mars
C. Jupiter
D. Venus
E. Saturn
F. Neptune
Answer: C`}
            </pre>
            <p className="mt-2"><strong>CSV format:</strong></p>
            <pre className="bg-muted/30 p-2 rounded text-[10px] overflow-x-auto">
{`question,option1,option2,option3,option4,correct,explanation
"What is 2+2?","2","3","4","5","C. 4","Basic math"`}
            </pre>
            <p className="mt-2 text-muted-foreground">
              * Supports 2-8 answer options per question
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
