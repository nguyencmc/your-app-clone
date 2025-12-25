import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, X, AlertCircle, CheckCircle2, Eye } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import QuestionPreview from "./QuestionPreview";

interface Question {
  id: number;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface FileUploadQuestionsProps {
  onQuestionsLoaded: (questions: Question[]) => void;
  questionType: string;
}

export default function FileUploadQuestions({ onQuestionsLoaded, questionType }: FileUploadQuestionsProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedCount, setParsedCount] = useState<number>(0);
  const [parsedQuestions, setParsedQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (content: string): Question[] => {
    const lines = content.trim().split('\n');
    const questions: Question[] = [];
    
    // Skip header if exists
    const startIndex = lines[0]?.toLowerCase().includes('question') ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Parse CSV - handle quoted fields
      const fields: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      fields.push(current.trim());

      if (questionType === 'multiple choice') {
        // Format: question,option1,option2,...,optionN,correctAnswer,explanation(optional)
        // Minimum: question + 2 options + answer = 4 fields
        if (fields.length >= 4) {
          const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          
          // Find the correct answer field - it should be a single uppercase letter
          let correctAnswerIndex = -1;
          for (let j = fields.length - 1; j >= 2; j--) {
            const field = fields[j].trim().toUpperCase();
            if (field.length === 1 && /^[A-Z]$/.test(field)) {
              correctAnswerIndex = j;
              break;
            }
          }
          
          if (correctAnswerIndex >= 2) {
            const optionFields = fields.slice(1, correctAnswerIndex);
            if (optionFields.length >= 2) {
              const options = optionFields.map((opt, idx) => `${letters[idx]}. ${opt}`);
              questions.push({
                id: questions.length + 1,
                question: fields[0],
                type: 'multiple choice',
                options,
                correctAnswer: fields[correctAnswerIndex].toUpperCase(),
                explanation: fields[correctAnswerIndex + 1] || ''
              });
            }
          }
        }
      } else if (questionType === 'true/false') {
        // Format: question,correctAnswer(true/false),explanation
        if (fields.length >= 2) {
          questions.push({
            id: questions.length + 1,
            question: fields[0],
            type: 'true/false',
            correctAnswer: fields[1].toLowerCase() === 'true' ? 'true' : 'false',
            explanation: fields[2] || ''
          });
        }
      } else {
        // Short answer: question,correctAnswer,explanation
        if (fields.length >= 2) {
          questions.push({
            id: questions.length + 1,
            question: fields[0],
            type: 'short answer',
            correctAnswer: fields[1],
            explanation: fields[2] || ''
          });
        }
      }
    }
    
    return questions;
  };

  const parseTXT = (content: string): Question[] => {
    const blocks = content.trim().split(/\n\s*\n/);
    const questions: Question[] = [];
    
    for (const block of blocks) {
      const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;
      
      const questionText = lines[0].replace(/^\d+[\.\)]\s*/, '');
      
      if (questionType === 'multiple choice') {
        const options: string[] = [];
        let correctAnswer = '';
        let explanation = '';
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          // Support A-Z options (not just A-D)
          const optionMatch = line.match(/^([A-Z])[\.\)]\s*(.+)/i);
          
          if (optionMatch) {
            options.push(`${optionMatch[1].toUpperCase()}. ${optionMatch[2]}`);
          } else if (line.toLowerCase().startsWith('answer:') || line.toLowerCase().startsWith('correct:')) {
            correctAnswer = line.replace(/^(answer|correct):\s*/i, '').toUpperCase().charAt(0);
          } else if (line.toLowerCase().startsWith('explanation:')) {
            explanation = line.replace(/^explanation:\s*/i, '');
          }
        }
        
