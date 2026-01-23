import { useState } from 'react';
import { cn } from '@/lib/utils';

interface FlashcardFlipProps {
  front: string;
  back: string;
  hint?: string | null;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardFlip({ front, back, hint, isFlipped, onFlip }: FlashcardFlipProps) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className="relative w-full aspect-[3/2] cursor-pointer perspective-1000"
        onClick={onFlip}
      >
        <div
          className={cn(
            "absolute inset-0 w-full h-full transition-transform duration-500 transform-style-3d",
            isFlipped && "rotate-y-180"
          )}
        >
          {/* Front */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden",
              "bg-gradient-to-br from-primary/5 to-accent/10",
              "border-2 border-primary/20 rounded-2xl",
              "flex flex-col items-center justify-center p-8",
              "shadow-lg"
            )}
          >
            <p className="text-xl md:text-2xl font-medium text-center text-foreground whitespace-pre-wrap">
              {front}
            </p>
            
            {hint && !showHint && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowHint(true);
                }}
                className="mt-4 text-sm text-primary hover:underline"
              >
                Xem gợi ý
              </button>
            )}
            
            {hint && showHint && (
              <p className="mt-4 text-sm text-muted-foreground italic text-center">
                💡 {hint}
              </p>
            )}
            
            <p className="absolute bottom-4 text-sm text-muted-foreground">
              Nhấn để lật thẻ
            </p>
          </div>

          {/* Back */}
          <div
            className={cn(
              "absolute inset-0 w-full h-full backface-hidden rotate-y-180",
              "bg-gradient-to-br from-green-500/5 to-emerald-500/10",
              "border-2 border-green-500/20 rounded-2xl",
              "flex flex-col items-center justify-center p-8",
              "shadow-lg overflow-auto"
            )}
          >
            <p className="text-xl md:text-2xl font-medium text-center text-foreground whitespace-pre-wrap">
              {back}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
