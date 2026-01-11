import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, ChatContext } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

export function useAITutor() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string, context?: ChatContext) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      conversationHistory.push({
        role: 'user',
        content: content.trim(),
      });

      const contextString = context 
        ? `Môn học: ${context.subject || 'Chung'}${context.examId ? `, Bài thi ID: ${context.examId}` : ''}${context.questionIndex !== undefined ? `, Câu hỏi số: ${context.questionIndex + 1}` : ''}`
        : undefined;

      const { data, error: fnError } = await supabase.functions.invoke('ai-tutor-chat', {
        body: { 
          messages: conversationHistory,
          context: contextString
        },
      });

      if (fnError) throw fnError;

      if (!data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Tutor error:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi gửi tin nhắn');
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
