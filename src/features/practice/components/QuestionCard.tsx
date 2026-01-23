import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers, Loader2 } from 'lucide-react';
import { ChoiceItem } from './ChoiceItem';
import { useAuth } from '@/contexts/AuthContext';
import { createFlashcardFromQuestion } from '@/features/flashcards/api';
import { toast } from 'sonner';
import type { PracticeQuestion } from '../types';

interface QuestionCardProps {
  question: PracticeQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  showResult: boolean;
  isCorrect: boolean | null;
  onSelectAnswer: (choiceId: string) => void;
}

const CHOICE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  showResult,
  isCorrect,
  onSelectAnswer,
}: QuestionCardProps) {
  const { user } = useAuth();
  const [isCreatingFlashcard, setIsCreatingFlashcard] = useState(false);
  const [flashcardCreated, setFlashcardCreated] = useState(false);

  const getDifficultyBadge = (difficulty: number) => {
    if (difficulty <= 2) return { label: 'Dễ', variant: 'secondary' as const };
    if (difficulty === 3) return { label: 'Trung bình', variant: 'default' as const };
    return { label: 'Khó', variant: 'destructive' as const };
  };

  const difficultyInfo = getDifficultyBadge(question.difficulty);

  const handleCreateFlashcard = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tạo flashcard');
      return;
    }

    setIsCreatingFlashcard(true);
    try {
      // Find correct answer text
      const correctChoice = question.choices.find(c => c.id === question.answer);
      const correctAnswerText = correctChoice ? correctChoice.text : String(question.answer);

      await createFlashcardFromQuestion(
        user.id,
        question.prompt,
        correctAnswerText,
        question.explanation || null,
        question.id
      );
      
      setFlashcardCreated(true);
      toast.success('Đã thêm vào Mistakes (Flashcards)');
    } catch (error) {
      console.error('Failed to create flashcard:', error);
      toast.error('Không thể tạo flashcard');
    } finally {
      setIsCreatingFlashcard(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              Câu {questionNumber}/{totalQuestions}
            </span>
            <Badge variant={difficultyInfo.variant}>{difficultyInfo.label}</Badge>
          </div>
          {question.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {question.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Question prompt */}
        <div className="text-lg font-medium leading-relaxed">{question.prompt}</div>

        {/* Choices */}
        <div className="space-y-3">
          {question.choices.map((choice, index) => (
            <ChoiceItem
              key={choice.id}
              id={choice.id}
              text={choice.text}
              label={CHOICE_LABELS[index]}
              isSelected={selectedAnswer === choice.id}
              isCorrect={isCorrect}
              showResult={showResult}
              correctAnswer={question.answer as string}
              disabled={showResult}
              onSelect={onSelectAnswer}
            />
          ))}
        </div>

        {/* Explanation */}
        {showResult && question.explanation && (
          <div className="mt-6 p-4 rounded-xl bg-muted/50 border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                💡 Giải thích
              </h4>
              {!isCorrect && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCreateFlashcard}
                  disabled={isCreatingFlashcard || flashcardCreated}
                  className="gap-1.5 h-7 text-xs"
                >
                  {isCreatingFlashcard ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Layers className="w-3 h-3" />
                  )}
                  {flashcardCreated ? 'Đã thêm' : 'Tạo flashcard'}
                </Button>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {question.explanation}
            </p>
          </div>
        )}

        {/* Show flashcard button even without explanation for wrong answers */}
        {showResult && !question.explanation && !isCorrect && (
          <div className="mt-4 flex justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCreateFlashcard}
              disabled={isCreatingFlashcard || flashcardCreated}
              className="gap-1.5"
            >
              {isCreatingFlashcard ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Layers className="w-4 h-4" />
              )}
              {flashcardCreated ? 'Đã thêm vào Flashcards' : 'Tạo flashcard từ câu sai'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
