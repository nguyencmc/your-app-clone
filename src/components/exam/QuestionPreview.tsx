import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Eye, CheckCircle2, X } from "lucide-react";

interface Question {
  id: number;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuestionPreviewProps {
  questions: Question[];
  onClose: () => void;
}

export default function QuestionPreview({ questions, onClose }: QuestionPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const currentQuestion = questions[currentIndex];

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowAnswer(false);
  };

  if (!currentQuestion) return null;

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            Xem trước câu hỏi
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Câu {currentIndex + 1} / {questions.length}</span>
          <Badge variant="outline" className="text-xs">
            {currentQuestion.type}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Navigation Pills */}
        <ScrollArea className="w-full">
          <div className="flex gap-1 pb-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentIndex ? "default" : "outline"}
                size="sm"
                className="h-7 w-7 p-0 text-xs shrink-0"
                onClick={() => goToQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {/* Question Content */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-4">
          <p className="font-medium text-foreground leading-relaxed">
            {currentQuestion.question}
          </p>

          {/* Options for multiple choice */}
          {currentQuestion.options && currentQuestion.options.length > 0 && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, idx) => {
                const optionLetter = option.charAt(0);
                const isCorrect = optionLetter === currentQuestion.correctAnswer;
                
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-md border transition-colors ${
                      showAnswer && isCorrect
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-border bg-background/50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {showAnswer && isCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                      )}
                      <span className={showAnswer && isCorrect ? 'text-green-700 dark:text-green-300' : ''}>
                        {option}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* True/False display */}
          {currentQuestion.type === 'true/false' && (
            <div className="flex gap-3">
              {['True', 'False'].map((opt) => {
                const isCorrect = currentQuestion.correctAnswer.toLowerCase() === opt.toLowerCase();
                return (
                  <div
                    key={opt}
                    className={`flex-1 p-3 rounded-md border text-center transition-colors ${
                      showAnswer && isCorrect
                        ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300'
                        : 'border-border bg-background/50'
                    }`}
                  >
                    {showAnswer && isCorrect && (
                      <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto mb-1" />
                    )}
                    {opt}
                  </div>
                );
              })}
            </div>
          )}

          {/* Short answer display */}
          {currentQuestion.type === 'short answer' && showAnswer && (
            <div className="p-3 rounded-md border border-green-500 bg-green-500/10">
              <p className="text-sm text-muted-foreground mb-1">Đáp án:</p>
              <p className="font-medium text-green-700 dark:text-green-300">
                {currentQuestion.correctAnswer}
              </p>
            </div>
          )}
        </div>

        {/* Show Answer Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnswer(!showAnswer)}
          className="w-full"
        >
          {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
        </Button>

        {/* Explanation */}
        {showAnswer && currentQuestion.explanation && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
              Giải thích:
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-200">
              {currentQuestion.explanation}
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Trước
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={goNext}
            disabled={currentIndex === questions.length - 1}
          >
            Sau
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}