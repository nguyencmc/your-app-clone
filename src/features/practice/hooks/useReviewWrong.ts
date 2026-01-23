import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWrongAttempts, fetchQuestionsByIds } from '../api';
import type { PracticeQuestion } from '../types';

export function useReviewWrong() {
  const { user } = useAuth();

  const wrongAttemptsQuery = useQuery({
    queryKey: ['wrong-attempts', user?.id],
    queryFn: () => fetchWrongAttempts(user!.id),
    enabled: !!user,
  });

  // Get unique question IDs from wrong attempts
  const questionIds = wrongAttemptsQuery.data
    ? [...new Set(wrongAttemptsQuery.data.map((a) => a.question_id))]
    : [];

  const questionsQuery = useQuery({
    queryKey: ['wrong-questions', questionIds],
    queryFn: () => fetchQuestionsByIds(questionIds),
    enabled: questionIds.length > 0,
  });

  // Shuffle questions for review
  const shuffledQuestions: PracticeQuestion[] = questionsQuery.data
    ? [...questionsQuery.data].sort(() => Math.random() - 0.5)
    : [];

  return {
    questions: shuffledQuestions,
    isLoading: wrongAttemptsQuery.isLoading || questionsQuery.isLoading,
    error: wrongAttemptsQuery.error || questionsQuery.error,
    wrongCount: questionIds.length,
  };
}
