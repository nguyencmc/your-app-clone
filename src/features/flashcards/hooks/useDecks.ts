import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchDeckWithCounts, createDeck, updateDeck, deleteDeck } from '../api';
import { toast } from 'sonner';

export function useDecks() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: decks, isLoading, error, refetch } = useQuery({
    queryKey: ['flashcard-decks', user?.id],
    queryFn: () => fetchDeckWithCounts(user!.id),
    enabled: !!user?.id,
  });

  const createMutation = useMutation({
    mutationFn: ({ title, description }: { title: string; description?: string }) =>
      createDeck(user!.id, title, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
      toast.success('Tạo bộ thẻ thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi tạo bộ thẻ: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ deckId, updates }: { deckId: string; updates: any }) =>
      updateDeck(deckId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
      toast.success('Cập nhật thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi cập nhật: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (deckId: string) => deleteDeck(deckId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
      toast.success('Xóa bộ thẻ thành công');
    },
    onError: (error: Error) => {
      toast.error('Lỗi xóa: ' + error.message);
    },
  });

  return {
    decks: decks || [],
    isLoading,
    error,
    refetch,
    createDeck: createMutation.mutate,
    updateDeck: updateMutation.mutate,
    deleteDeck: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
