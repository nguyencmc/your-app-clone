import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

export interface UsageLog {
  id: string;
  user_id: string;
  action: string;
  details: string | null;
  metadata: Json;
  created_at: string;
}

export interface UsageStats {
  examsCreated: number;
  questionsGenerated: number;
  examsTaken: number;
}

export function useUsage() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [stats, setStats] = useState<UsageStats>({
    examsCreated: 0,
    questionsGenerated: 0,
    examsTaken: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsageData();
  }, []);

  const fetchUsageData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch usage logs
      const { data: logsData, error: logsError } = await supabase
        .from("usage_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (logsError) throw logsError;
      setLogs(logsData || []);

      // Fetch exams count
      const { count: examsCount } = await supabase
        .from("exams")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      // Fetch questions count (sum of question_count from exams)
      const { data: examsData } = await supabase
        .from("exams")
        .select("question_count")
        .eq("user_id", user.id);

      const questionsCount = examsData?.reduce((sum, exam) => sum + (exam.question_count || 0), 0) || 0;

      // Fetch exam attempts count
      const { count: attemptsCount } = await supabase
        .from("exam_attempts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setStats({
        examsCreated: examsCount || 0,
        questionsGenerated: questionsCount,
        examsTaken: attemptsCount || 0,
      });
    } catch (error) {
      console.error("Error fetching usage data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logAction = async (action: string, details?: string, metadata?: Json) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("usage_logs")
        .insert([{
          user_id: user.id,
          action,
          details,
          metadata: metadata || {} as Json,
        }]);

      await fetchUsageData();
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  return { logs, stats, isLoading, logAction, refetch: fetchUsageData };
}
