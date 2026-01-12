import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CourseContext {
  title: string;
  subject?: string;
  description?: string;
  studentCount?: number;
}

interface AssistantRequest {
  action: 'generate_syllabus' | 'suggest_content' | 'analyze_students' | 'ask_question';
  courseContext: CourseContext;
  additionalData?: {
    duration?: string;
    level?: string;
    goals?: string[];
    question?: string;
    studentPerformance?: Array<{
      name: string;
      averageScore: number;
      completionRate: number;
      lastActive: string;
    }>;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, courseContext, additionalData } = await req.json() as AssistantRequest;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`AI Course Assistant: Processing ${action} for course "${courseContext.title}"`);

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case 'generate_syllabus':
        systemPrompt = `Bạn là một chuyên gia thiết kế chương trình giảng dạy. Hãy tạo một syllabus chi tiết, chuyên nghiệp bằng tiếng Việt.
        
Syllabus cần bao gồm:
1. Mục tiêu khóa học (3-5 mục tiêu SMART)
2. Yêu cầu đầu vào
3. Nội dung chi tiết theo tuần/bài học
4. Phương pháp đánh giá
5. Tài liệu tham khảo
6. Lịch trình học tập

Format: Sử dụng Markdown với các heading rõ ràng.`;
        
        userPrompt = `Tạo syllabus cho khóa học:
- Tên: ${courseContext.title}
- Môn học: ${courseContext.subject || 'Chung'}
- Mô tả: ${courseContext.description || 'Không có'}
- Thời lượng: ${additionalData?.duration || '12 tuần'}
- Cấp độ: ${additionalData?.level || 'Trung cấp'}
${additionalData?.goals?.length ? `- Mục tiêu mong muốn: ${additionalData.goals.join(', ')}` : ''}`;
        break;

      case 'suggest_content':
        systemPrompt = `Bạn là chuyên gia tư vấn nội dung giáo dục. Đề xuất nội dung bổ sung phù hợp với khóa học bằng tiếng Việt.

Đề xuất cần bao gồm:
1. Bài học/chủ đề bổ sung
2. Tài liệu học tập (sách, video, bài viết)
3. Bài tập thực hành
4. Dự án/assignment
5. Quiz và bài kiểm tra
6. Hoạt động nhóm`;
        
        userPrompt = `Đề xuất nội dung bổ sung cho khóa học:
- Tên: ${courseContext.title}
- Môn học: ${courseContext.subject || 'Chung'}
- Mô tả: ${courseContext.description || 'Không có'}
- Số học sinh: ${courseContext.studentCount || 0}`;
        break;

      case 'analyze_students':
        systemPrompt = `Bạn là chuyên gia phân tích học tập. Phân tích dữ liệu học sinh và xác định những học sinh cần hỗ trợ bằng tiếng Việt.

Phân tích cần bao gồm:
1. Tổng quan tình hình lớp học
2. Danh sách học sinh "at-risk" (điểm thấp, ít hoạt động)
3. Đề xuất can thiệp cụ thể cho từng học sinh
4. Các mẫu học tập cần chú ý
5. Đề xuất cải thiện chung cho lớp`;
        
        const studentData = additionalData?.studentPerformance || [];
        userPrompt = `Phân tích tình hình học tập của lớp:
- Khóa học: ${courseContext.title}
- Số học sinh: ${courseContext.studentCount || studentData.length}

Dữ liệu học sinh:
${studentData.length > 0 
  ? studentData.map(s => `- ${s.name}: Điểm TB ${s.averageScore}%, Hoàn thành ${s.completionRate}%, Hoạt động lần cuối: ${s.lastActive}`).join('\n')
  : 'Chưa có dữ liệu chi tiết. Vui lòng đưa ra các đề xuất chung để theo dõi và hỗ trợ học sinh.'}`;
        break;

      case 'ask_question':
        systemPrompt = `Bạn là trợ lý AI cho giáo viên, giúp trả lời các câu hỏi về quản lý khóa học, phương pháp giảng dạy, và hỗ trợ học sinh. Trả lời bằng tiếng Việt, ngắn gọn và thực tiễn.`;
        
        userPrompt = `Ngữ cảnh khóa học: ${courseContext.title} (${courseContext.subject || 'Chung'})

Câu hỏi: ${additionalData?.question || 'Làm thế nào để cải thiện khóa học này?'}`;
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log(`Sending request to Lovable AI Gateway...`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error("Rate limit exceeded");
        return new Response(JSON.stringify({ error: "Quá nhiều yêu cầu. Vui lòng thử lại sau." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        console.error("Payment required");
        return new Response(JSON.stringify({ error: "Cần nạp thêm credits để sử dụng AI." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Lỗi AI gateway" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response to client...");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });

  } catch (error) {
    console.error("AI Course Assistant error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
