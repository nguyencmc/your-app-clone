-- Drop existing policies for courses
DROP POLICY IF EXISTS "Users can delete their own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update their own courses" ON public.courses;

-- Create new policies for courses - Admin can manage all, Teacher/Creator can manage own
CREATE POLICY "Admins can manage all courses"
ON public.courses
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can update their own courses"
ON public.courses
FOR UPDATE
USING (
  creator_id = auth.uid() AND 
  (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Teachers can delete their own courses"
ON public.courses
FOR DELETE
USING (
  creator_id = auth.uid() AND 
  (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

-- Create course_categories table for better organization
CREATE TABLE IF NOT EXISTS public.course_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  course_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on course_categories
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_categories
CREATE POLICY "Course categories are viewable by everyone"
ON public.course_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage course categories"
ON public.course_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can create course categories"
ON public.course_categories
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add more columns to courses table for Udemy-like features
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.course_categories(id);
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS original_price NUMERIC DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS duration_hours INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS lesson_count INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'beginner';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'vi';
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS student_count INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS preview_video_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS requirements TEXT[];
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS what_you_learn TEXT[];

-- Create course_sections table for curriculum
CREATE TABLE IF NOT EXISTS public.course_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  section_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on course_sections
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Course sections are viewable by everyone"
ON public.course_sections
FOR SELECT
USING (true);

CREATE POLICY "Course creator can manage sections"
ON public.course_sections
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_sections.course_id 
    AND (courses.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Create course_lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID REFERENCES public.course_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  lesson_order INTEGER DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on course_lessons
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons are viewable by everyone"
ON public.course_lessons
FOR SELECT
USING (true);

CREATE POLICY "Section owner can manage lessons"
ON public.course_lessons
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.course_sections cs
    JOIN public.courses c ON c.id = cs.course_id
    WHERE cs.id = course_lessons.section_id 
    AND (c.creator_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Insert default course categories
INSERT INTO public.course_categories (name, slug, description, display_order) VALUES
  ('Phát triển Web', 'phat-trien-web', 'Các khóa học về phát triển website', 1),
  ('Phát triển Mobile', 'phat-trien-mobile', 'Các khóa học về phát triển ứng dụng di động', 2),
  ('Khoa học dữ liệu', 'khoa-hoc-du-lieu', 'Các khóa học về phân tích và xử lý dữ liệu', 3),
  ('Kinh doanh', 'kinh-doanh', 'Các khóa học về kinh doanh và marketing', 4),
  ('Thiết kế', 'thiet-ke', 'Các khóa học về thiết kế đồ họa và UI/UX', 5),
  ('Ngoại ngữ', 'ngoai-ngu', 'Các khóa học về ngôn ngữ', 6),
  ('Lập trình', 'lap-trinh', 'Các khóa học về lập trình cơ bản đến nâng cao', 7),
  ('Marketing', 'marketing', 'Các khóa học về marketing và quảng cáo', 8)
ON CONFLICT (slug) DO NOTHING;