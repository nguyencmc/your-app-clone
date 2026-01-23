import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

interface ExamTimerProps {
  timeLeft: number; // in seconds
  className?: string;
}

export function ExamTimer({ timeLeft, className }: ExamTimerProps) {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  const isLowTime = timeLeft <= 60; // Last minute
  const isCritical = timeLeft <= 30; // Last 30 seconds

  const formatTime = (value: number) => value.toString().padStart(2, '0');

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-semibold transition-colors',
        isLowTime
          ? isCritical
            ? 'bg-red-500/20 text-red-500 animate-pulse'
            : 'bg-orange-500/20 text-orange-500'
          : 'bg-muted text-foreground',
        className
      )}
    >
      <Clock className="w-5 h-5" />
      <span>
        {formatTime(minutes)}:{formatTime(seconds)}
      </span>
    </div>
  );
}
