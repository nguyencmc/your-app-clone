export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  examId?: string;
  questionIndex?: number;
  subject?: string;
}
