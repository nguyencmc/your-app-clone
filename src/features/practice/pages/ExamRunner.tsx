import { useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ArrowLeft, ArrowRight, Send, Grid3X3, Loader2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { usePracticeQuestions } from '../hooks/usePracticeQuestions';
import { useExamSession } from '../hooks/useExamSession';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressBar } from '../components/ProgressBar';
import { ExamTimer } from '../components/ExamTimer';
import { QuestionNavigator } from '../components/QuestionNavigator';

export default function ExamRunner() {
  const { setId } = useParams<{ setId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const count = parseInt(searchParams.get('count') || '20', 10);
  const durationMinutes = parseInt(searchParams.get('duration') || '30', 10);

  const {
    data: questions,
    isLoading: questionsLoading,
    error,
  } = usePracticeQuestions({
    setId: setId!,
    limit: count,
    shuffle: true,
    enabled: !!setId && !!user,
  });

  const {
    session,
    answers,
    currentIndex,
    currentQuestion,
    timeLeft,
    isStarted,
    isSubmitting,
    isCompleted,
    answeredCount,
    totalQuestions,
    startExam,
    selectAnswer,
    handleSubmit,
    goToQuestion,
    goNext,
    goPrev,
  } = useExamSession({
    questions: questions || [],
    setId: setId!,
    durationMinutes,
    onComplete: (completedSession) => {
      navigate(`/practice/result/${completedSession.id}`);
    },
  });

  // Auto-redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
    }
  }, [user, authLoading, navigate]);

  // Auto-start exam when questions are loaded
  useEffect(() => {
    if (questions && questions.length > 0 && !isStarted && !isCompleted) {
      startExam();
    }
  }, [questions, isStarted, isCompleted, startExam]);

  if (authLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Đang tải đề thi...</span>
          </div>
          <Skeleton className="h-8 w-full mb-4" />
          <Skeleton className="h-96 w-full" />
        </main>
      </div>
    );
  }

  if (error || !questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-destructive mb-4">
            {questions?.length === 0
              ? 'Không có câu hỏi trong bộ đề này'
              : 'Có lỗi xảy ra khi tải đề thi'}
          </p>
          <Button onClick={() => navigate(`/practice/exam-setup/${setId}`)}>
            Quay lại thiết lập
          </Button>
        </main>
      </div>
    );
  }

  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Timer */}
            <ExamTimer timeLeft={timeLeft} />

            {/* Progress Info */}
            <div className="hidden sm:block flex-1 max-w-xs">
              <ProgressBar
                current={currentIndex + 1}
                total={totalQuestions}
                answered={answeredCount}
              />
            </div>

            {/* Question Navigator Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Grid3X3 className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Câu hỏi</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Danh sách câu hỏi</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <QuestionNavigator
                    totalQuestions={totalQuestions}
                    currentIndex={currentIndex}
                    answers={answers}
                    questionIds={questions.map((q) => q.id)}
                    onNavigate={goToQuestion}
                  />
                </div>
                <div className="mt-6 p-4 rounded-lg bg-muted space-y-2 text-sm">
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Đã trả lời:</span>
                    <span className="font-medium">{answeredCount}/{totalQuestions}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="text-muted-foreground">Còn lại:</span>
                    <span className="font-medium">{totalQuestions - answeredCount}</span>
                  </p>
                </div>
              </SheetContent>
            </Sheet>

            {/* Submit Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="default" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Nộp bài
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận nộp bài?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn đã trả lời {answeredCount}/{totalQuestions} câu hỏi.
                    {answeredCount < totalQuestions && (
                      <span className="block mt-2 text-orange-500">
                        Còn {totalQuestions - answeredCount} câu chưa trả lời!
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Tiếp tục làm bài</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSubmit}>
                    Nộp bài
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Mobile Progress */}
        <div className="sm:hidden mb-4">
          <ProgressBar
            current={currentIndex + 1}
            total={totalQuestions}
            answered={answeredCount}
          />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={totalQuestions}
            selectedAnswer={currentAnswer?.selected || null}
            showResult={false}
            isCorrect={null}
            onSelectAnswer={(choiceId) => selectAnswer(currentQuestion.id, choiceId)}
          />
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Trước
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {totalQuestions}
          </span>

          <Button
            variant="outline"
            onClick={goNext}
            disabled={currentIndex === totalQuestions - 1}
          >
            Tiếp
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
