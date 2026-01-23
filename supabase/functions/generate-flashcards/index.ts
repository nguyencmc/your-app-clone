import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, count = 5, content } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let prompt = "";
    
    if (content) {
      // Generate from uploaded content
      prompt = `Dựa trên nội dung sau, tạo ${count} flashcard để học và ôn tập. 
      
Nội dung:
${content}

Tạo flashcard với format JSON array:
[
  {
    "front": "Câu hỏi hoặc khái niệm cần nhớ",
    "back": "Câu trả lời hoặc giải thích chi tiết",
    "hint": "Gợi ý ngắn gọn (tùy chọn)"
  }
]

Yêu cầu:
- Front phải là câu hỏi rõ ràng hoặc khái niệm cần định nghĩa
- Back phải có câu trả lời đầy đủ, dễ hiểu
- Hint là gợi ý nhỏ giúp nhớ (không bắt buộc)
- Chỉ trả về JSON array, không có text khác`;
    } else {
      // Generate from topic
      prompt = `Tạo ${count} flashcard về chủ đề: "${topic}"

Tạo flashcard với format JSON array:
[
  {
    "front": "Câu hỏi hoặc khái niệm cần nhớ",
    "back": "Câu trả lời hoặc giải thích chi tiết",
    "hint": "Gợi ý ngắn gọn (tùy chọn)"
  }
]

Yêu cầu:
- Front phải là câu hỏi rõ ràng hoặc khái niệm quan trọng
- Back phải có câu trả lời đầy đủ, chính xác
- Hint là gợi ý nhỏ giúp nhớ (không bắt buộc)
- Nội dung phải chính xác và hữu ích cho việc học
- Chỉ trả về JSON array, không có text khác`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: "Bạn là trợ lý tạo flashcard chuyên nghiệp. Luôn trả về JSON array hợp lệ với các flashcard chất lượng cao.",
          },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Đã vượt giới hạn request. Vui lòng thử lại sau." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Cần nạp thêm credits để sử dụng AI." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let flashcards;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      } else {
        flashcards = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      throw new Error("Failed to parse flashcards from AI response");
    }

    return new Response(
      JSON.stringify({ flashcards }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating flashcards:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
