import { useState, useRef } from "react";
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Question } from "../CreateExamWizard";

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
    const blocks = content.split(/\n\s*\n/);

    for (const block of blocks) {
      const lines = block.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 3) continue;

      // First line is the question
      let questionText = lines[0];
      // Remove question number if present (e.g., "1.", "Q1:", etc.)
      questionText = questionText.replace(/^(\d+[\.\):]|Q\d+[\.\):])\s*/i, '');

      const options: string[] = [];
      let correctAnswer = '';
      let explanation = '';

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if it's an option (A-H)
        const optionMatch = line.match(/^([A-H])[\.\)]\s*(.+)/i);
        if (optionMatch) {
          const letter = optionMatch[1].toUpperCase();
          const text = optionMatch[2];
          
          // Check if this option is marked as correct (with *, [x], (correct), etc.)
          if (text.includes('*') || text.toLowerCase().includes('[x]') || text.toLowerCase().includes('(correct)')) {
            correctAnswer = `${letter}. ${text.replace(/[\*\[\]x]|\(correct\)/gi, '').trim()}`;
            options.push(correctAnswer);
          } else {
            options.push(`${letter}. ${text}`);
          }
          continue;
        }

        // Check for answer line
        const answerMatch = line.match(/^(Answer|Correct|Đáp án)[:\s]+([A-H])/i);
        if (answerMatch) {
          const answerLetter = answerMatch[2].toUpperCase();
          const answerOption = options.find(opt => opt.startsWith(answerLetter));
          if (answerOption) {
            correctAnswer = answerOption;
          }
          continue;
        }

        // Check for explanation line
        const explainMatch = line.match(/^(Explanation|Giải thích)[:\s]+(.+)/i);
        if (explainMatch) {
          explanation = explainMatch[2];
          continue;
        }
      }

      // Only add if we have valid options (2-8)
      if (questionText && options.length >= 2 && options.length <= 8) {
        questions.push({
          question: questionText,
          type: "multiple_choice",
          options,
          correctAnswer: correctAnswer || options[0],
          explanation,
        });
      }
    }

    return questions;
  };

  const handleFile = async (uploadedFile: File) => {
    setError(null);
    setFile(uploadedFile);
    setIsProcessing(true);

    try {
      const content = await uploadedFile.text();
      const fileName = uploadedFile.name.toLowerCase();
      
      let parsed: ParsedQuestion[];
      if (fileName.endsWith('.csv')) {
        parsed = parseCSV(content);
      } else if (fileName.endsWith('.txt')) {
        parsed = parseTXT(content);
      } else {
        throw new Error('Unsupported file format. Please use .csv or .txt files.');
      }

      if (parsed.length === 0) {
        throw new Error('No valid questions found in the file. Please check the format.');
      }

      setParsedQuestions(parsed);
    } catch (err) {
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
              Supports .txt and .csv files
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
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
            <p><strong>TXT format:</strong></p>
            <pre className="bg-muted/30 p-2 rounded text-[10px] overflow-x-auto">
{`1. What is the capital of France?
A. London
B. Paris*
C. Berlin
D. Madrid
Answer: B
Explanation: Paris is the capital of France.

2. Which planet is largest?
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
