import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  isInWishlist: boolean;
  onToggle: () => void;
  variant?: 'icon' | 'full';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const WishlistButton = ({
  isInWishlist,
  onToggle,
  variant = 'icon',
  size = 'md',
  className,
}: WishlistButtonProps) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  if (variant === 'full') {
    return (
      <Button
        variant={isInWishlist ? 'default' : 'outline'}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggle();
        }}
        className={cn(
          'gap-2',
          isInWishlist && 'bg-pink-500 hover:bg-pink-600 text-white',
          className
        )}
      >
        <Heart
          className={cn(
            iconSizes[size],
            isInWishlist && 'fill-current'
          )}
        />
        {isInWishlist ? 'Đã lưu' : 'Lưu khóa học'}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        sizeClasses[size],
        'rounded-full transition-all',
        isInWishlist 
          ? 'bg-pink-500/10 text-pink-500 hover:bg-pink-500/20' 
          : 'bg-background/80 hover:bg-background text-muted-foreground hover:text-pink-500',
        className
      )}
    >
      <Heart
        className={cn(
          iconSizes[size],
          isInWishlist && 'fill-current'
        )}
      />
    </Button>
  );
};
