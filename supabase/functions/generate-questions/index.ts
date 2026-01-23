import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, questionCount = 5, difficulty = 'medium' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!content || content.trim().length < 50) {
      return new Response(JSON.stringify({ error: "Nội dung quá ngắn để tạo câu hỏi" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log('Generate questions request:', { contentLength: content.length, questionCount, difficulty });

    const difficultyMap: Record<string, string> = {
      easy: 'dễ, phù hợp với người mới học',
      medium: 'trung bình, yêu cầu hiểu biết cơ bản',
      hard: 'khó, yêu cầu phân tích và suy luận sâu',
    };

    const systemPrompt = `Bạn là chuyên gia tạo câu hỏi trắc nghiệm chất lượng cao.

Nhiệm vụ: Tạo ${questionCount} câu hỏi trắc nghiệm từ nội dung được cung cấp.
Độ khó: ${difficultyMap[difficulty] || difficultyMap.medium}

Yêu cầu:
- Mỗi câu hỏi có 4 đáp án (A, B, C, D)
- Chỉ có 1 đáp án đúng
- Đáp án sai phải hợp lý, không quá dễ nhận ra
- Kèm giải thích ngắn gọn cho đáp án đúng
- Câu hỏi phải kiểm tra sự hiểu biết, không chỉ ghi nhớ`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Tạo câu hỏi từ nội dung sau:\n\n${content}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_questions",
              description: "Tạo danh sách câu hỏi trắc nghiệm",
              parameters: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question_text: { type: "string", description: "Nội dung câu hỏi" },
                        option_a: { type: "string", description: "Đáp án A" },
                        option_b: { type: "string", description: "Đáp án B" },
                        option_c: { type: "string", description: "Đáp án C" },
                        option_d: { type: "string", description: "Đáp án D" },
                        correct_answer: { type: "string", enum: ["A", "B", "C", "D"], description: "Đáp án đúng" },
                        explanation: { type: "string", description: "Giải thích đáp án" },
                      },
                      required: ["question_text", "option_a", "option_b", "option_c", "option_d", "correct_answer", "explanation"],
                    },
                  },
                },
                required: ["questions"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_questions" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Quá nhiều yêu cầu, vui lòng thử lại sau." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Cần nạp thêm credits để sử dụng AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Lỗi AI gateway" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    console.log('AI response:', JSON.stringify(data, null, 2));

    // Extract questions from tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ questions: parsed.questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Không thể tạo câu hỏi" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate questions error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
