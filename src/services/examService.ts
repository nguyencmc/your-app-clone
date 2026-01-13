import { supabase } from "@/integrations/supabase/client";
import { ExamAttempt, AIExplanation } from "@/types";
import { Json } from "@/integrations/supabase/types";
import { v4 as uuidv4 } from "uuid";

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

  async saveAIExplanation(
    examId: string,
    questionId: string,
    explanation: string
  ): Promise<void> {
    // Fetch current explanations
    const { data: exam, error: fetchError } = await supabase
      .from("exams")
      .select("ai_explanations")
      .eq("id", examId)
      .single();

    if (fetchError) throw fetchError;

    const currentExplanations = (exam.ai_explanations as unknown as Record<string, AIExplanation>) || {};

    const newExplanation: AIExplanation = {
      id: uuidv4(),
      question_id: questionId,
      explanation,
      created_at: new Date().toISOString(),
    };

    const updatedExplanations = {
      ...currentExplanations,
      [questionId]: newExplanation,
    };

    const { error: updateError } = await supabase
      .from("exams")
      .update({ ai_explanations: updatedExplanations as unknown as Json })
      .eq("id", examId);

    if (updateError) throw updateError;
  },

  async getAIExplanations(examId: string): Promise<Record<string, AIExplanation>> {
    const { data, error } = await supabase
      .from("exams")
      .select("ai_explanations")
      .eq("id", examId)
      .single();

    if (error) throw error;
    
    return (data.ai_explanations as unknown as Record<string, AIExplanation>) || {};
  },
};
