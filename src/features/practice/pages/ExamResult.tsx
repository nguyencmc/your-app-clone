import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Target,
  Clock,
  RotateCcw,
  BookOpen,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { fetchExamSessionById, fetchQuestionSetById } from '../api';

export default function ExamResult() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['exam-session', sessionId],
    queryFn: () => fetchExamSessionById(sessionId!),
    enabled: !!sessionId,
  });

  const { data: questionSet, isLoading: setLoading } = useQuery({
    queryKey: ['question-set', session?.set_id],
    queryFn: () => fetchQuestionSetById(session!.set_id!),
    enabled: !!session?.set_id,
  });

  const isLoading = sessionLoading || setLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg mb-4">Không tìm thấy kết quả thi</p>
          <Button onClick={() => navigate('/practice')}>
            Quay lại ngân hàng đề
          </Button>
        </main>
      </div>
    );
  }

  const scorePercent = session.total > 0 ? (session.correct / session.total) * 100 : 0;
  const isPassed = scorePercent >= 50;
  const wrongCount = session.total - session.correct;

  const getScoreColor = () => {
    if (scorePercent >= 80) return 'text-green-500';
    if (scorePercent >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreMessage = () => {
    if (scorePercent >= 90) return 'Xuất sắc! 🎉';
    if (scorePercent >= 80) return 'Tốt lắm! 👏';
    if (scorePercent >= 70) return 'Khá tốt! 👍';
    if (scorePercent >= 50) return 'Đạt yêu cầu ✓';
    return 'Cần cố gắng thêm 💪';
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
  };

  const timeSpent = session.submitted_at && session.started_at
    ? Math.floor((new Date(session.submitted_at).getTime() - new Date(session.started_at).getTime()) / 1000)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/practice')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại ngân hàng đề
        </Button>

        {/* Result Card */}
        <Card className="mb-6">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4">
              {isPassed ? (
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-green-500" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <Target className="h-10 w-10 text-orange-500" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">{getScoreMessage()}</CardTitle>
            {questionSet && (
              <p className="text-muted-foreground">{questionSet.title}</p>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Display */}
            <div className="text-center">
              <div className={`text-5xl font-bold ${getScoreColor()}`}>
                {session.score}%
              </div>
              <p className="text-muted-foreground mt-1">
                {session.correct}/{session.total} câu đúng
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={scorePercent} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">Câu đúng</span>
                </div>
                <p className="text-2xl font-bold text-green-500">{session.correct}</p>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-muted-foreground">Câu sai</span>
                </div>
                <p className="text-2xl font-bold text-red-500">{wrongCount}</p>
              </div>
            </div>

            {/* Time Info */}
            <div className="p-4 rounded-lg bg-muted/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Thời gian làm bài</span>
              </div>
              <span className="font-medium">{formatDuration(timeSpent)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid gap-4 sm:grid-cols-2">
          {wrongCount > 0 && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/practice/review')}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Ôn lại câu sai ({wrongCount})
            </Button>
          )}
          <Button
            className="w-full"
            onClick={() => navigate(`/practice/exam-setup/${session.set_id}`)}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Thi lại
          </Button>
        </div>

        {/* Badge */}
        {isPassed && (
          <div className="mt-8 text-center">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              <Trophy className="mr-1 h-3 w-3" />
              Đã hoàn thành bài thi
            </Badge>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
