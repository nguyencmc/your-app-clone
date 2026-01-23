import { supabase } from '@/integrations/supabase/client';
import type { QuestionSet, PracticeQuestion, ExamSession, PracticeAttempt } from './types';

// Question Sets
export async function fetchQuestionSets(filters?: {
  level?: string;
  tags?: string[];
}): Promise<QuestionSet[]> {
  let query = supabase
    .from('question_sets')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (filters?.level && filters.level !== 'all') {
    query = query.eq('level', filters.level);
  }

  if (filters?.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as QuestionSet[];
}

export async function fetchQuestionSetById(id: string): Promise<QuestionSet | null> {
  const { data, error } = await supabase
    .from('question_sets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as QuestionSet;
}

// Questions
export async function fetchQuestionsBySetId(
  setId: string,
  options?: {
    limit?: number;
    difficulty?: 'all' | 'easy' | 'medium' | 'hard';
    tags?: string[];
    shuffle?: boolean;
  }
): Promise<PracticeQuestion[]> {
  let query = supabase
    .from('practice_questions')
    .select('*')
    .eq('set_id', setId);

  // Filter by difficulty
  if (options?.difficulty && options.difficulty !== 'all') {
    switch (options.difficulty) {
      case 'easy':
        query = query.lte('difficulty', 2);
        break;
      case 'medium':
        query = query.eq('difficulty', 3);
        break;
      case 'hard':
        query = query.gte('difficulty', 4);
        break;
    }
  }

  // Filter by tags
  if (options?.tags && options.tags.length > 0) {
    query = query.overlaps('tags', options.tags);
  }

  const { data, error } = await query;
  if (error) throw error;

  let questions = (data || []) as unknown as PracticeQuestion[];

  // Shuffle if requested
  if (options?.shuffle) {
    questions = questions.sort(() => Math.random() - 0.5);
  }

  // Limit
  if (options?.limit && options.limit > 0) {
    questions = questions.slice(0, options.limit);
  }

  return questions;
}

// Exam Sessions
export async function createExamSession(
  userId: string,
  setId: string,
  durationSec: number,
  total: number
): Promise<ExamSession> {
  const { data, error } = await supabase
    .from('practice_exam_sessions')
    .insert({
      user_id: userId,
      set_id: setId,
      duration_sec: durationSec,
      total: total,
      status: 'in_progress',
    })
    .select()
    .single();

  if (error) throw error;
  return data as ExamSession;
}

export async function submitExamSession(
  sessionId: string,
  score: number,
  correct: number
): Promise<ExamSession> {
  const { data, error } = await supabase
    .from('practice_exam_sessions')
    .update({
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      score,
      correct,
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data as ExamSession;
}

export async function fetchExamSessionById(id: string): Promise<ExamSession | null> {
  const { data, error } = await supabase
    .from('practice_exam_sessions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as ExamSession;
}

// Attempts
export async function createAttempt(attempt: {
  user_id: string;
  question_id: string;
  mode: 'practice' | 'exam';
  exam_session_id?: string;
  selected: string | string[];
  is_correct: boolean;
  time_spent_sec: number;
}): Promise<PracticeAttempt> {
  const { data, error } = await supabase
    .from('practice_attempts')
    .insert({
      ...attempt,
      selected: attempt.selected,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PracticeAttempt;
}

export async function createBatchAttempts(
  attempts: Array<{
    user_id: string;
    question_id: string;
    mode: 'practice' | 'exam';
    exam_session_id?: string;
    selected: string | string[];
    is_correct: boolean;
    time_spent_sec: number;
  }>
): Promise<PracticeAttempt[]> {
  const { data, error } = await supabase
    .from('practice_attempts')
    .insert(attempts)
    .select();

  if (error) throw error;
  return data as PracticeAttempt[];
}

export async function fetchWrongAttempts(userId: string, limit = 50): Promise<PracticeAttempt[]> {
  const { data, error } = await supabase
    .from('practice_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_correct', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as PracticeAttempt[];
}

export async function fetchQuestionsByIds(ids: string[]): Promise<PracticeQuestion[]> {
  if (ids.length === 0) return [];
  
  const { data, error } = await supabase
    .from('practice_questions')
    .select('*')
    .in('id', ids);

  if (error) throw error;
  return (data || []) as unknown as PracticeQuestion[];
}

// Question Sets by Course
export async function fetchQuestionSetsByCourse(courseId: string): Promise<QuestionSet[]> {
  const { data, error } = await supabase
    .from('question_sets')
    .select('*')
    .eq('course_id', courseId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as QuestionSet[];
}
