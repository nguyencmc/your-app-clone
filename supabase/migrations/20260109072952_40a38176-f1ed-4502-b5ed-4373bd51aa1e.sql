-- Create spaced_repetition table to track learning progress
CREATE TABLE public.spaced_repetition (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  question_index INTEGER NOT NULL,
  ease_factor DECIMAL(4,2) NOT NULL DEFAULT 2.5,
  interval INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  next_review_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exam_id, question_index)
);

-- Enable Row Level Security
ALTER TABLE public.spaced_repetition ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own spaced repetition data" 
ON public.spaced_repetition 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own spaced repetition data" 
ON public.spaced_repetition 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own spaced repetition data" 
ON public.spaced_repetition 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own spaced repetition data" 
ON public.spaced_repetition 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_spaced_repetition_updated_at
BEFORE UPDATE ON public.spaced_repetition
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();