import { useQuery } from '@tanstack/react-query';
import { fetchQuestionSetsByCourse } from '../api';

export function useQuestionSetsByCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ['question-sets', 'course', courseId],
    queryFn: () => fetchQuestionSetsByCourse(courseId!),
    enabled: !!courseId,
  });
}
