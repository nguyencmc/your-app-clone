// Types for Practice Feature

export interface QuestionSet {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  tags: string[];
  level: string;
  is_published: boolean;
  question_count: number;
  created_at: string;
  updated_at: string;
}

export interface Choice {
  id: string;
  text: string;
  image_url?: string;
}

export interface PracticeQuestion {
  id: string;
  set_id: string;
  type: 'mcq_single';
  prompt: string;
  choices: Choice[];
  answer: string | string[]; // Single answer or multiple answers
  explanation: string | null;
  difficulty: number;
  tags: string[];
  question_order: number;
  created_at: string;
}

export interface ExamSession {
  id: string;
  user_id: string;
  set_id: string | null;
  status: 'in_progress' | 'submitted';
  duration_sec: number;
  started_at: string;
  submitted_at: string | null;
  score: number;
  total: number;
  correct: number;
}

export interface PracticeAttempt {
  id: string;
  user_id: string;
  question_id: string;
  mode: 'practice' | 'exam';
  exam_session_id: string | null;
  selected: string | string[];
  is_correct: boolean;
  time_spent_sec: number;
  created_at: string;
}

// Setup configs
export interface PracticeSetupConfig {
  setId: string;
  questionCount: number;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  tags: string[];
}

export interface ExamSetupConfig {
  setId: string;
  questionCount: number;
  durationMinutes: number;
}

// Answer state during practice/exam
export interface AnswerState {
  questionId: string;
  selected: string | null;
  isChecked: boolean;
  isCorrect: boolean | null;
  timeSpent: number;
}
