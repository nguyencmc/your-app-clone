import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ExamAttempt } from "@/types";
import { examService, authService } from "@/services";
import { Json } from "@/integrations/supabase/types";

export type { ExamAttempt } from "@/types";

export function useExamAttempts() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      const data = await examService.fetchAttempts(user.id);
      setAttempts(data);
    } catch (error) {
      console.error("Error fetching attempts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAttempt = async (
    examId: string,
    answers: Json,
    score: number,
    totalQuestions: number,
    timeSpent: number
  ) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      const data = await examService.saveAttempt(
        user.id,
        examId,
        answers,
        score,
        totalQuestions,
        timeSpent
      );

      toast({
        title: "Exam Submitted",
        description: `Your score: ${score}/${totalQuestions}`,
      });

      await fetchAttempts();
      return data;
    } catch (error) {
      console.error("Error saving attempt:", error);
      toast({
        title: "Error",
        description: "Failed to save exam results.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return { attempts, isLoading, saveAttempt, refetch: fetchAttempts };
}
