import { supabase } from "@/integrations/supabase/client";
import { ExamAttempt } from "@/types";
import { Json } from "@/integrations/supabase/types";

export const examService = {
  async fetchAttempts(userId: string): Promise<ExamAttempt[]> {
    const { data, error } = await supabase
      .from("exam_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) throw error;

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

    return attemptsWithExamDetails;
  },

  async saveAttempt(
    userId: string,
    examId: string,
    answers: Json,
    score: number,
    totalQuestions: number,
    timeSpent: number
  ): Promise<ExamAttempt> {
    const { data, error } = await supabase
      .from("exam_attempts")
      .insert([
        {
          user_id: userId,
          exam_id: examId,
          answers,
          score,
          total_questions: totalQuestions,
          time_spent: timeSpent,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
