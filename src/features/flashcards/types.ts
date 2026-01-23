export interface FlashcardDeck {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  tags: string[];
  created_at: string;
  card_count?: number;
  due_count?: number;
}

export interface UserFlashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  hint: string | null;
  source_type: 'manual' | 'question' | 'lesson' | 'podcast' | 'book' | null;
  source_id: string | null;
  created_at: string;
  deck?: FlashcardDeck;
  review?: FlashcardReview;
}

export interface FlashcardReview {
  id: string;
  user_id: string;
  flashcard_id: string;
  due_at: string;
  interval_days: number;
  ease: number;
  repetitions: number;
  last_grade: number | null;
  reviewed_at: string | null;
}

export type SM2Grade = 0 | 1 | 2 | 3 | 4 | 5;

export interface ReviewState {
  interval_days: number;
  ease: number;
  repetitions: number;
}

export interface ReviewResult {
  next_interval_days: number;
  next_ease: number;
  next_repetitions: number;
  next_due_at: Date;
}

// UI Grade mapping
export type UIGrade = 'again' | 'hard' | 'good' | 'easy';

export const UI_GRADE_TO_SM2: Record<UIGrade, SM2Grade> = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

export interface StudyCard extends UserFlashcard {
  review: FlashcardReview;
}
