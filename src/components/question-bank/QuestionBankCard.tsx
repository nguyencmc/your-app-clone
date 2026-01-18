import { useState } from "react";
import { Edit, Trash2, Copy, Tag, BookOpen, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QuestionBankItem } from "@/types/questionBank";

interface QuestionBankCardProps {
  question: QuestionBankItem;
  isSelected: boolean;
  onSelect: (id: string, selected: boolean) => void;
  onEdit: (question: QuestionBankItem) => void;
  onDelete: (id: string) => void;
}

const difficultyColors = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

const difficultyLabels = {
  easy: "Dễ",
  medium: "Trung bình",
  hard: "Khó",
};

const typeLabels = {
  multiple_choice: "Trắc nghiệm",
  long_answer: "Tự luận",
  true_false: "Đúng/Sai",
};

export default function QuestionBankCard({
  question,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: QuestionBankCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = () => {
    onDelete(question.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className="border-border/40 bg-card/50 hover:border-primary/30 transition-all group">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => onSelect(question.id, checked as boolean)}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              {/* Question text */}
              <p className="font-medium text-foreground line-clamp-2 mb-2">
                {question.question}
              </p>

              {/* Options preview for multiple choice */}
              {question.type === "multiple_choice" && question.options.length > 0 && (
                <div className="text-sm text-muted-foreground mb-3 space-y-1">
                  {question.options.slice(0, 4).map((opt, idx) => (
                    <div
                      key={idx}
                      className={`truncate ${opt === question.correct_answer ? "text-green-400" : ""}`}
                    >
                      {opt}
                    </div>
                  ))}
                  {question.options.length > 4 && (
                    <div className="text-xs text-muted-foreground/60">
                      +{question.options.length - 4} more options
                    </div>
                  )}
                </div>
              )}

              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant="outline" className={difficultyColors[question.difficulty]}>
                  {difficultyLabels[question.difficulty]}
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                  {typeLabels[question.type]}
                </Badge>
                {question.subject && (
                  <Badge variant="outline" className="bg-muted/50">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {question.subject}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-muted/50">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  {question.usage_count} lần sử dụng
                </Badge>
              </div>

              {/* Tags */}
              {question.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {question.tags.map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(question)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Sửa
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(question.question);
                  }}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Sao chép
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Xóa
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa câu hỏi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa câu hỏi này khỏi ngân hàng? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