        if (questionText && options.length >= 2 && correctAnswer) {
          questions.push({
            id: questions.length + 1,
            question: questionText,
            type: 'multiple choice',
            options,
            correctAnswer,
            explanation
          });
        }
      } else if (questionType === 'true/false') {
        let correctAnswer = '';
        let explanation = '';
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.toLowerCase().startsWith('answer:') || line.toLowerCase().startsWith('correct:')) {
            const ans = line.replace(/^(answer|correct):\s*/i, '').toLowerCase();
            correctAnswer = ans.includes('true') ? 'true' : 'false';
          } else if (line.toLowerCase().startsWith('explanation:')) {
            explanation = line.replace(/^explanation:\s*/i, '');
          }
        }
        
        if (questionText && correctAnswer) {
          questions.push({
            id: questions.length + 1,
            question: questionText,
            type: 'true/false',
            correctAnswer,
            explanation
          });
        }
      } else {
        // Short answer
        let correctAnswer = '';
        let explanation = '';
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (line.toLowerCase().startsWith('answer:') || line.toLowerCase().startsWith('correct:')) {
            correctAnswer = line.replace(/^(answer|correct):\s*/i, '');
          } else if (line.toLowerCase().startsWith('explanation:')) {
            explanation = line.replace(/^explanation:\s*/i, '');
          }
        }
        
        if (questionText && correctAnswer) {
          questions.push({
            id: questions.length + 1,
            question: questionText,
            type: 'short answer',
            correctAnswer,
            explanation
          });
        }
      }
    }
    
    return questions;
  };

  const handleFile = async (file: File) => {
    setFile(file);
    setParseError(null);
    setParsedCount(0);

    const content = await file.text();
    let questions: Question[] = [];

    try {
      if (file.name.endsWith('.csv')) {
        questions = parseCSV(content);
      } else if (file.name.endsWith('.txt')) {
        questions = parseTXT(content);
      } else {
        throw new Error('Unsupported file format. Please use CSV or TXT files.');
      }

      if (questions.length === 0) {
        throw new Error('No valid questions found in the file. Please check the format.');
      }

      setParsedCount(questions.length);
      setParsedQuestions(questions);
      onQuestionsLoaded(questions);
      
      toast({
        title: "File Parsed Successfully",
        description: `Found ${questions.length} questions in the file.`,
      });
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Failed to parse file');
      toast({
        title: "Parse Error",
        description: error instanceof Error ? error.message : 'Failed to parse file',
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.txt'))) {
      handleFile(droppedFile);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a CSV or TXT file.",
        variant: "destructive",
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setParseError(null);
    setParsedCount(0);
    setParsedQuestions([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="border-dashed border-2 border-muted-foreground/25">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-primary" />
          Upload Questions File
        </CardTitle>
        <CardDescription>
          Import questions from CSV or TXT file
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.txt"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                CSV or TXT files supported
              </p>
            </>
          )}
        </div>

        {parseError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{parseError}</AlertDescription>
          </Alert>
        )}

        {parsedCount > 0 && !parseError && (
          <div className="space-y-3">
            <Alert className="border-green-500/50 bg-green-500/10">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-700 dark:text-green-300 flex items-center justify-between">
                <span>Successfully parsed {parsedCount} questions</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                  className="ml-2"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  {showPreview ? 'Ẩn xem trước' : 'Xem trước'}
                </Button>
              </AlertDescription>
            </Alert>
            
            {showPreview && parsedQuestions.length > 0 && (
              <QuestionPreview
                questions={parsedQuestions}
                onClose={() => setShowPreview(false)}
              />
            )}
          </div>
        )}

        {/* Format Guide */}
        <div className="text-xs text-muted-foreground space-y-2 p-3 bg-muted/30 rounded-lg">
          <p className="font-medium">File Format Guide:</p>
          {questionType === 'multiple choice' ? (
            <>
              <p><strong>CSV:</strong> question,option1,option2,...,optionN,answer,explanation</p>
              <p className="text-muted-foreground italic">* Hỗ trợ từ 2 đến 26 đáp án (A-Z)</p>
              <p><strong>TXT:</strong> Each question block separated by blank line:</p>
              <pre className="text-xs mt-1 p-2 bg-background rounded">
{`1. Question text here?
A. Option A
B. Option B
C. Option C
D. Option D
E. Option E (optional)
F. Option F (optional)
Answer: A
Explanation: Why A is correct`}
              </pre>
            </>
          ) : questionType === 'true/false' ? (
            <>
              <p><strong>CSV:</strong> question,answer(true/false),explanation</p>
              <p><strong>TXT:</strong> Each question block separated by blank line:</p>
              <pre className="text-xs mt-1 p-2 bg-background rounded">
{`1. Statement to evaluate
Answer: True
Explanation: Why it's true`}
              </pre>
            </>
          ) : (
            <>
              <p><strong>CSV:</strong> question,answer,explanation</p>
              <p><strong>TXT:</strong> Each question block separated by blank line:</p>
              <pre className="text-xs mt-1 p-2 bg-background rounded">
{`1. Question requiring text answer?
Answer: The correct answer
Explanation: Additional context`}
              </pre>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
