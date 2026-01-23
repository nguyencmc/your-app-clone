
-- Add creator_id column to tables that don't have it
ALTER TABLE public.exams ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id);
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id);
ALTER TABLE public.podcasts ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id);
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id);
ALTER TABLE public.question_sets ADD COLUMN IF NOT EXISTS creator_id uuid REFERENCES auth.users(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exams_creator_id ON public.exams(creator_id);
CREATE INDEX IF NOT EXISTS idx_podcasts_creator_id ON public.podcasts(creator_id);
CREATE INDEX IF NOT EXISTS idx_books_creator_id ON public.books(creator_id);
CREATE INDEX IF NOT EXISTS idx_question_sets_creator_id ON public.question_sets(creator_id);

-- ============================================
-- FIX EXAMS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Teachers can update exams" ON public.exams;
DROP POLICY IF EXISTS "Teachers can delete exams" ON public.exams;

-- Teachers can only update their own exams, admins can update all
CREATE POLICY "Teachers can update their own exams"
ON public.exams FOR UPDATE
USING (
  (creator_id = auth.uid() AND has_role(auth.uid(), 'teacher'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Teachers can only delete their own exams, admins can delete all
CREATE POLICY "Teachers can delete their own exams"
ON public.exams FOR DELETE
USING (
  (creator_id = auth.uid() AND has_role(auth.uid(), 'teacher'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Update insert policy to set creator_id
DROP POLICY IF EXISTS "Teachers can create exams" ON public.exams;
CREATE POLICY "Teachers can create exams"
ON public.exams FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  AND (creator_id = auth.uid() OR creator_id IS NULL)
);

-- ============================================
-- FIX QUESTIONS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Teachers can update questions" ON public.questions;
DROP POLICY IF EXISTS "Teachers can delete questions" ON public.questions;

-- Teachers can update questions of exams they created
CREATE POLICY "Teachers can update their own questions"
ON public.questions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.exams 
    WHERE exams.id = questions.exam_id 
    AND (exams.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Teachers can delete questions of exams they created
CREATE POLICY "Teachers can delete their own questions"
ON public.questions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.exams 
    WHERE exams.id = questions.exam_id 
    AND (exams.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- ============================================
-- FIX PODCASTS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Teachers can update podcasts" ON public.podcasts;
DROP POLICY IF EXISTS "Teachers can delete podcasts" ON public.podcasts;

CREATE POLICY "Teachers can update their own podcasts"
ON public.podcasts FOR UPDATE
USING (
  (creator_id = auth.uid() AND has_role(auth.uid(), 'teacher'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Teachers can delete their own podcasts"
ON public.podcasts FOR DELETE
USING (
  (creator_id = auth.uid() AND has_role(auth.uid(), 'teacher'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Teachers can create podcasts" ON public.podcasts;
CREATE POLICY "Teachers can create podcasts"
ON public.podcasts FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  AND (creator_id = auth.uid() OR creator_id IS NULL)
);

-- ============================================
-- FIX BOOKS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Teachers can update books" ON public.books;
DROP POLICY IF EXISTS "Teachers can delete books" ON public.books;

CREATE POLICY "Teachers can update their own books"
ON public.books FOR UPDATE
USING (
  (creator_id = auth.uid() AND has_role(auth.uid(), 'teacher'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Teachers can delete their own books"
ON public.books FOR DELETE
USING (
  (creator_id = auth.uid() AND has_role(auth.uid(), 'teacher'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Teachers can create books" ON public.books;
CREATE POLICY "Teachers can create books"
ON public.books FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  AND (creator_id = auth.uid() OR creator_id IS NULL)
);

-- ============================================
-- FIX QUESTION_SETS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Admins and teachers can manage question sets" ON public.question_sets;

CREATE POLICY "Teachers can update their own question sets"
ON public.question_sets FOR UPDATE
USING (
  (creator_id = auth.uid() AND has_role(auth.uid(), 'teacher'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Teachers can delete their own question sets"
ON public.question_sets FOR DELETE
USING (
  (creator_id = auth.uid() AND has_role(auth.uid(), 'teacher'::app_role))
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Teachers can create question sets"
ON public.question_sets FOR INSERT
WITH CHECK (
  (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
  AND (creator_id = auth.uid() OR creator_id IS NULL)
);

-- ============================================
-- FIX PRACTICE_QUESTIONS TABLE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Admins and teachers can manage practice questions" ON public.practice_questions;

-- Teachers can only manage questions in sets they created
CREATE POLICY "Teachers can insert practice questions"
ON public.practice_questions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.question_sets 
    WHERE question_sets.id = practice_questions.set_id 
    AND (question_sets.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Teachers can update their practice questions"
ON public.practice_questions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.question_sets 
    WHERE question_sets.id = practice_questions.set_id 
    AND (question_sets.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Teachers can delete their practice questions"
ON public.practice_questions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.question_sets 
    WHERE question_sets.id = practice_questions.set_id 
    AND (question_sets.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);
