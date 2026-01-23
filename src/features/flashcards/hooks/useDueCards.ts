import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchDueCards } from '../api';

export function useDueCards() {
  const { user } = useAuth();

  const { data: dueCards, isLoading, error, refetch } = useQuery({
    queryKey: ['flashcard-due-cards', user?.id],
    queryFn: () => fetchDueCards(user!.id),
    enabled: !!user?.id,
    refetchInterval: 60000, // Refetch every minute
  });

  // Group due cards by deck
  const cardsByDeck = (dueCards || []).reduce((acc, card) => {
    const deckId = card.deck_id;
    const deckTitle = card.deck?.title || 'Unknown';
    
    if (!acc[deckId]) {
      acc[deckId] = {
        deckId,
        deckTitle,
        cards: [],
      };
    }
    acc[deckId].cards.push(card);
    return acc;
  }, {} as Record<string, { deckId: string; deckTitle: string; cards: typeof dueCards }>);

  return {
    dueCards: dueCards || [],
    dueCount: dueCards?.length || 0,
    cardsByDeck: Object.values(cardsByDeck),
    isLoading,
    error,
    refetch,
  };
}
