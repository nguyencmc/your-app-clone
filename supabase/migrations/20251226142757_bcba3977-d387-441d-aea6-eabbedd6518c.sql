-- Create subjects table for managing available subjects
CREATE TABLE public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Everyone can view subjects
CREATE POLICY "Anyone can view subjects"
ON public.subjects
FOR SELECT
USING (true);

-- Only admins can manage subjects
CREATE POLICY "Admins can insert subjects"
ON public.subjects
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update subjects"
ON public.subjects
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete subjects"
ON public.subjects
FOR DELETE
USING (is_admin(auth.uid()));

-- Add trigger for updated_at
CREATE TRIGGER update_subjects_updated_at
BEFORE UPDATE ON public.subjects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();