import { Json } from "@/integrations/supabase/types";

export interface Question {
  id: string;
  text: string;
  type: "multiple_choice" | "long_answer";
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  points?: number;
}

export interface Exam {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  difficulty: string;
  time_limit: number;
  questions: Json;
  question_count: number;
  question_type: string;
  course_id: string | null;
  start_date: string | null;
  end_date: string | null;
  ai_protection: boolean | null;
  randomize_order: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  answers: Json;
  score: number;
  total_questions: number;
  time_spent: number;
  completed_at: string;
  created_at: string;
  exam_title?: string;
  exam_subject?: string;
}
