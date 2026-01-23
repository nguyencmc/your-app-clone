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
    const { question, options, correctAnswer, userAnswer } = await req.json();

    if (!question || !options || !correctAnswer) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const optionsText = Object.entries(options)
      .filter(([_, value]) => value)
      .map(([key, value]) => `${key.toUpperCase()}. ${value}`)
      .join('\n');

    const userAnswerText = userAnswer 
      ? `Người dùng đã chọn: ${userAnswer}` 
      : 'Người dùng chưa trả lời câu hỏi này';

    const systemPrompt = `Bạn là một giáo viên chuyên nghiệp, nhiệt tình và giỏi giải thích. Nhiệm vụ của bạn là giải thích đáp án cho câu hỏi trắc nghiệm một cách chi tiết, dễ hiểu.

Hãy giải thích:
1. Tại sao đáp án đúng là đúng
2. Tại sao các đáp án khác sai (nếu có)
3. Cung cấp kiến thức liên quan hoặc mẹo ghi nhớ nếu phù hợp

Giải thích ngắn gọn nhưng đầy đủ, sử dụng ngôn ngữ đơn giản, dễ hiểu. Trả lời bằng tiếng Việt.`;

    const userPrompt = `Câu hỏi: ${question}

Các lựa chọn:
${optionsText}

Đáp án đúng: ${correctAnswer}
${userAnswerText}

Hãy giải thích chi tiết tại sao đáp án ${correctAnswer} là đúng.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Quá nhiều yêu cầu, vui lòng thử lại sau.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Cần nạp thêm credits để sử dụng tính năng này.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content;

    if (!explanation) {
      throw new Error('No explanation generated');
    }

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in explain-answer function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
