import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  answers: Json;
  score: number;
  total_questions: number;
  time_spent: number;
  completed_at: string;
  created_at: string;
  exam_title?: string;
  exam_subject?: string;
}

export function useExamAttempts() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("exam_attempts")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) throw error;

      // Fetch exam details for each attempt
      const attemptsWithExamDetails = await Promise.all(
        (data || []).map(async (attempt) => {
          const { data: exam } = await supabase
            .from("exams")
            .select("title, subject")
            .eq("id", attempt.exam_id)
            .maybeSingle();

          return {
            ...attempt,
            exam_title: exam?.title || "Deleted Exam",
            exam_subject: exam?.subject || "",
          };
        })
      );

      setAttempts(attemptsWithExamDetails);
    } catch (error) {
      console.error("Error fetching attempts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAttempt = async (
    examId: string,
    answers: Record<string, string>[],
    score: number,
    totalQuestions: number,
    timeSpent: number
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("exam_attempts")
        .insert([{
          user_id: user.id,
          exam_id: examId,
          answers,
          score,
          total_questions: totalQuestions,
          time_spent: timeSpent,
        }])
        .select()
        .single();

      if (error) throw error;

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
