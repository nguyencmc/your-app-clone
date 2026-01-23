-- Create course_certificates table
CREATE TABLE public.course_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  certificate_number VARCHAR(50) NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completion_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  final_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Enable RLS
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own certificates" 
ON public.course_certificates FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view certificates by certificate_number for verification" 
ON public.course_certificates FOR SELECT 
USING (true);

CREATE POLICY "System can insert certificates" 
ON public.course_certificates FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  cert_num TEXT;
BEGIN
  cert_num := 'CERT-' || to_char(now(), 'YYYYMMDD') || '-' || 
              upper(substring(md5(random()::text) from 1 for 6));
  RETURN cert_num;
END;
$$ LANGUAGE plpgsql SET search_path = public;