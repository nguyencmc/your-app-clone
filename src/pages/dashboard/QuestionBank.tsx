import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Download,
  Filter,
  BookOpen,
  Tag,
  Loader2,
  Library,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import QuestionBankCard from "@/components/question-bank/QuestionBankCard";
import QuestionFormDialog from "@/components/question-bank/QuestionFormDialog";
import ImportExamDialog from "@/components/question-bank/ImportExamDialog";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { QuestionBankItem, CreateQuestionInput, UpdateQuestionInput } from "@/types/questionBank";

export default function QuestionBank() {
  const navigate = useNavigate();
  const {
    questions,
    allQuestions,
    isLoading,
    subjects,
    allTags,
    filters,
    setFilters,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    importFromExam,
  } = useQuestionBank();

  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());

  const handleEditQuestion = (question: QuestionBankItem) => {
    setEditingQuestion(question);
    setShowFormDialog(true);
  };

  const handleFormSubmit = async (data: CreateQuestionInput) => {
    if (editingQuestion) {
      await updateQuestion({ id: editingQuestion.id, ...data } as UpdateQuestionInput);
    } else {
      await createQuestion(data);
    }
    setEditingQuestion(null);
  };

  const handleSelectQuestion = (id: string, selected: boolean) => {
    setSelectedQuestions(prev => {
      const next = new Set(prev);
      if (selected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.size === questions.length) {
      setSelectedQuestions(new Set());
    } else {
      setSelectedQuestions(new Set(questions.map(q => q.id)));
    }
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      subject: null,
      difficulty: null,
      tags: [],
    });
  };

  const hasActiveFilters = filters.search || filters.subject || filters.difficulty || filters.tags.length > 0;

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background flex w-full">
        <DashboardSidebar />
      
      <main className="flex-1 p-4 lg:p-8 lg:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
                  <Library className="w-8 h-8 text-primary" />
                  Ngân hàng câu hỏi
                </h1>
                <p className="text-muted-foreground mt-1">
                  Quản lý và tái sử dụng câu hỏi giữa các đề thi
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Import từ đề thi
                </Button>
                <Button onClick={() => {
                  setEditingQuestion(null);
                  setShowFormDialog(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm câu hỏi
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border/40 rounded-lg p-4">
              <div className="text-2xl font-bold">{allQuestions.length}</div>
              <div className="text-sm text-muted-foreground">Tổng câu hỏi</div>
            </div>
            <div className="bg-card border border-border/40 rounded-lg p-4">
              <div className="text-2xl font-bold">{subjects.length}</div>
              <div className="text-sm text-muted-foreground">Môn học</div>
            </div>
            <div className="bg-card border border-border/40 rounded-lg p-4">
              <div className="text-2xl font-bold">{allTags.length}</div>
              <div className="text-sm text-muted-foreground">Tags</div>
            </div>
            <div className="bg-card border border-border/40 rounded-lg p-4">
              <div className="text-2xl font-bold">
                {allQuestions.reduce((sum, q) => sum + q.usage_count, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Lượt sử dụng</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border/40 rounded-lg p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm câu hỏi hoặc tag..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10"
                />
              </div>

              {/* Subject filter */}
              <Select
                value={filters.subject || "_all_"}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  subject: value === "_all_" ? null : value 
                }))}
              >
                <SelectTrigger className="w-full lg:w-[180px]">
                  <BookOpen className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Môn học" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all_">Tất cả môn</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty filter */}
              <Select
                value={filters.difficulty || "_all_"}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  difficulty: value === "_all_" ? null : value 
                }))}
              >
                <SelectTrigger className="w-full lg:w-[150px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_all_">Tất cả</SelectItem>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            {/* Tags filter */}
            {allTags.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {allTags.slice(0, 10).map(tag => (
                    <Badge
                      key={tag}
                      variant={filters.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        setFilters(prev => ({
                          ...prev,
                          tags: prev.tags.includes(tag)
                            ? prev.tags.filter(t => t !== tag)
                            : [...prev.tags, tag],
                        }));
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {allTags.length > 10 && (
                    <span className="text-sm text-muted-foreground">
                      +{allTags.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Selection actions */}
          {selectedQuestions.size > 0 && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 mb-4 flex items-center justify-between">
              <span className="text-sm">
                Đã chọn {selectedQuestions.size} câu hỏi
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedQuestions(new Set())}>
                  Bỏ chọn
                </Button>
              </div>
            </div>
          )}

          {/* Questions list */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <Library className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {hasActiveFilters ? "Không tìm thấy câu hỏi" : "Chưa có câu hỏi nào"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Thử thay đổi bộ lọc để tìm kiếm"
                  : "Thêm câu hỏi mới hoặc import từ đề thi có sẵn"}
              </p>
              {!hasActiveFilters && (
                <div className="flex items-center justify-center gap-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(true)}>
                    <Download className="w-4 h-4 mr-2" />
                    Import từ đề thi
                  </Button>
                  <Button onClick={() => setShowFormDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm câu hỏi
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {selectedQuestions.size === questions.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {questions.length} câu hỏi
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {questions.map(question => (
                  <QuestionBankCard
                    key={question.id}
                    question={question}
                    isSelected={selectedQuestions.has(question.id)}
                    onSelect={handleSelectQuestion}
                    onEdit={handleEditQuestion}
                    onDelete={deleteQuestion}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {/* Form Dialog */}
      <QuestionFormDialog
        open={showFormDialog}
        onOpenChange={(open) => {
          setShowFormDialog(open);
          if (!open) setEditingQuestion(null);
        }}
        question={editingQuestion}
        subjects={subjects}
        onSubmit={handleFormSubmit}
      />

      {/* Import Dialog */}
      {/* Import Dialog */}
      <ImportExamDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={importFromExam}
      />
      </div>
    </SidebarProvider>
  );
}
