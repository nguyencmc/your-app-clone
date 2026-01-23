import { useQuery } from '@tanstack/react-query';
import { fetchQuestionsBySetId } from '../api';

interface UsePracticeQuestionsOptions {
  setId: string;
  limit?: number;
  difficulty?: 'all' | 'easy' | 'medium' | 'hard';
  tags?: string[];
  shuffle?: boolean;
  enabled?: boolean;
}

export function usePracticeQuestions({
  setId,
  limit,
  difficulty,
  tags,
  shuffle = true,
  enabled = true,
}: UsePracticeQuestionsOptions) {
  return useQuery({
    queryKey: ['practice-questions', setId, limit, difficulty, tags, shuffle],
    queryFn: () =>
      fetchQuestionsBySetId(setId, {
        limit,
        difficulty,
        tags,
        shuffle,
      }),
    enabled: enabled && !!setId,
    staleTime: 0, // Always refetch to get new random order
  });
}
