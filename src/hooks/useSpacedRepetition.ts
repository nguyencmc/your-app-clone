import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { spacedRepetitionService } from "@/services/spacedRepetitionService";
import { ReviewRating, SpacedRepetitionCard } from "@/types/spacedRepetition";
import { useAuth } from "./useAuth";

export function useSpacedRepetition() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cardsQuery = useQuery({
    queryKey: ["spaced-repetition", "cards", user?.id],
    queryFn: () => spacedRepetitionService.getCardsForReview(user!.id),
    enabled: !!user?.id,
  });

  const allCardsQuery = useQuery({
    queryKey: ["spaced-repetition", "all-cards", user?.id],
    queryFn: () => spacedRepetitionService.getAllCards(user!.id),
    enabled: !!user?.id,
  });

  const statsQuery = useQuery({
    queryKey: ["spaced-repetition", "stats", user?.id],
    queryFn: () => spacedRepetitionService.getCardStats(user!.id),
    enabled: !!user?.id,
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      cardId,
      rating,
      currentCard,
    }: {
      cardId: string;
      rating: ReviewRating;
      currentCard: Partial<SpacedRepetitionCard>;
    }) => spacedRepetitionService.reviewCard(cardId, rating, currentCard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaced-repetition"] });
    },
  });

  const createAndReviewMutation = useMutation({
    mutationFn: ({
      examId,
      questionIndex,
      rating,
    }: {
      examId: string;
      questionIndex: number;
      rating: ReviewRating;
    }) =>
      spacedRepetitionService.createAndReviewCard(
        user!.id,
        examId,
        questionIndex,
        rating
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaced-repetition"] });
    },
  });

  const addFromExamMutation = useMutation({
    mutationFn: ({
      examId,
      questionCount,
    }: {
      examId: string;
      questionCount: number;
    }) =>
      spacedRepetitionService.addCardsFromExam(user!.id, examId, questionCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaced-repetition"] });
    },
  });

  return {
    cards: cardsQuery.data || [],
    allCards: allCardsQuery.data || [],
    stats: statsQuery.data || { dueToday: 0, learned: 0, totalCards: 0 },
    isLoading: cardsQuery.isLoading || statsQuery.isLoading,
    reviewCard: reviewMutation.mutate,
    createAndReview: createAndReviewMutation.mutate,
    addFromExam: addFromExamMutation.mutate,
    isReviewing: reviewMutation.isPending || createAndReviewMutation.isPending,
  };
}
