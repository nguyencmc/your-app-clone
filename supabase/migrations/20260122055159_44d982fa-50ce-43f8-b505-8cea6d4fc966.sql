-- Tạo bảng lưu tiến độ nghe podcast
CREATE TABLE public.user_podcast_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  current_time_seconds NUMERIC NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  last_played_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, podcast_id)
);

-- Tạo bảng lưu bookmark trong podcast
CREATE TABLE public.podcast_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  podcast_id UUID NOT NULL REFERENCES public.podcasts(id) ON DELETE CASCADE,
  time_seconds NUMERIC NOT NULL,
  label TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_podcast_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_podcast_progress
CREATE POLICY "Users can view their own podcast progress"
ON public.user_podcast_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own podcast progress"
ON public.user_podcast_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own podcast progress"
ON public.user_podcast_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for podcast_bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.podcast_bookmarks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON public.podcast_bookmarks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.podcast_bookmarks FOR DELETE
USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_user_podcast_progress_user ON public.user_podcast_progress(user_id);
CREATE INDEX idx_user_podcast_progress_podcast ON public.user_podcast_progress(podcast_id);
CREATE INDEX idx_podcast_bookmarks_user_podcast ON public.podcast_bookmarks(user_id, podcast_id);