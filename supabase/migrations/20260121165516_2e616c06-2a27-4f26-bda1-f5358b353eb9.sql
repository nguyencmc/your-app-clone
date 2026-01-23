
-- TABLE: question_sets (Bộ câu hỏi)
CREATE TABLE public.question_sets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  level TEXT DEFAULT 'medium',
  is_published BOOLEAN DEFAULT true,
  question_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TABLE: practice_questions (Câu hỏi luyện tập)
CREATE TABLE public.practice_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  set_id UUID NOT NULL REFERENCES public.question_sets(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'mcq_single',
  prompt TEXT NOT NULL,
  choices JSONB NOT NULL DEFAULT '[]',
  answer JSONB NOT NULL,
  explanation TEXT,
  difficulty INTEGER DEFAULT 3 CHECK (difficulty >= 1 AND difficulty <= 5),
  tags TEXT[] DEFAULT '{}',
  question_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TABLE: practice_exam_sessions (Phiên thi)
CREATE TABLE public.practice_exam_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  set_id UUID REFERENCES public.question_sets(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted')),
  duration_sec INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  score INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  correct INTEGER DEFAULT 0
);

-- TABLE: practice_attempts (Lịch sử trả lời)
CREATE TABLE public.practice_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES public.practice_questions(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('practice', 'exam')),
  exam_session_id UUID REFERENCES public.practice_exam_sessions(id) ON DELETE SET NULL,
  selected JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_sec INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_practice_questions_set_id ON public.practice_questions(set_id);
CREATE INDEX idx_practice_questions_difficulty ON public.practice_questions(difficulty);
CREATE INDEX idx_practice_attempts_user_id ON public.practice_attempts(user_id);
CREATE INDEX idx_practice_attempts_question_id ON public.practice_attempts(question_id);
CREATE INDEX idx_practice_exam_sessions_user_id ON public.practice_exam_sessions(user_id);

-- Enable RLS
ALTER TABLE public.question_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for question_sets (public read)
CREATE POLICY "Question sets are viewable by everyone"
ON public.question_sets FOR SELECT
USING (is_published = true);

CREATE POLICY "Admins and teachers can manage question sets"
ON public.question_sets FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- RLS Policies for practice_questions (public read)
CREATE POLICY "Practice questions are viewable by everyone"
ON public.practice_questions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.question_sets 
  WHERE id = practice_questions.set_id AND is_published = true
));

CREATE POLICY "Admins and teachers can manage practice questions"
ON public.practice_questions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- RLS Policies for practice_exam_sessions (user owns)
CREATE POLICY "Users can view their own exam sessions"
ON public.practice_exam_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exam sessions"
ON public.practice_exam_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam sessions"
ON public.practice_exam_sessions FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for practice_attempts (user owns)
CREATE POLICY "Users can view their own attempts"
ON public.practice_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own attempts"
ON public.practice_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger to update question_count in question_sets
CREATE OR REPLACE FUNCTION public.update_question_set_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.question_sets 
    SET question_count = question_count + 1, updated_at = now()
    WHERE id = NEW.set_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.question_sets 
    SET question_count = question_count - 1, updated_at = now()
    WHERE id = OLD.set_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_question_count
AFTER INSERT OR DELETE ON public.practice_questions
FOR EACH ROW EXECUTE FUNCTION public.update_question_set_count();
