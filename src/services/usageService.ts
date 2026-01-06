import { supabase } from "@/integrations/supabase/client";
import { UsageLog, UsageStats } from "@/types";
import { Json } from "@/integrations/supabase/types";

export const usageService = {
  async fetchLogs(userId: string): Promise<UsageLog[]> {
    const { data, error } = await supabase
      .from("usage_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  },

  async fetchStats(userId: string): Promise<UsageStats> {
    const { count: examsCount } = await supabase
      .from("exams")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    const { data: examsData } = await supabase
      .from("exams")
      .select("question_count")
      .eq("user_id", userId);

    const questionsCount =
      examsData?.reduce((sum, exam) => sum + (exam.question_count || 0), 0) ||
      0;

    const { count: attemptsCount } = await supabase
      .from("exam_attempts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    return {
      examsCreated: examsCount || 0,
      questionsGenerated: questionsCount,
      examsTaken: attemptsCount || 0,
    };
  },

  async logAction(
    userId: string,
    action: string,
    details?: string,
    metadata?: Json
  ): Promise<void> {
    await supabase.from("usage_logs").insert([
      {
        user_id: userId,
        action,
        details,
        metadata: metadata || ({} as Json),
      },
    ]);
  },
};
