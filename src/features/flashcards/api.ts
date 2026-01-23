import { supabase } from '@/integrations/supabase/client';
import { FlashcardDeck, UserFlashcard, FlashcardReview } from './types';

// ========== DECKS ==========

export async function fetchDecks(userId: string): Promise<FlashcardDeck[]> {
  const { data, error } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as FlashcardDeck[];
}

export async function fetchDeckWithCounts(userId: string): Promise<FlashcardDeck[]> {
  const decks = await fetchDecks(userId);
  
  // Get card counts and due counts for each deck
  const decksWithCounts = await Promise.all(
    decks.map(async (deck) => {
      // Card count
      const { count: cardCount } = await supabase
        .from('user_flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('deck_id', deck.id);
      
      // Due count
      const { count: dueCount } = await supabase
        .from('flashcard_reviews')
        .select('*, user_flashcards!inner(deck_id)', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('user_flashcards.deck_id', deck.id)
        .lte('due_at', new Date().toISOString());
      
      return {
        ...deck,
        card_count: cardCount || 0,
        due_count: dueCount || 0,
      };
    })
  );
  
  return decksWithCounts;
}

export async function createDeck(userId: string, title: string, description?: string): Promise<FlashcardDeck> {
  const { data, error } = await supabase
    .from('flashcard_decks')
    .insert({ user_id: userId, title, description })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as FlashcardDeck;
}

export async function updateDeck(deckId: string, updates: Partial<FlashcardDeck>): Promise<void> {
  const { error } = await supabase
    .from('flashcard_decks')
    .update(updates)
    .eq('id', deckId);

  if (error) throw error;
}

export async function deleteDeck(deckId: string): Promise<void> {
  const { error } = await supabase
    .from('flashcard_decks')
    .delete()
    .eq('id', deckId);

  if (error) throw error;
}

// ========== FLASHCARDS ==========

export async function fetchCards(deckId: string): Promise<UserFlashcard[]> {
  const { data, error } = await supabase
    .from('user_flashcards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as unknown as UserFlashcard[];
}

export async function fetchCardWithReview(cardId: string, userId: string): Promise<UserFlashcard | null> {
  const { data: card, error: cardError } = await supabase
    .from('user_flashcards')
    .select('*')
    .eq('id', cardId)
    .single();

  if (cardError) throw cardError;
  if (!card) return null;

  const { data: review } = await supabase
    .from('flashcard_reviews')
    .select('*')
    .eq('flashcard_id', cardId)
    .eq('user_id', userId)
    .single();

  return {
    ...(card as unknown as UserFlashcard),
    review: review as unknown as FlashcardReview | undefined,
  };
}

export async function createCard(
  deckId: string,
  front: string,
  back: string,
  hint?: string,
  sourceType?: string,
  sourceId?: string
): Promise<UserFlashcard> {
  const { data, error } = await supabase
    .from('user_flashcards')
    .insert({
      deck_id: deckId,
      front,
      back,
      hint: hint || null,
      source_type: sourceType || null,
      source_id: sourceId || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as unknown as UserFlashcard;
}

export async function updateCard(cardId: string, updates: Partial<UserFlashcard>): Promise<void> {
  const { error } = await supabase
    .from('user_flashcards')
    .update(updates)
    .eq('id', cardId);

  if (error) throw error;
}

export async function deleteCard(cardId: string): Promise<void> {
  const { error } = await supabase
    .from('user_flashcards')
    .delete()
    .eq('id', cardId);

  if (error) throw error;
}

// ========== REVIEWS ==========

export async function fetchDueCards(userId: string): Promise<UserFlashcard[]> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('flashcard_reviews')
    .select(`
      *,
      flashcard:user_flashcards(
        *,
        deck:flashcard_decks(*)
      )
    `)
    .eq('user_id', userId)
    .lte('due_at', now)
    .order('due_at', { ascending: true });

  if (error) throw error;
  
  return (data || []).map((r: any) => ({
    ...r.flashcard,
    review: {
      id: r.id,
      user_id: r.user_id,
      flashcard_id: r.flashcard_id,
      due_at: r.due_at,
      interval_days: r.interval_days,
      ease: r.ease,
      repetitions: r.repetitions,
      last_grade: r.last_grade,
      reviewed_at: r.reviewed_at,
    },
  })) as UserFlashcard[];
}

export async function fetchDeckStudyCards(
  deckId: string,
  userId: string,
  limit: number = 20
): Promise<UserFlashcard[]> {
  const now = new Date().toISOString();
  
  // First get due cards for this deck
  const { data: dueReviews } = await supabase
    .from('flashcard_reviews')
    .select(`
      *,
      flashcard:user_flashcards!inner(
        *,
        deck:flashcard_decks(*)
      )
    `)
    .eq('user_id', userId)
    .eq('user_flashcards.deck_id', deckId)
    .lte('due_at', now)
    .order('due_at', { ascending: true })
    .limit(limit);

  const dueCards = (dueReviews || []).map((r: any) => ({
    ...r.flashcard,
    review: {
      id: r.id,
      user_id: r.user_id,
      flashcard_id: r.flashcard_id,
      due_at: r.due_at,
      interval_days: r.interval_days,
      ease: r.ease,
      repetitions: r.repetitions,
      last_grade: r.last_grade,
      reviewed_at: r.reviewed_at,
    },
  })) as UserFlashcard[];

  // If we have enough due cards, return them
  if (dueCards.length >= limit) {
    return dueCards.slice(0, limit);
  }

  // Get new cards (cards without review record) to fill remaining slots
  const remaining = limit - dueCards.length;
  const dueCardIds = dueCards.map(c => c.id);
  
  // Get all cards in deck
  const { data: allCards } = await supabase
    .from('user_flashcards')
    .select('*')
    .eq('deck_id', deckId)
    .order('created_at', { ascending: true })
    .limit(remaining * 2); // Get more to filter

  // Filter out cards that are already in due list
  const newCards = (allCards || [])
    .filter((c: any) => !dueCardIds.includes(c.id))
    .slice(0, remaining)
    .map((c: any) => ({
      ...c,
      review: undefined, // No review record yet
    })) as UserFlashcard[];

  return [...dueCards, ...newCards];
}

export async function upsertReview(
  userId: string,
  flashcardId: string,
  dueAt: Date,
  intervalDays: number,
  ease: number,
  repetitions: number,
  lastGrade: number
): Promise<void> {
  const { error } = await supabase
    .from('flashcard_reviews')
    .upsert(
      {
        user_id: userId,
        flashcard_id: flashcardId,
        due_at: dueAt.toISOString(),
        interval_days: intervalDays,
        ease,
        repetitions,
        last_grade: lastGrade,
        reviewed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,flashcard_id' }
    );

  if (error) throw error;
}

// ========== MISTAKES DECK ==========

export async function getOrCreateMistakesDeck(userId: string): Promise<FlashcardDeck> {
  // Check if Mistakes deck exists
  const { data: existing } = await supabase
    .from('flashcard_decks')
    .select('*')
    .eq('user_id', userId)
    .eq('title', 'Mistakes')
    .single();

  if (existing) {
    return existing as unknown as FlashcardDeck;
  }

  // Create if not exists
  return createDeck(userId, 'Mistakes', 'Flashcards từ các câu trả lời sai');
}

export async function createFlashcardFromQuestion(
  userId: string,
  questionPrompt: string,
  correctAnswer: string,
  explanation: string | null,
  questionId: string
): Promise<void> {
  const deck = await getOrCreateMistakesDeck(userId);
  
  const front = questionPrompt;
  const back = explanation 
    ? `Đáp án: ${correctAnswer}\n\nGiải thích: ${explanation}`
    : `Đáp án: ${correctAnswer}`;
  
  const card = await createCard(deck.id, front, back, undefined, 'question', questionId);
  
  // Create initial review record
  await upsertReview(userId, card.id, new Date(), 0, 2.5, 0, 0);
}
