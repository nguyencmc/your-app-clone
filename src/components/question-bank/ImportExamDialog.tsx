import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface Exam {
  id: string;
  title: string;
  subject: string;
  question_count: number;
  created_at: string;
}

interface ImportExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (examId: string) => Promise<number | void>;
}

export default function ImportExamDialog({
  open,
  onOpenChange,
  onImport,
}: ImportExamDialogProps) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (open && user) {
      fetchExams();
    }
  }, [open, user]);

  const fetchExams = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("id, title, subject, question_count, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedExam) return;
    setIsImporting(true);
    try {
      await onImport(selectedExam);
      onOpenChange(false);
      setSelectedExam(null);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import câu hỏi từ đề thi</DialogTitle>
          <DialogDescription>
            Chọn đề thi để import tất cả câu hỏi vào ngân hàng
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : exams.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Chưa có đề thi nào
            </div>
          ) : (
            <div className="space-y-2">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedExam === exam.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedExam(exam.id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedExam === exam.id}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{exam.title}</h4>
                      <div className="text-sm text-muted-foreground">
                        {exam.subject} • {exam.question_count} câu hỏi
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(exam.created_at).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleImport}
            disabled={!selectedExam || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang import...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Import câu hỏi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
