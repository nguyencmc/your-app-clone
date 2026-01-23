-- =============================================
-- FLASHCARD DECKS (User-owned decks)
-- =============================================
CREATE TABLE public.flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.flashcard_decks ENABLE ROW LEVEL SECURITY;

-- RLS policies for flashcard_decks
CREATE POLICY "Users can view their own decks"
  ON public.flashcard_decks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own decks"
  ON public.flashcard_decks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own decks"
  ON public.flashcard_decks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own decks"
  ON public.flashcard_decks FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- USER FLASHCARDS (Cards in user decks)
-- =============================================
CREATE TABLE public.user_flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  hint TEXT,
  source_type TEXT, -- manual, question, lesson, podcast, book
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_flashcards ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_flashcards (based on deck ownership)
CREATE POLICY "Users can view cards in their decks"
  ON public.user_flashcards FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.flashcard_decks
    WHERE flashcard_decks.id = user_flashcards.deck_id
    AND flashcard_decks.user_id = auth.uid()
  ));

CREATE POLICY "Users can create cards in their decks"
  ON public.user_flashcards FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.flashcard_decks
    WHERE flashcard_decks.id = user_flashcards.deck_id
    AND flashcard_decks.user_id = auth.uid()
  ));

CREATE POLICY "Users can update cards in their decks"
  ON public.user_flashcards FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.flashcard_decks
    WHERE flashcard_decks.id = user_flashcards.deck_id
    AND flashcard_decks.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete cards in their decks"
  ON public.user_flashcards FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.flashcard_decks
    WHERE flashcard_decks.id = user_flashcards.deck_id
    AND flashcard_decks.user_id = auth.uid()
  ));

-- =============================================
-- FLASHCARD REVIEWS (SRS State - SM-2)
-- =============================================
CREATE TABLE public.flashcard_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  flashcard_id UUID NOT NULL REFERENCES public.user_flashcards(id) ON DELETE CASCADE,
  due_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  interval_days INTEGER NOT NULL DEFAULT 0,
  ease NUMERIC NOT NULL DEFAULT 2.5,
  repetitions INTEGER NOT NULL DEFAULT 0,
  last_grade INTEGER, -- 0..5 (SM-2 grade)
  reviewed_at TIMESTAMPTZ,
  UNIQUE(user_id, flashcard_id)
);

-- Enable RLS
ALTER TABLE public.flashcard_reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for flashcard_reviews
CREATE POLICY "Users can view their own reviews"
  ON public.flashcard_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reviews"
  ON public.flashcard_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.flashcard_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.flashcard_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Index for due cards query
CREATE INDEX idx_flashcard_reviews_due ON public.flashcard_reviews(user_id, due_at);
CREATE INDEX idx_user_flashcards_deck ON public.user_flashcards(deck_id);