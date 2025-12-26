-- Add new columns to exams table for enhanced exam creation
ALTER TABLE public.exams 
ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ai_protection BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS randomize_order BOOLEAN DEFAULT false;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_exams_course_id ON public.exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_start_date ON public.exams(start_date);
CREATE INDEX IF NOT EXISTS idx_exams_end_date ON public.exams(end_date);