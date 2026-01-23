import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { fetchCards, createCard, updateCard, deleteCard } from '../api';
import { FlashcardDeck, UserFlashcard } from '../types';
import { toast } from 'sonner';

export function useDeckDetail(deckId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch deck info
  const { data: deck, isLoading: deckLoading } = useQuery({
    queryKey: ['flashcard-deck', deckId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('id', deckId)
        .single();
      if (error) throw error;
      return data as unknown as FlashcardDeck;
    },
    enabled: !!deckId,
  });

  // Fetch cards
  const { data: cards, isLoading: cardsLoading, refetch } = useQuery({
    queryKey: ['flashcard-cards', deckId],
    queryFn: () => fetchCards(deckId),
    enabled: !!deckId,
  });

  const createCardMutation = useMutation({
    mutationFn: ({ front, back, hint }: { front: string; back: string; hint?: string }) =>
      createCard(deckId, front, back, hint),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-cards', deckId] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
      toast.success('Thêm thẻ thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi thêm thẻ: ' + error.message);
    },
  });

  const updateCardMutation = useMutation({
    mutationFn: ({ cardId, updates }: { cardId: string; updates: Partial<UserFlashcard> }) =>
      updateCard(cardId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-cards', deckId] });
      toast.success('Cập nhật thẻ thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi cập nhật: ' + error.message);
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-cards', deckId] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
      toast.success('Xóa thẻ thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi xóa: ' + error.message);
    },
  });

  return {
    deck,
    cards: cards || [],
    isLoading: deckLoading || cardsLoading,
    refetch,
    createCard: createCardMutation.mutate,
    updateCard: updateCardMutation.mutate,
    deleteCard: deleteCardMutation.mutate,
    isCreatingCard: createCardMutation.isPending,
  };
}
