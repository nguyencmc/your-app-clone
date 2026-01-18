import { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuestionBankItem, CreateQuestionInput } from "@/types/questionBank";

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: QuestionBankItem | null;
  subjects: string[];
  onSubmit: (data: CreateQuestionInput) => Promise<void>;
}

export default function QuestionFormDialog({
  open,
  onOpenChange,
  question,
  subjects,
  onSubmit,
}: QuestionFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateQuestionInput>({
    question: "",
    type: "multiple_choice",
    options: ["A. ", "B. ", "C. ", "D. "],
    correct_answer: "",
    explanation: "",
    points: 1,
    subject: "",
    difficulty: "medium",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (question) {
      setFormData({
        question: question.question,
        type: question.type,
        options: question.options.length > 0 ? question.options : ["A. ", "B. ", "C. ", "D. "],
        correct_answer: question.correct_answer,
        explanation: question.explanation || "",
        points: question.points,
        subject: question.subject || "",
        difficulty: question.difficulty,
        tags: question.tags,
      });
    } else {
      setFormData({
        question: "",
        type: "multiple_choice",
        options: ["A. ", "B. ", "C. ", "D. "],
        correct_answer: "",
        explanation: "",
        points: 1,
        subject: "",
        difficulty: "medium",
        tags: [],
      });
    }
    setTagInput("");
  }, [question, open]);

  const handleSubmit = async () => {
    if (!formData.question.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOption = () => {
    const nextLetter = String.fromCharCode(65 + (formData.options?.length || 0));
    setFormData(prev => ({
      ...prev,
      options: [...(prev.options || []), `${nextLetter}. `],
    }));
  };

  const removeOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options?.map((opt, i) => (i === index ? value : opt)) || [],
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Question text */}
          <div className="space-y-2">
            <Label>Nội dung câu hỏi *</Label>
            <Textarea
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              placeholder="Nhập nội dung câu hỏi..."
              rows={3}
            />
          </div>

          {/* Type and Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Loại câu hỏi</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  type: value as "multiple_choice" | "long_answer" | "true_false" 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple_choice">Trắc nghiệm</SelectItem>
                  <SelectItem value="true_false">Đúng/Sai</SelectItem>
                  <SelectItem value="long_answer">Tự luận</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Độ khó</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  difficulty: value as "easy" | "medium" | "hard" 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Options for multiple choice */}
          {formData.type === "multiple_choice" && (
            <div className="space-y-2">
              <Label>Các lựa chọn</Label>
              <div className="space-y-2">
                {formData.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + index)}`}
                    />
                    {formData.options && formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {(formData.options?.length || 0) < 8 && (
                <Button type="button" variant="outline" size="sm" onClick={addOption}>
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm lựa chọn
                </Button>
              )}
            </div>
          )}

          {/* Correct answer */}
          <div className="space-y-2">
            <Label>Đáp án đúng *</Label>
            {formData.type === "multiple_choice" ? (
              <Select
                value={formData.correct_answer}
                onValueChange={(value) => setFormData(prev => ({ ...prev, correct_answer: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đáp án đúng" />
                </SelectTrigger>
                <SelectContent>
                  {formData.options?.map((option, index) => (
                    <SelectItem key={index} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Textarea
                value={formData.correct_answer}
                onChange={(e) => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                placeholder="Nhập đáp án đúng..."
                rows={2}
              />
            )}
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label>Giải thích</Label>
            <Textarea
              value={formData.explanation}
              onChange={(e) => setFormData(prev => ({ ...prev, explanation: e.target.value }))}
              placeholder="Nhập giải thích cho đáp án..."
              rows={2}
            />
          </div>

          {/* Subject and Points */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Môn học</Label>
              <Select
                value={formData.subject || "_new_"}
                onValueChange={(value) => {
                  if (value === "_new_") {
                    setFormData(prev => ({ ...prev, subject: "" }));
                  } else {
                    setFormData(prev => ({ ...prev, subject: value }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn môn học" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                  <SelectItem value="_new_">+ Nhập mới</SelectItem>
                </SelectContent>
              </Select>
              {(!formData.subject || formData.subject === "") && (
                <Input
                  value={formData.subject || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Nhập tên môn học mới"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Điểm</Label>
              <Input
                type="number"
                min={1}
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Nhập tag và nhấn Enter"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.tags && formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !formData.question.trim()}>
            {isSubmitting ? "Đang lưu..." : question ? "Cập nhật" : "Thêm câu hỏi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
