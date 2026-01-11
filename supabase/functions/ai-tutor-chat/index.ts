import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, context } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not set');
    }

    const systemPrompt = `Bạn là AI Tutor - trợ lý học tập thông minh, thân thiện và nhiệt tình. Nhiệm vụ của bạn:

1. **Giải thích đáp án**: Khi học sinh hỏi về câu trả lời, hãy giải thích chi tiết tại sao đáp án đó đúng/sai, đưa ra lý do logic và ví dụ minh họa.

2. **Hỗ trợ học tập**: Trả lời mọi câu hỏi về các môn học (Toán, Lý, Hóa, Sinh, Văn, Sử, Địa, Anh...) một cách dễ hiểu, phù hợp với trình độ học sinh.

3. **Phương pháp học**: Đề xuất cách học hiệu quả, mẹo ghi nhớ, và chiến lược làm bài thi.

4. **Động viên**: Luôn khích lệ và tạo động lực cho học sinh, không phán xét khi họ sai.

Quy tắc:
- Trả lời bằng tiếng Việt (trừ khi học sinh hỏi bằng ngôn ngữ khác)
- Sử dụng emoji phù hợp để tạo không khí thân thiện 📚✨
- Chia nhỏ kiến thức phức tạp thành các bước đơn giản
- Đưa ra ví dụ thực tế khi có thể
- Nếu không chắc chắn, hãy thừa nhận và gợi ý nguồn tham khảo

${context ? `Ngữ cảnh hiện tại: ${context}` : ''}`;

    const allMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: allMessages,
        max_tokens: 2048,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ 
      message: assistantMessage,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in ai-tutor-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
