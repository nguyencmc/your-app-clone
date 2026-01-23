-- Create course_questions table for Q&A system
CREATE TABLE public.course_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_answered BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_answers table for replies
CREATE TABLE public.course_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.course_questions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_instructor_answer BOOLEAN DEFAULT false,
  is_accepted BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.course_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_questions
-- Anyone enrolled can view questions
CREATE POLICY "Enrolled users can view questions"
ON public.course_questions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_course_enrollments
    WHERE user_course_enrollments.course_id = course_questions.course_id
    AND user_course_enrollments.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_questions.course_id
    AND courses.creator_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Enrolled users can create questions
CREATE POLICY "Enrolled users can create questions"
ON public.course_questions
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_course_enrollments
    WHERE user_course_enrollments.course_id = course_questions.course_id
    AND user_course_enrollments.user_id = auth.uid()
  )
);

-- Users can update their own questions
CREATE POLICY "Users can update their own questions"
ON public.course_questions
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own questions
CREATE POLICY "Users can delete their own questions"
ON public.course_questions
FOR DELETE
USING (auth.uid() = user_id);

-- Instructor can update any question in their course (mark as answered)
CREATE POLICY "Instructors can update questions in their courses"
ON public.course_questions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.courses
    WHERE courses.id = course_questions.course_id
    AND courses.creator_id = auth.uid()
  )
);

-- RLS Policies for course_answers
-- Anyone who can see the question can see answers
CREATE POLICY "Users can view answers for accessible questions"
ON public.course_answers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.course_questions q
    JOIN public.user_course_enrollments e ON e.course_id = q.course_id
    WHERE q.id = course_answers.question_id
    AND e.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM public.course_questions q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = course_answers.question_id
    AND c.creator_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Enrolled users can create answers
CREATE POLICY "Enrolled users can create answers"
ON public.course_answers
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.course_questions q
    JOIN public.user_course_enrollments e ON e.course_id = q.course_id
    WHERE q.id = course_answers.question_id
    AND e.user_id = auth.uid()
  )
);

-- Instructors can also create answers
CREATE POLICY "Instructors can create answers"
ON public.course_answers
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.course_questions q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = course_answers.question_id
    AND c.creator_id = auth.uid()
  )
);

-- Users can update their own answers
CREATE POLICY "Users can update their own answers"
ON public.course_answers
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own answers
CREATE POLICY "Users can delete their own answers"
ON public.course_answers
FOR DELETE
USING (auth.uid() = user_id);

-- Instructor can accept answers
CREATE POLICY "Instructors can update answers in their courses"
ON public.course_answers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.course_questions q
    JOIN public.courses c ON c.id = q.course_id
    WHERE q.id = course_answers.question_id
    AND c.creator_id = auth.uid()
  )
);

-- Create indexes for performance
CREATE INDEX idx_course_questions_course_id ON public.course_questions(course_id);
CREATE INDEX idx_course_questions_lesson_id ON public.course_questions(lesson_id);
CREATE INDEX idx_course_answers_question_id ON public.course_answers(question_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_course_questions_updated_at
BEFORE UPDATE ON public.course_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_answers_updated_at
BEFORE UPDATE ON public.course_answers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();