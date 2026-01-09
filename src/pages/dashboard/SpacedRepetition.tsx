import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain,
  Calendar,
  CheckCircle2,
  Clock,
  RotateCcw,
  Zap,
  Menu,
  Plus,
  BookOpen,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ReviewRating, SpacedRepetitionCard } from "@/types/spacedRepetition";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";

interface Question {
  question: string;
  options: string[];
  correct_answer: number;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
  question_count: number;
}

const SpacedRepetition = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const {
    cards,
    stats,
    isLoading,
    reviewCard,
    addFromExam,
    isReviewing,
  } = useSpacedRepetition();

  // Fetch exams for the current user
  const { data: exams = [] } = useQuery({
    queryKey: ["exams", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("id, title, subject, questions, question_count")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data as unknown as Exam[]) || [];
    },
    enabled: !!user?.id,
  });

  // Get current card and its exam/question data
  const currentCard = cards[currentIndex] as SpacedRepetitionCard | undefined;

  const { data: currentExam } = useQuery({
    queryKey: ["exam", currentCard?.exam_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select("id, title, subject, questions")
        .eq("id", currentCard!.exam_id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Exam | null;
    },
    enabled: !!currentCard?.exam_id,
  });

  const currentQuestion = currentExam?.questions?.[currentCard?.question_index || 0];

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const handleRating = (rating: ReviewRating) => {
    if (!currentCard) return;

    reviewCard(
      {
        cardId: currentCard.id,
        rating,
        currentCard,
      },
      {
        onSuccess: () => {
          setShowAnswer(false);
          if (currentIndex >= cards.length - 1) {
            setCurrentIndex(0);
          }
          toast.success(
            rating === "easy"
              ? "Tuyệt vời! Câu hỏi sẽ xuất hiện lại sau vài ngày"
              : rating === "good"
              ? "Tốt lắm! Tiếp tục ôn tập nhé"
              : rating === "hard"
              ? "Cần ôn thêm, câu hỏi sẽ xuất hiện sớm hơn"
              : "Đừng lo, câu hỏi sẽ xuất hiện lại ngay"
          );
        },
      }
    );
  };

  const handleAddExam = (examId: string, questionCount: number) => {
    addFromExam(
      { examId, questionCount },
      {
        onSuccess: () => {
          toast.success("Đã thêm câu hỏi vào bộ ôn tập!");
          setAddDialogOpen(false);
        },
        onError: () => {
          toast.error("Có lỗi xảy ra");
        },
      }
    );
  };

  const progressPercent =
    stats.totalCards > 0 ? (stats.learned / stats.totalCards) * 100 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar
          userName={userName}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 lg:px-6 h-14 flex items-center gap-4">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-full"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Spaced Repetition</h1>
            </div>
            <div className="flex-1" />
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Thêm bài thi</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thêm câu hỏi từ bài thi</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 max-h-96 overflow-auto">
                  {exams.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Chưa có bài thi nào. Hãy tạo bài thi trước!
                    </p>
                  ) : (
                    exams.map((exam) => (
                      <Card
                        key={exam.id}
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() =>
                          handleAddExam(exam.id, exam.question_count)
                        }
                      >
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-medium">{exam.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {exam.subject} • {exam.question_count} câu hỏi
                            </p>
                          </div>
                          <BookOpen className="h-5 w-5 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </header>

          <div className="p-4 lg:p-6 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/20">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.dueToday}</p>
                    <p className="text-sm text-muted-foreground">
                      Cần ôn hôm nay
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.learned}</p>
                    <p className="text-sm text-muted-foreground">Đã thuộc</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Brain className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalCards}</p>
                    <p className="text-sm text-muted-foreground">Tổng câu hỏi</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Tiến độ học tập
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {stats.learned} / {stats.totalCards} câu đã thuộc
                    </span>
                    <span className="font-medium">
                      {progressPercent.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Review Card */}
            {cards.length > 0 && currentQuestion ? (
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">
                      {currentExam?.title || "Đang tải..."}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {currentIndex + 1} / {cards.length}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question */}
                  <div className="min-h-[120px]">
                    <p className="text-lg font-medium">
                      {currentQuestion.question}
                    </p>
                  </div>

                  {/* Options / Answer */}
                  {!showAnswer ? (
                    <div className="space-y-3">
                      {currentQuestion.options.map((option, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg border bg-muted/30 text-sm"
                        >
                          <span className="font-medium mr-2">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {option}
                        </div>
                      ))}
                      <Button
                        className="w-full mt-4"
                        onClick={() => setShowAnswer(true)}
                      >
                        Hiện đáp án
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                          Đáp án đúng:
                        </p>
                        <p className="font-medium">
                          {String.fromCharCode(
                            65 + currentQuestion.correct_answer
                          )}
                          . {currentQuestion.options[currentQuestion.correct_answer]}
                        </p>
                      </div>

                      <p className="text-center text-sm text-muted-foreground">
                        Bạn nhớ câu này như thế nào?
                      </p>

                      <div className="grid grid-cols-4 gap-2">
                        <Button
                          variant="outline"
                          className="flex-col h-auto py-3 border-red-500/50 hover:bg-red-500/10"
                          onClick={() => handleRating("again")}
                          disabled={isReviewing}
                        >
                          <RotateCcw className="h-4 w-4 mb-1 text-red-500" />
                          <span className="text-xs">Quên</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-col h-auto py-3 border-orange-500/50 hover:bg-orange-500/10"
                          onClick={() => handleRating("hard")}
                          disabled={isReviewing}
                        >
                          <Clock className="h-4 w-4 mb-1 text-orange-500" />
                          <span className="text-xs">Khó</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-col h-auto py-3 border-blue-500/50 hover:bg-blue-500/10"
                          onClick={() => handleRating("good")}
                          disabled={isReviewing}
                        >
                          <CheckCircle2 className="h-4 w-4 mb-1 text-blue-500" />
                          <span className="text-xs">Tốt</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-col h-auto py-3 border-green-500/50 hover:bg-green-500/10"
                          onClick={() => handleRating("easy")}
                          disabled={isReviewing}
                        >
                          <Zap className="h-4 w-4 mb-1 text-green-500" />
                          <span className="text-xs">Dễ</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2 border-dashed">
                <CardContent className="py-12 text-center">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    {stats.totalCards === 0
                      ? "Chưa có câu hỏi nào"
                      : "Đã hoàn thành ôn tập hôm nay!"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {stats.totalCards === 0
                      ? "Thêm câu hỏi từ các bài thi để bắt đầu ôn tập"
                      : "Quay lại vào ngày mai để tiếp tục ôn tập"}
                  </p>
                  {stats.totalCards === 0 && (
                    <Button onClick={() => setAddDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm bài thi
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default SpacedRepetition;
