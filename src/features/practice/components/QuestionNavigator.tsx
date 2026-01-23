import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { AnswerState } from '../types';

interface QuestionNavigatorProps {
  totalQuestions: number;
  currentIndex: number;
  answers: Record<string, AnswerState>;
  questionIds: string[];
  onNavigate: (index: number) => void;
}

export function QuestionNavigator({
  totalQuestions,
  currentIndex,
  answers,
  questionIds,
  onNavigate,
}: QuestionNavigatorProps) {
  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
      {Array.from({ length: totalQuestions }, (_, i) => {
        const questionId = questionIds[i];
        const answer = answers[questionId];
        const isAnswered = answer?.selected !== null;
        const isCurrent = i === currentIndex;

        return (
          <Button
            key={i}
            variant={isCurrent ? 'default' : 'outline'}
            size="sm"
            onClick={() => onNavigate(i)}
            className={cn(
              'w-full h-10 text-sm font-medium transition-all',
              isAnswered && !isCurrent && 'bg-green-500/20 border-green-500/50 text-green-700 hover:bg-green-500/30',
              isCurrent && 'ring-2 ring-primary ring-offset-2'
            )}
          >
            {i + 1}
          </Button>
        );
      })}
    </div>
  );
}
