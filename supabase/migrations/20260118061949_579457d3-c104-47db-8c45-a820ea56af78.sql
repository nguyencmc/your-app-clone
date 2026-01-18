-- Create question_bank table for reusable questions
CREATE TABLE public.question_bank (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  subject TEXT,
  difficulty TEXT DEFAULT 'medium',
  tags TEXT[] DEFAULT '{}',
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own questions"
  ON public.question_bank FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own questions"
  ON public.question_bank FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions"
  ON public.question_bank FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own questions"
  ON public.question_bank FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can view all questions
CREATE POLICY "Admins can view all questions"
  ON public.question_bank FOR SELECT
  USING (public.is_admin(auth.uid()));

-- Create indexes for better search performance
CREATE INDEX idx_question_bank_user_id ON public.question_bank(user_id);
CREATE INDEX idx_question_bank_subject ON public.question_bank(subject);
CREATE INDEX idx_question_bank_difficulty ON public.question_bank(difficulty);
CREATE INDEX idx_question_bank_tags ON public.question_bank USING GIN(tags);
CREATE INDEX idx_question_bank_question_text ON public.question_bank USING GIN(to_tsvector('simple', question));

-- Create trigger for updated_at
CREATE TRIGGER update_question_bank_updated_at
  BEFORE UPDATE ON public.question_bank
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();