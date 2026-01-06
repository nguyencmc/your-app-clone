import { useState, useEffect } from "react";
import { UsageLog, UsageStats } from "@/types";
import { usageService, authService } from "@/services";
import { Json } from "@/integrations/supabase/types";

export type { UsageLog, UsageStats } from "@/types";

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
      const user = await authService.getCurrentUser();
      if (!user) return;

      const [logsData, statsData] = await Promise.all([
        usageService.fetchLogs(user.id),
        usageService.fetchStats(user.id),
      ]);

      setLogs(logsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching usage data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logAction = async (action: string, details?: string, metadata?: Json) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      await usageService.logAction(user.id, action, details, metadata);
      await fetchUsageData();
    } catch (error) {
      console.error("Error logging action:", error);
    }
  };

  return { logs, stats, isLoading, logAction, refetch: fetchUsageData };
}
