import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlashcardDeck } from '../types';
import { Layers, Play, Clock } from 'lucide-react';

interface DeckCardProps {
  deck: FlashcardDeck;
  onDelete?: (id: string) => void;
}

export function DeckCard({ deck }: DeckCardProps) {
  const hasDueCards = (deck.due_count || 0) > 0;

  return (
    <Card className="hover:shadow-lg transition-all border-border/50 group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Layers className="w-6 h-6 text-primary" />
          </div>
          {hasDueCards && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {deck.due_count} đến hạn
            </Badge>
          )}
        </div>

        <Link to={`/flashcards/decks/${deck.id}`}>
          <h3 className="font-semibold text-lg text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
            {deck.title}
          </h3>
        </Link>
        
        {deck.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {deck.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-muted-foreground">
            {deck.card_count || 0} thẻ
          </span>
          
          <div className="flex gap-2">
            <Link to={`/flashcards/decks/${deck.id}`}>
              <Button variant="outline" size="sm">
                Xem
              </Button>
            </Link>
            {(deck.card_count || 0) > 0 && (
              <Link to={`/flashcards/study/${deck.id}`}>
                <Button size="sm" className="gap-1">
                  <Play className="w-4 h-4" />
                  Học
                </Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
