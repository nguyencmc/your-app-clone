import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  answered?: number;
  className?: string;
}

export function ProgressBar({ current, total, answered, className }: ProgressBarProps) {
  const progressPercent = total > 0 ? (current / total) * 100 : 0;
  const answeredPercent = answered !== undefined && total > 0 ? (answered / total) * 100 : 0;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Câu <span className="font-semibold text-foreground">{current}</span> / {total}
        </span>
        {answered !== undefined && (
          <span className="text-muted-foreground">
            Đã trả lời: <span className="font-semibold text-foreground">{answered}</span>
          </span>
        )}
      </div>
      <div className="relative">
        <Progress value={progressPercent} className="h-2" />
        {answered !== undefined && (
          <div
            className="absolute top-0 left-0 h-2 bg-green-500/30 rounded-full transition-all"
            style={{ width: `${answeredPercent}%` }}
          />
        )}
      </div>
    </div>
  );
}
