export interface SpacedRepetitionCard {
  id: string;
  user_id: string;
  exam_id: string;
  question_index: number;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_date: string;
  last_reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewableQuestion {
  card: SpacedRepetitionCard | null;
  exam_id: string;
  exam_title: string;
  question_index: number;
  question: string;
  options: string[];
  correct_answer: number;
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';
