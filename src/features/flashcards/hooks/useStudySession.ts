import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { UserFlashcard, UIGrade, UI_GRADE_TO_SM2, ReviewState } from '../types';
import { sm2Next, getGradePreviews } from '../srs_sm2';
import { upsertReview } from '../api';
import { toast } from 'sonner';

export function useStudySession(initialCards: UserFlashcard[]) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [cards] = useState<UserFlashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCard = cards[currentIndex];
  const isComplete = currentIndex >= cards.length;
  const progress = cards.length > 0 ? (completedCount / cards.length) * 100 : 0;

  // Get current review state for SM-2
  const getCurrentReviewState = useCallback((): ReviewState => {
    if (!currentCard) {
      return { interval_days: 0, ease: 2.5, repetitions: 0 };
    }

    const review = currentCard.review;
    if (!review) {
      // New card
      return { interval_days: 0, ease: 2.5, repetitions: 0 };
    }

    return {
      interval_days: review.interval_days,
      ease: Number(review.ease),
      repetitions: review.repetitions,
    };
  }, [currentCard]);

  // Get grade previews for current card
  const gradePreviews = currentCard ? getGradePreviews(getCurrentReviewState()) : null;

  const flip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handleGrade = useCallback(async (uiGrade: UIGrade) => {
    if (!currentCard || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const sm2Grade = UI_GRADE_TO_SM2[uiGrade];
      const state = getCurrentReviewState();
      const result = sm2Next(state, sm2Grade);

      // Save review to database
      await upsertReview(
        user.id,
        currentCard.id,
        result.next_due_at,
        result.next_interval_days,
        result.next_ease,
        result.next_repetitions,
        sm2Grade
      );

      // Move to next card
      setCompletedCount(prev => prev + 1);
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['flashcard-due-cards'] });
      queryClient.invalidateQueries({ queryKey: ['flashcard-decks'] });
    } catch (error: any) {
      toast.error('Lỗi lưu kết quả: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [currentCard, user, isSubmitting, getCurrentReviewState, queryClient]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setCompletedCount(0);
    setIsFlipped(false);
  }, []);

  return {
    currentCard,
    currentIndex,
    totalCards: cards.length,
    isFlipped,
    isComplete,
    isSubmitting,
    progress,
    completedCount,
    gradePreviews,
    flip,
    handleGrade,
    reset,
  };
}
