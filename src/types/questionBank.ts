export interface QuestionBankItem {
  id: string;
  user_id: string;
  question: string;
  type: "multiple_choice" | "long_answer" | "true_false";
  options: string[];
  correct_answer: string;
  explanation: string | null;
  points: number;
  subject: string | null;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface QuestionBankFilters {
  search: string;
  subject: string | null;
  difficulty: string | null;
  tags: string[];
}

export interface CreateQuestionInput {
  question: string;
  type: "multiple_choice" | "long_answer" | "true_false";
  options?: string[];
  correct_answer: string;
  explanation?: string;
  points?: number;
  subject?: string;
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
}

export interface UpdateQuestionInput extends Partial<CreateQuestionInput> {
  id: string;
}
