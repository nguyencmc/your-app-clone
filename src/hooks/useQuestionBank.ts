import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { questionBankService } from "@/services/questionBankService";
import { QuestionBankItem, QuestionBankFilters, CreateQuestionInput, UpdateQuestionInput } from "@/types/questionBank";

export function useQuestionBank() {
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<QuestionBankFilters>({
    search: "",
    subject: null,
    difficulty: null,
    tags: [],
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchQuestions();
      fetchMetadata();
    }
  }, [user]);

  const fetchQuestions = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await questionBankService.fetchQuestions(user.id);
      setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách câu hỏi",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    if (!user) return;
    try {
      const [subjectsData, tagsData] = await Promise.all([
        questionBankService.getUniqueSubjects(user.id),
        questionBankService.getUniqueTags(user.id),
      ]);
      setSubjects(subjectsData);
      setAllTags(tagsData);
    } catch (error) {
      console.error("Error fetching metadata:", error);
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter(q => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesQuestion = q.question.toLowerCase().includes(searchLower);
        const matchesTags = q.tags.some(t => t.toLowerCase().includes(searchLower));
        if (!matchesQuestion && !matchesTags) return false;
      }

      // Subject filter
      if (filters.subject && q.subject !== filters.subject) return false;

      // Difficulty filter
      if (filters.difficulty && q.difficulty !== filters.difficulty) return false;

      // Tags filter
      if (filters.tags.length > 0) {
        const hasAllTags = filters.tags.every(tag => q.tags.includes(tag));
        if (!hasAllTags) return false;
      }

      return true;
    });
  }, [questions, filters]);

  const createQuestion = async (input: CreateQuestionInput) => {
    if (!user) throw new Error("Not authenticated");
    try {
      const newQuestion = await questionBankService.createQuestion(user.id, input);
      setQuestions(prev => [newQuestion, ...prev]);
      await fetchMetadata();
      toast({
        title: "Thành công",
        description: "Đã thêm câu hỏi vào ngân hàng",
      });
      return newQuestion;
    } catch (error) {
      console.error("Error creating question:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm câu hỏi",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateQuestion = async (input: UpdateQuestionInput) => {
    try {
      const updated = await questionBankService.updateQuestion(input);
      setQuestions(prev => prev.map(q => q.id === updated.id ? updated : q));
      await fetchMetadata();
      toast({
        title: "Thành công",
        description: "Đã cập nhật câu hỏi",
      });
      return updated;
    } catch (error) {
      console.error("Error updating question:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật câu hỏi",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      await questionBankService.deleteQuestion(id);
      setQuestions(prev => prev.filter(q => q.id !== id));
      toast({
        title: "Thành công",
        description: "Đã xóa câu hỏi",
      });
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi",
        variant: "destructive",
      });
      throw error;
    }
  };

  const importFromExam = async (examId: string) => {
    if (!user) throw new Error("Not authenticated");
    try {
      const count = await questionBankService.importFromExam(user.id, examId);
      await fetchQuestions();
      await fetchMetadata();
      toast({
        title: "Thành công",
        description: `Đã import ${count} câu hỏi từ đề thi`,
      });
      return count;
    } catch (error) {
      console.error("Error importing from exam:", error);
      toast({
        title: "Lỗi",
        description: "Không thể import câu hỏi từ đề thi",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    questions: filteredQuestions,
    allQuestions: questions,
    isLoading,
    subjects,
    allTags,
    filters,
    setFilters,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    importFromExam,
    refetch: fetchQuestions,
  };
}
