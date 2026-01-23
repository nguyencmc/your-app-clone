import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AccuracyStats {
  totalAttempts: number;
  correctAttempts: number;
  accuracy: number;
}

interface RecentExamSession {
  id: string;
  set_id: string | null;
  submitted_at: string;
  score: number;
  correct: number;
  total: number;
  duration_sec: number;
  set_title?: string;
}

interface MostPracticedSet {
  set_id: string;
  title: string;
  attempt_count: number;
}

interface PracticeStats {
  accuracy7Days: AccuracyStats;
  recentExams: RecentExamSession[];
  mostPracticedSet: MostPracticedSet | null;
}

export const usePracticeStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<PracticeStats>({
    accuracy7Days: { totalAttempts: 0, correctAttempts: 0, accuracy: 0 },
    recentExams: [],
    mostPracticedSet: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // 1. Fetch 7-day accuracy from practice_attempts
      const { data: attempts7Days, error: attemptsError } = await supabase
        .from('practice_attempts')
        .select('is_correct')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (attemptsError) throw attemptsError;

      const totalAttempts = attempts7Days?.length || 0;
      const correctAttempts = attempts7Days?.filter(a => a.is_correct).length || 0;
      const accuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

      // 2. Fetch recent 5 exam sessions
      const { data: recentSessions, error: sessionsError } = await supabase
        .from('practice_exam_sessions')
        .select('id, set_id, submitted_at, score, correct, total, duration_sec')
        .eq('user_id', user.id)
        .eq('status', 'submitted')
        .order('submitted_at', { ascending: false })
        .limit(5);

      if (sessionsError) throw sessionsError;

      // Fetch set titles for recent sessions
      let recentExams: RecentExamSession[] = recentSessions || [];
      if (recentSessions && recentSessions.length > 0) {
        const setIds = [...new Set(recentSessions.map(s => s.set_id).filter(Boolean))] as string[];
        
        if (setIds.length > 0) {
          const { data: sets } = await supabase
            .from('question_sets')
            .select('id, title')
            .in('id', setIds);

          recentExams = recentSessions.map(session => ({
            ...session,
            set_title: sets?.find(s => s.id === session.set_id)?.title,
          }));
        }
      }

      // 3. Fetch most practiced set in 7 days
      const { data: attemptsWithQuestions, error: attemptsQError } = await supabase
        .from('practice_attempts')
        .select('question_id')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (attemptsQError) throw attemptsQError;

      let mostPracticedSet: MostPracticedSet | null = null;

      if (attemptsWithQuestions && attemptsWithQuestions.length > 0) {
        const questionIds = attemptsWithQuestions.map(a => a.question_id);
        
        // Get questions with set_id
        const { data: questions } = await supabase
          .from('practice_questions')
          .select('id, set_id')
          .in('id', questionIds);

        if (questions && questions.length > 0) {
          // Count attempts per set
          const setCounts: Record<string, number> = {};
          questions.forEach(q => {
            if (q.set_id) {
              setCounts[q.set_id] = (setCounts[q.set_id] || 0) + 1;
            }
          });

          // Find max
          let maxSetId = '';
          let maxCount = 0;
          Object.entries(setCounts).forEach(([setId, count]) => {
            if (count > maxCount) {
              maxCount = count;
              maxSetId = setId;
            }
          });

          if (maxSetId) {
            const { data: setData } = await supabase
              .from('question_sets')
              .select('id, title')
              .eq('id', maxSetId)
              .maybeSingle();

            if (setData) {
              mostPracticedSet = {
                set_id: setData.id,
                title: setData.title,
                attempt_count: maxCount,
              };
            }
          }
        }
      }

      setStats({
        accuracy7Days: { totalAttempts, correctAttempts, accuracy },
        recentExams,
        mostPracticedSet,
      });
    } catch (err) {
      console.error('Error fetching practice stats:', err);
      setError('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return { stats, loading, error, refetch: fetchStats };
};
