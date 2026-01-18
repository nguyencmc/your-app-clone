import { supabase } from "@/integrations/supabase/client";
import { QuestionBankItem, CreateQuestionInput, UpdateQuestionInput } from "@/types/questionBank";
import { Json } from "@/integrations/supabase/types";

const parseOptions = (options: Json | null): string[] => {
  if (!options) return [];
  if (Array.isArray(options)) {
    return options.map(opt => String(opt));
  }
  return [];
};

export const questionBankService = {
  async fetchQuestions(userId: string): Promise<QuestionBankItem[]> {
    const { data, error } = await supabase
      .from("question_bank")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      options: parseOptions(item.options),
      tags: item.tags || [],
      difficulty: item.difficulty as "easy" | "medium" | "hard",
      type: item.type as "multiple_choice" | "long_answer" | "true_false",
    }));
  },

  async createQuestion(userId: string, input: CreateQuestionInput): Promise<QuestionBankItem> {
    const { data, error } = await supabase
      .from("question_bank")
      .insert([{
        user_id: userId,
        question: input.question,
        type: input.type,
        options: input.options || [],
        correct_answer: input.correct_answer,
        explanation: input.explanation || null,
        points: input.points || 1,
        subject: input.subject || null,
        difficulty: input.difficulty || "medium",
        tags: input.tags || [],
      }])
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      options: parseOptions(data.options),
      tags: data.tags || [],
      difficulty: data.difficulty as "easy" | "medium" | "hard",
      type: data.type as "multiple_choice" | "long_answer" | "true_false",
    };
  },

  async updateQuestion(input: UpdateQuestionInput): Promise<QuestionBankItem> {
    const { id, ...updates } = input;
    const { data, error } = await supabase
      .from("question_bank")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return {
      ...data,
      options: parseOptions(data.options),
      tags: data.tags || [],
      difficulty: data.difficulty as "easy" | "medium" | "hard",
      type: data.type as "multiple_choice" | "long_answer" | "true_false",
    };
  },

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from("question_bank")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async incrementUsageCount(id: string): Promise<void> {
    const { data: current } = await supabase
      .from("question_bank")
      .select("usage_count")
      .eq("id", id)
      .single();

    if (current) {
      await supabase
        .from("question_bank")
        .update({ usage_count: (current.usage_count || 0) + 1 })
        .eq("id", id);
    }
  },

  async importFromExam(userId: string, examId: string): Promise<number> {
    // Fetch exam questions
    const { data: exam, error: examError } = await supabase
      .from("exams")
      .select("questions, subject")
      .eq("id", examId)
      .single();

    if (examError) throw examError;

    const questions = Array.isArray(exam.questions) ? exam.questions : [];
    let importedCount = 0;

    for (const q of questions) {
      const questionData = q as Record<string, unknown>;
      try {
        await supabase.from("question_bank").insert([{
          user_id: userId,
          question: String(questionData.question || questionData.text || ""),
          type: String(questionData.type || "multiple_choice"),
          options: Array.isArray(questionData.options) ? questionData.options : [],
          correct_answer: String(questionData.correctAnswer || questionData.correct_answer || ""),
          explanation: questionData.explanation ? String(questionData.explanation) : null,
          points: Number(questionData.points) || 1,
          subject: exam.subject || null,
          difficulty: "medium",
          tags: [],
        }]);
        importedCount++;
      } catch (e) {
        console.error("Failed to import question:", e);
      }
    }

    return importedCount;
  },

  async getUniqueSubjects(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("question_bank")
      .select("subject")
      .eq("user_id", userId)
      .not("subject", "is", null);

    if (error) throw error;
    const subjects = [...new Set((data || []).map(d => d.subject).filter(Boolean))] as string[];
    return subjects;
  },

  async getUniqueTags(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from("question_bank")
      .select("tags")
      .eq("user_id", userId);

    if (error) throw error;
    const allTags = (data || []).flatMap(d => d.tags || []);
    return [...new Set(allTags)];
  },
};
