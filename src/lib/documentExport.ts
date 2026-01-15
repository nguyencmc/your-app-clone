import { AISuggestion } from "@/types";

export interface ExportOptions {
  title: string;
  courseTitle: string;
  suggestions: AISuggestion[];
  format: 'pdf' | 'word';
}

const typeLabels: Record<string, string> = {
  syllabus: 'Syllabus',
  content: 'Nội dung đề xuất',
  students: 'Phân tích học sinh',
  question: 'Câu hỏi & Trả lời',
};

const formatContent = (suggestion: AISuggestion): string => {
  let content = `\n${'='.repeat(60)}\n`;
  content += `📌 ${typeLabels[suggestion.type] || suggestion.type}\n`;
  content += `📅 ${new Date(suggestion.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}\n`;
  
  if (suggestion.metadata?.duration) {
    content += `⏱️ Thời lượng: ${suggestion.metadata.duration}\n`;
  }
  if (suggestion.metadata?.level) {
    const levelLabels: Record<string, string> = {
      beginner: 'Cơ bản',
      intermediate: 'Trung cấp',
      advanced: 'Nâng cao',
    };
    content += `📊 Cấp độ: ${levelLabels[suggestion.metadata.level] || suggestion.metadata.level}\n`;
  }
  if (suggestion.metadata?.question) {
    content += `❓ Câu hỏi: ${suggestion.metadata.question}\n`;
  }
  
  content += `${'─'.repeat(60)}\n\n`;
  content += suggestion.content;
  content += '\n\n';
  
  return content;
};

export const exportToPDF = async (options: ExportOptions): Promise<void> => {
  const { title, courseTitle, suggestions } = options;
  
  // Create content for PDF
  let fullContent = `${title}\n`;
  fullContent += `Khóa học: ${courseTitle}\n`;
  fullContent += `Xuất ngày: ${new Date().toLocaleDateString('vi-VN')}\n`;
  fullContent += `Tổng số gợi ý: ${suggestions.length}\n`;
  fullContent += '\n';
  
  suggestions.forEach((suggestion) => {
    fullContent += formatContent(suggestion);
  });
  
  // Create a printable HTML document
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Không thể mở cửa sổ mới. Vui lòng cho phép popup.');
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          background: #fff;
        }
        .header {
          text-align: center;
          border-bottom: 3px solid #7c3aed;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #7c3aed;
          margin: 0 0 10px 0;
          font-size: 28px;
        }
        .header .meta {
          color: #666;
          font-size: 14px;
        }
        .suggestion {
          margin-bottom: 30px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .suggestion-header {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          color: white;
          padding: 15px 20px;
        }
        .suggestion-header h2 {
          margin: 0;
          font-size: 18px;
        }
        .suggestion-header .date {
          opacity: 0.9;
          font-size: 13px;
          margin-top: 5px;
        }
        .suggestion-meta {
          background: #f9fafb;
          padding: 12px 20px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
          color: #666;
        }
        .suggestion-meta span {
          margin-right: 20px;
        }
        .suggestion-content {
          padding: 20px;
          white-space: pre-wrap;
          font-size: 14px;
          line-height: 1.8;
        }
        @media print {
          body {
            padding: 20px;
          }
          .suggestion {
            box-shadow: none;
            border: 1px solid #ccc;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📚 ${title}</h1>
        <div class="meta">
          <strong>Khóa học:</strong> ${courseTitle}<br>
          <strong>Xuất ngày:</strong> ${new Date().toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}<br>
          <strong>Tổng số gợi ý:</strong> ${suggestions.length}
        </div>
      </div>
      
      ${suggestions.map((suggestion) => {
        const levelLabels: Record<string, string> = {
          beginner: 'Cơ bản',
          intermediate: 'Trung cấp',
          advanced: 'Nâng cao',
        };
        
        return `
          <div class="suggestion">
            <div class="suggestion-header">
              <h2>${typeLabels[suggestion.type] || suggestion.type}</h2>
              <div class="date">${new Date(suggestion.created_at).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</div>
            </div>
            ${(suggestion.metadata?.duration || suggestion.metadata?.level || suggestion.metadata?.question) ? `
              <div class="suggestion-meta">
                ${suggestion.metadata?.duration ? `<span>⏱️ ${suggestion.metadata.duration}</span>` : ''}
                ${suggestion.metadata?.level ? `<span>📊 ${levelLabels[suggestion.metadata.level] || suggestion.metadata.level}</span>` : ''}
                ${suggestion.metadata?.question ? `<span>❓ ${suggestion.metadata.question}</span>` : ''}
              </div>
            ` : ''}
            <div class="suggestion-content">${escapeHtml(suggestion.content)}</div>
          </div>
        `;
      }).join('')}
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print();
  };
};

export const exportToWord = async (options: ExportOptions): Promise<void> => {
  const { title, courseTitle, suggestions } = options;
  
  const levelLabels: Record<string, string> = {
    beginner: 'Cơ bản',
    intermediate: 'Trung cấp',
    advanced: 'Nâng cao',
  };
  
  // Create HTML content for Word
  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:w="urn:schemas-microsoft-com:office:word" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.5;
          color: #333;
        }
        h1 {
          color: #7c3aed;
          font-size: 24pt;
          text-align: center;
          margin-bottom: 20pt;
        }
        .meta {
          text-align: center;
          color: #666;
          margin-bottom: 30pt;
          font-size: 11pt;
        }
        h2 {
          color: #7c3aed;
          font-size: 16pt;
          border-bottom: 2px solid #7c3aed;
          padding-bottom: 5pt;
          margin-top: 30pt;
        }
        .info {
          background: #f3f4f6;
          padding: 10pt;
          margin-bottom: 15pt;
          font-size: 11pt;
          color: #666;
        }
        .content {
          white-space: pre-wrap;
          margin-bottom: 30pt;
        }
        hr {
          border: none;
          border-top: 1px solid #e5e7eb;
          margin: 30pt 0;
        }
      </style>
    </head>
    <body>
      <h1>📚 ${escapeHtml(title)}</h1>
      <div class="meta">
        <strong>Khóa học:</strong> ${escapeHtml(courseTitle)}<br>
        <strong>Xuất ngày:</strong> ${new Date().toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}<br>
        <strong>Tổng số gợi ý:</strong> ${suggestions.length}
      </div>
      
      ${suggestions.map((suggestion, index) => `
        ${index > 0 ? '<hr>' : ''}
        <h2>${typeLabels[suggestion.type] || suggestion.type}</h2>
        <div class="info">
          📅 ${new Date(suggestion.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
          ${suggestion.metadata?.duration ? ` | ⏱️ ${suggestion.metadata.duration}` : ''}
          ${suggestion.metadata?.level ? ` | 📊 ${levelLabels[suggestion.metadata.level] || suggestion.metadata.level}` : ''}
          ${suggestion.metadata?.question ? `<br>❓ Câu hỏi: ${escapeHtml(suggestion.metadata.question)}` : ''}
        </div>
        <div class="content">${escapeHtml(suggestion.content)}</div>
      `).join('')}
    </body>
    </html>
  `;
  
  // Create blob and download
  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword',
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${title.replace(/[^a-zA-Z0-9\u00C0-\u1EF9]/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export const exportSuggestions = async (options: ExportOptions): Promise<void> => {
  if (options.format === 'pdf') {
    await exportToPDF(options);
  } else {
    await exportToWord(options);
  }
};
