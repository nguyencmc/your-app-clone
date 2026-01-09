import { supabase } from "@/integrations/supabase/client";
import { SpacedRepetitionCard, ReviewRating } from "@/types/spacedRepetition";

// SM-2 Algorithm implementation
function calculateNextReview(
  card: Partial<SpacedRepetitionCard>,
  rating: ReviewRating
): { easeFactor: number; interval: number; repetitions: number } {
  let easeFactor = card.ease_factor || 2.5;
  let interval = card.interval || 0;
  let repetitions = card.repetitions || 0;

  // Convert rating to quality (0-5 scale for SM-2)
  const qualityMap: Record<ReviewRating, number> = {
    again: 0,
    hard: 2,
    good: 4,
    easy: 5,
  };
  const quality = qualityMap[rating];

  if (quality < 3) {
    // Failed - reset
    repetitions = 0;
    interval = 0;
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  }

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return { easeFactor, interval, repetitions };
}

export const spacedRepetitionService = {
  async getCardsForReview(userId: string): Promise<SpacedRepetitionCard[]> {
    const { data, error } = await (supabase
      .from("spaced_repetition" as any)
      .select("*")
      .eq("user_id", userId)
      .lte("next_review_date", new Date().toISOString())
      .order("next_review_date", { ascending: true }) as any);

    if (error) throw error;
    return data || [];
  },

  async getAllCards(userId: string): Promise<SpacedRepetitionCard[]> {
    const { data, error } = await (supabase
      .from("spaced_repetition" as any)
      .select("*")
      .eq("user_id", userId)
      .order("next_review_date", { ascending: true }) as any);

    if (error) throw error;
    return data || [];
  },

  async getCardStats(userId: string): Promise<{
    dueToday: number;
    learned: number;
    totalCards: number;
  }> {
    const { data, error } = await (supabase
      .from("spaced_repetition" as any)
      .select("*")
      .eq("user_id", userId) as any);

    if (error) throw error;

    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const cards = data || [];
    const dueToday = cards.filter(
      (c: SpacedRepetitionCard) => new Date(c.next_review_date) <= todayEnd
    ).length;
    const learned = cards.filter((c: SpacedRepetitionCard) => c.repetitions >= 3).length;

    return {
      dueToday,
      learned,
      totalCards: cards.length,
    };
  },

  async addCardsFromExam(
    userId: string,
    examId: string,
    questionCount: number
  ): Promise<void> {
    const cards = [];
    for (let i = 0; i < questionCount; i++) {
      cards.push({
        user_id: userId,
        exam_id: examId,
        question_index: i,
        ease_factor: 2.5,
        interval: 0,
        repetitions: 0,
        next_review_date: new Date().toISOString(),
      });
    }

    const { error } = await (supabase
      .from("spaced_repetition" as any)
      .upsert(cards, { onConflict: "user_id,exam_id,question_index" }) as any);

    if (error) throw error;
  },

  async reviewCard(
    cardId: string,
    rating: ReviewRating,
    currentCard: Partial<SpacedRepetitionCard>
  ): Promise<void> {
    const { easeFactor, interval, repetitions } = calculateNextReview(
      currentCard,
      rating
    );

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    const { error } = await (supabase
      .from("spaced_repetition" as any)
      .update({
        ease_factor: easeFactor,
        interval,
        repetitions,
        next_review_date: nextReviewDate.toISOString(),
        last_reviewed_at: new Date().toISOString(),
      })
      .eq("id", cardId) as any);

    if (error) throw error;
  },

  async createAndReviewCard(
    userId: string,
    examId: string,
    questionIndex: number,
    rating: ReviewRating
  ): Promise<void> {
    const { easeFactor, interval, repetitions } = calculateNextReview({}, rating);

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + interval);

    const { error } = await (supabase
      .from("spaced_repetition" as any)
      .upsert({
        user_id: userId,
        exam_id: examId,
        question_index: questionIndex,
        ease_factor: easeFactor,
        interval,
        repetitions,
        next_review_date: nextReviewDate.toISOString(),
        last_reviewed_at: new Date().toISOString(),
      }, { onConflict: "user_id,exam_id,question_index" }) as any);

    if (error) throw error;
  },

  async deleteCard(cardId: string): Promise<void> {
    const { error } = await (supabase
      .from("spaced_repetition" as any)
      .delete()
      .eq("id", cardId) as any);

    if (error) throw error;
  },
};
