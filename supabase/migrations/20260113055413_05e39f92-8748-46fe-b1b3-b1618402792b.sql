-- Add AI suggestions column to courses table
ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS ai_suggestions JSONB DEFAULT '[]'::jsonb;

-- Add AI explanation column to exams table  
ALTER TABLE public.exams
ADD COLUMN IF NOT EXISTS ai_explanations JSONB DEFAULT '{}'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.courses.ai_suggestions IS 'Stores AI-generated suggestions like syllabus, content recommendations';
COMMENT ON COLUMN public.exams.ai_explanations IS 'Stores AI-generated explanations for exam questions';