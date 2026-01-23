
-- Create table to cache smart recommendations per user per day
CREATE TABLE public.user_smart_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  recommendations jsonb NOT NULL,
  generated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_smart_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can only view their own recommendations
CREATE POLICY "Users can view their own recommendations"
ON public.user_smart_recommendations FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own recommendations
CREATE POLICY "Users can insert their own recommendations"
ON public.user_smart_recommendations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own recommendations
CREATE POLICY "Users can update their own recommendations"
ON public.user_smart_recommendations FOR UPDATE
USING (auth.uid() = user_id);

-- Create index for fast lookup
CREATE INDEX idx_user_smart_recommendations_user_id ON public.user_smart_recommendations(user_id);
CREATE INDEX idx_user_smart_recommendations_generated_at ON public.user_smart_recommendations(generated_at DESC);

-- Add unique constraint - one active recommendation per user
CREATE UNIQUE INDEX idx_user_smart_recommendations_unique_user ON public.user_smart_recommendations(user_id);
