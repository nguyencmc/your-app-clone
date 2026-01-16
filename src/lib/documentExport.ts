import { AISuggestion } from "@/types";

export interface ExportOptions {
  title: string;
  courseTitle: string;
  suggestions: AISuggestion[];
  format: 'pdf' | 'word';
}

export interface ExamResultExportOptions {
  examTitle: string;
  subject: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  questions: {
    id: string;
    question: string;
    options: string[];
    correct_answer: string;
    user_answer: string;
    explanation?: string;
  }[];
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

export const exportExamResultsToPDF = async (options: ExamResultExportOptions): Promise<void> => {
  const { examTitle, subject, difficulty, score, totalQuestions, timeSpent, questions } = options;
  
  const percentage = Math.round((score / totalQuestions) * 100);
  const minutes = Math.floor(timeSpent / 60);
  const seconds = timeSpent % 60;
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Không thể mở cửa sổ mới. Vui lòng cho phép popup.');
  }
  
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <title>Kết quả thi - ${escapeHtml(examTitle)}</title>
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
        .score-card {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          color: white;
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          margin-bottom: 30px;
        }
        .score-card .score {
          font-size: 64px;
          font-weight: bold;
          margin: 10px 0;
        }
        .score-card .details {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 20px;
          font-size: 14px;
          opacity: 0.9;
        }
        .question-card {
          margin-bottom: 20px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          page-break-inside: avoid;
        }
        .question-card.correct {
          border-left: 4px solid #22c55e;
        }
        .question-card.incorrect {
          border-left: 4px solid #ef4444;
        }
        .question-header {
          background: #f9fafb;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #e5e7eb;
        }
        .question-header h3 {
          margin: 0;
          font-size: 16px;
          flex: 1;
        }
        .question-header .status {
          font-size: 13px;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 500;
        }
        .question-header .status.correct {
          background: #dcfce7;
          color: #16a34a;
        }
        .question-header .status.incorrect {
          background: #fee2e2;
          color: #dc2626;
        }
        .question-content {
          padding: 20px;
        }
        .option {
          padding: 10px 15px;
          margin-bottom: 8px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
        }
        .option.correct-answer {
          background: #dcfce7;
          border-color: #22c55e;
        }
        .option.user-wrong {
          background: #fee2e2;
          border-color: #ef4444;
        }
        .option .badge {
          display: inline-block;
          font-size: 11px;
          padding: 2px 8px;
          border-radius: 10px;
          margin-left: 10px;
        }
        .option .badge.correct {
          background: #22c55e;
          color: white;
        }
        .option .badge.your-answer {
          background: #e5e7eb;
          color: #666;
        }
        .explanation {
          margin-top: 15px;
          padding: 15px;
          background: linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%);
          border-radius: 8px;
          border: 1px solid rgba(124, 58, 237, 0.2);
        }
        .explanation h4 {
          margin: 0 0 8px 0;
          color: #7c3aed;
          font-size: 14px;
        }
        .explanation p {
          margin: 0;
          font-size: 13px;
          color: #555;
          white-space: pre-wrap;
        }
        @media print {
          body {
            padding: 20px;
          }
          .score-card {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📝 ${escapeHtml(examTitle)}</h1>
        <div class="meta">
          <strong>Môn học:</strong> ${escapeHtml(subject)} | 
          <strong>Độ khó:</strong> ${escapeHtml(difficulty)} | 
          <strong>Ngày:</strong> ${new Date().toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
      
      <div class="score-card">
        <div>🏆 Kết quả của bạn</div>
        <div class="score">${percentage}%</div>
        <div>${score}/${totalQuestions} câu đúng</div>
        <div class="details">
          <span>⏱️ Thời gian: ${minutes}:${seconds.toString().padStart(2, '0')}</span>
        </div>
      </div>
      
      <h2 style="margin-bottom: 20px; color: #333;">Chi tiết từng câu hỏi</h2>
      
      ${questions.map((q, index) => {
        const isCorrect = q.user_answer === q.correct_answer;
        return `
          <div class="question-card ${isCorrect ? 'correct' : 'incorrect'}">
            <div class="question-header">
              <h3>Q${index + 1}. ${escapeHtml(q.question)}</h3>
              <span class="status ${isCorrect ? 'correct' : 'incorrect'}">
                ${isCorrect ? '✓ Đúng' : '✗ Sai'}
              </span>
            </div>
            <div class="question-content">
              ${q.options.map(option => {
                const isUserAnswer = q.user_answer === option;
                const isCorrectAnswer = q.correct_answer === option;
                let className = 'option';
                if (isCorrectAnswer) className += ' correct-answer';
                else if (isUserAnswer && !isCorrectAnswer) className += ' user-wrong';
                
                return `
                  <div class="${className}">
                    ${escapeHtml(option)}
                    ${isCorrectAnswer ? '<span class="badge correct">Đáp án đúng</span>' : ''}
                    ${isUserAnswer && !isCorrectAnswer ? '<span class="badge your-answer">Bạn chọn</span>' : ''}
                  </div>
                `;
              }).join('')}
              
              ${q.explanation ? `
                <div class="explanation">
                  <h4>💡 Giải thích AI</h4>
                  <p>${escapeHtml(q.explanation)}</p>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  printWindow.onload = () => {
    printWindow.print();
  };
};
