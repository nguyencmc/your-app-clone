import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface CourseContext {
  title: string;
  subject?: string;
  description?: string;
  studentCount?: number;
}

interface StudentPerformance {
  name: string;
  averageScore: number;
  completionRate: number;
  lastActive: string;
}

type AssistantAction = 'generate_syllabus' | 'suggest_content' | 'analyze_students' | 'ask_question';

const ASSISTANT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-course-assistant`;

export const useCourseAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string>("");
  const { toast } = useToast();

  const streamAssistant = useCallback(async (
    action: AssistantAction,
    courseContext: CourseContext,
    additionalData?: {
      duration?: string;
      level?: string;
      goals?: string[];
      question?: string;
      studentPerformance?: StudentPerformance[];
    }
  ) => {
    setIsLoading(true);
    setResponse("");

    try {
      const resp = await fetch(ASSISTANT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ action, courseContext, additionalData }),
      });

      if (!resp.ok) {
        const errorData = await resp.json();
        throw new Error(errorData.error || "Đã xảy ra lỗi");
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullResponse += content;
              setResponse(fullResponse);
            }
          } catch { /* ignore */ }
        }
      }

      return fullResponse;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi";
      toast({
        title: "Lỗi AI Assistant",
        description: message,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const generateSyllabus = useCallback((
    courseContext: CourseContext,
    options?: { duration?: string; level?: string; goals?: string[] }
  ) => {
    return streamAssistant('generate_syllabus', courseContext, options);
  }, [streamAssistant]);

  const suggestContent = useCallback((courseContext: CourseContext) => {
    return streamAssistant('suggest_content', courseContext);
  }, [streamAssistant]);

  const analyzeStudents = useCallback((
    courseContext: CourseContext,
    studentPerformance?: StudentPerformance[]
  ) => {
    return streamAssistant('analyze_students', courseContext, { studentPerformance });
  }, [streamAssistant]);

  const askQuestion = useCallback((courseContext: CourseContext, question: string) => {
    return streamAssistant('ask_question', courseContext, { question });
  }, [streamAssistant]);

  const clearResponse = useCallback(() => {
    setResponse("");
  }, []);

  return {
    isLoading,
    response,
    generateSyllabus,
    suggestContent,
    analyzeStudents,
    askQuestion,
    clearResponse,
  };
};
