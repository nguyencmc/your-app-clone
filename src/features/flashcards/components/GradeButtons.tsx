import { Button } from '@/components/ui/button';
import { UIGrade } from '../types';
import { cn } from '@/lib/utils';
import { RotateCcw, ThumbsDown, ThumbsUp, Zap } from 'lucide-react';

interface GradeButtonsProps {
  onGrade: (grade: UIGrade) => void;
  previews: Record<string, string> | null;
  disabled?: boolean;
}

const gradeConfig: { grade: UIGrade; label: string; icon: any; color: string }[] = [
  { grade: 'again', label: 'Lại', icon: RotateCcw, color: 'bg-red-500 hover:bg-red-600 text-white' },
  { grade: 'hard', label: 'Khó', icon: ThumbsDown, color: 'bg-orange-500 hover:bg-orange-600 text-white' },
  { grade: 'good', label: 'Tốt', icon: ThumbsUp, color: 'bg-green-500 hover:bg-green-600 text-white' },
  { grade: 'easy', label: 'Dễ', icon: Zap, color: 'bg-blue-500 hover:bg-blue-600 text-white' },
];

export function GradeButtons({ onGrade, previews, disabled }: GradeButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-xl mx-auto">
      {gradeConfig.map(({ grade, label, icon: Icon, color }) => (
        <Button
          key={grade}
          onClick={() => onGrade(grade)}
          disabled={disabled}
          className={cn(
            "flex flex-col h-auto py-3 px-2",
            color
          )}
        >
          <Icon className="w-5 h-5 mb-1" />
          <span className="text-sm font-medium">{label}</span>
          {previews && (
            <span className="text-xs opacity-80 mt-0.5">
              {previews[grade]}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}
