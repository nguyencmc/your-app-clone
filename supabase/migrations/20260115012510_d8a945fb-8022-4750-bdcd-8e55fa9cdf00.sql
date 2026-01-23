
-- Create storage bucket for course materials (videos, documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-materials', 
  'course-materials', 
  true,
  524288000, -- 500MB limit
  ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'application/x-zip-compressed', 'application/x-rar-compressed', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain']
);

-- Storage policies for course-materials bucket
CREATE POLICY "Course materials are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-materials');

CREATE POLICY "Teachers and admins can upload course materials"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-materials' 
  AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Teachers and admins can update course materials"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-materials' 
  AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Teachers and admins can delete course materials"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-materials' 
  AND (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Add content_type column to course_lessons for lesson type (video, document, test)
ALTER TABLE public.course_lessons 
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'video' CHECK (content_type IN ('video', 'document', 'test'));

-- Create table for lesson attachments (documents, supplementary materials)
CREATE TABLE public.lesson_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for lesson_attachments
ALTER TABLE public.lesson_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for lesson_attachments
CREATE POLICY "Lesson attachments are viewable by everyone"
ON public.lesson_attachments FOR SELECT
USING (true);

CREATE POLICY "Course creator can manage attachments"
ON public.lesson_attachments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM course_lessons cl
    JOIN course_sections cs ON cs.id = cl.section_id
    JOIN courses c ON c.id = cs.course_id
    WHERE cl.id = lesson_attachments.lesson_id
    AND (c.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Create table for course tests/quizzes
CREATE TABLE public.course_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 30,
  pass_percentage INTEGER DEFAULT 70,
  max_attempts INTEGER DEFAULT 3,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for course_tests
ALTER TABLE public.course_tests ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_tests
CREATE POLICY "Course tests are viewable by everyone"
ON public.course_tests FOR SELECT
USING (true);

CREATE POLICY "Course creator can manage tests"
ON public.course_tests FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM course_lessons cl
    JOIN course_sections cs ON cs.id = cl.section_id
    JOIN courses c ON c.id = cs.course_id
    WHERE cl.id = course_tests.lesson_id
    AND (c.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Create table for course test questions
CREATE TABLE public.course_test_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  test_id UUID REFERENCES public.course_tests(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_image TEXT,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT,
  option_d TEXT,
  option_e TEXT,
  option_f TEXT,
  option_g TEXT,
  option_h TEXT,
  correct_answer TEXT NOT NULL, -- Can be 'A', 'B', 'C,D' for multi-select
  explanation TEXT,
  question_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for course_test_questions
ALTER TABLE public.course_test_questions ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_test_questions
CREATE POLICY "Course test questions are viewable by everyone"
ON public.course_test_questions FOR SELECT
USING (true);

CREATE POLICY "Course creator can manage test questions"
ON public.course_test_questions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM course_tests ct
    JOIN course_lessons cl ON cl.id = ct.lesson_id
    JOIN course_sections cs ON cs.id = cl.section_id
    JOIN courses c ON c.id = cs.course_id
    WHERE ct.id = course_test_questions.test_id
    AND (c.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Create table for user test attempts
CREATE TABLE public.course_test_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  test_id UUID REFERENCES public.course_tests(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  answers JSONB,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for course_test_attempts
ALTER TABLE public.course_test_attempts ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_test_attempts
CREATE POLICY "Users can view their own test attempts"
ON public.course_test_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own test attempts"
ON public.course_test_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test attempts"
ON public.course_test_attempts FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at on course_tests
CREATE TRIGGER update_course_tests_updated_at
BEFORE UPDATE ON public.course_tests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
