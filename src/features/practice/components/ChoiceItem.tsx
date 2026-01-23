import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface ChoiceItemProps {
  id: string;
  text: string;
  label: string;
  isSelected: boolean;
  isCorrect?: boolean | null;
  showResult: boolean;
  correctAnswer?: string;
  disabled?: boolean;
  onSelect: (id: string) => void;
}

export function ChoiceItem({
  id,
  text,
  label,
  isSelected,
  isCorrect,
  showResult,
  correctAnswer,
  disabled,
  onSelect,
}: ChoiceItemProps) {
  const isCorrectAnswer = correctAnswer === id;

  const getItemStyles = () => {
    if (!showResult) {
      return isSelected
        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
        : 'border-border hover:border-primary/50 hover:bg-accent/50';
    }

    if (isCorrectAnswer) {
      return 'border-green-500 bg-green-500/10 ring-2 ring-green-500/20';
    }

    if (isSelected && !isCorrect) {
      return 'border-red-500 bg-red-500/10 ring-2 ring-red-500/20';
    }

    return 'border-border opacity-60';
  };

  const getLabelStyles = () => {
    if (!showResult) {
      return isSelected
        ? 'bg-primary text-primary-foreground'
        : 'bg-muted text-muted-foreground';
    }

    if (isCorrectAnswer) {
      return 'bg-green-500 text-white';
    }

    if (isSelected && !isCorrect) {
      return 'bg-red-500 text-white';
    }

    return 'bg-muted text-muted-foreground';
  };

  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(id)}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200',
        'text-left',
        disabled && !showResult ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        getItemStyles()
      )}
    >
      <span
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-semibold text-sm transition-colors',
          getLabelStyles()
        )}
      >
        {label}
      </span>
      <span className="flex-1 text-foreground">{text}</span>
      {showResult && isCorrectAnswer && (
        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
      )}
      {showResult && isSelected && !isCorrect && (
        <X className="w-5 h-5 text-red-500 flex-shrink-0" />
      )}
    </button>
  );
}
