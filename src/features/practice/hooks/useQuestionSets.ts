import { useQuery } from '@tanstack/react-query';
import { fetchQuestionSets, fetchQuestionSetById } from '../api';

export function useQuestionSets(filters?: { level?: string; tags?: string[] }) {
  return useQuery({
    queryKey: ['question-sets', filters],
    queryFn: () => fetchQuestionSets(filters),
  });
}

export function useQuestionSet(id: string | undefined) {
  return useQuery({
    queryKey: ['question-set', id],
    queryFn: () => fetchQuestionSetById(id!),
    enabled: !!id,
  });
}
