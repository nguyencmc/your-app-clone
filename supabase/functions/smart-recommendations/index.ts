import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Smart recommendations request for user:', userId);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user's exam history
    const { data: attempts } = await supabase
      .from('exam_attempts')
      .select(`
        score,
        correct_answers,
        total_questions,
        exam:exams(title, category_id, difficulty)
      `)
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(10);

    // Fetch available exams
    const { data: exams } = await supabase
      .from('exams')
      .select('id, title, description, difficulty, category_id')
      .limit(20);

    // Fetch flashcard progress
    const { data: flashcardProgress } = await supabase
      .from('user_flashcard_progress')
      .select('is_remembered, review_count')
      .eq('user_id', userId);

    // Build user context
    const userContext = {
      totalExams: attempts?.length || 0,
      averageScore: attempts?.length 
        ? Math.round(attempts.reduce((acc, a) => acc + (a.score || 0), 0) / attempts.length)
        : 0,
      recentExams: attempts?.slice(0, 5).map(a => ({
        title: (a.exam as any)?.title,
        score: a.score,
        difficulty: (a.exam as any)?.difficulty,
      })) || [],
      flashcardStats: {
        total: flashcardProgress?.length || 0,
        remembered: flashcardProgress?.filter(f => f.is_remembered).length || 0,
      },
      availableExams: exams?.map(e => ({
        id: e.id,
        title: e.title,
        difficulty: e.difficulty,
      })) || [],
    };

    console.log('User context:', JSON.stringify(userContext, null, 2));

    const systemPrompt = `Bạn là hệ thống gợi ý học tập thông minh. Dựa trên lịch sử học tập của học sinh, hãy đưa ra các gợi ý phù hợp.

Phân tích:
- Điểm trung bình và xu hướng điểm số
- Độ khó phù hợp dựa trên hiệu suất
- Các chủ đề cần cải thiện
- Flashcards cần ôn tập`;

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
          { role: "user", content: `Dữ liệu học tập của học sinh:\n${JSON.stringify(userContext, null, 2)}\n\nHãy đưa ra gợi ý học tập.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_recommendations",
              description: "Tạo danh sách gợi ý học tập cho học sinh",
              parameters: {
                type: "object",
                properties: {
                  summary: { type: "string", description: "Tóm tắt ngắn về hiệu suất học tập" },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Điểm mạnh của học sinh",
                  },
                  improvements: {
                    type: "array",
                    items: { type: "string" },
                    description: "Các điểm cần cải thiện",
                  },
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["exam", "flashcard", "practice", "review"], description: "Loại gợi ý" },
                        title: { type: "string", description: "Tiêu đề gợi ý" },
                        description: { type: "string", description: "Mô tả chi tiết" },
                        priority: { type: "string", enum: ["high", "medium", "low"], description: "Mức độ ưu tiên" },
                        examId: { type: "string", description: "ID bài thi (nếu có)" },
                      },
                      required: ["type", "title", "description", "priority"],
                    },
                  },
                  suggestedDifficulty: { type: "string", enum: ["easy", "medium", "hard"], description: "Độ khó phù hợp" },
                },
                required: ["summary", "strengths", "improvements", "recommendations", "suggestedDifficulty"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_recommendations" } },
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

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Không thể tạo gợi ý" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Smart recommendations error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
