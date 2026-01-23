import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, FileCheck, BookOpen, Clock, AlertTriangle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useQuestionSet } from '../hooks/useQuestionSets';

export default function ExamSetup() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: questionSet, isLoading, error } = useQuestionSet(setId);

  const [questionCount, setQuestionCount] = useState('20');
  const [duration, setDuration] = useState('30');

  const handleStartExam = () => {
    if (!user) {
      navigate('/auth?redirect=' + encodeURIComponent(window.location.pathname));
      return;
    }

    const params = new URLSearchParams({
      count: questionCount,
      duration,
    });
    navigate(`/practice/exam/${setId}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 w-full max-w-xl" />
        </main>
      </div>
    );
  }

  if (error || !questionSet) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-destructive">Không tìm thấy bộ đề</p>
          <Button variant="link" onClick={() => navigate('/practice')}>
            Quay lại
          </Button>
        </main>
      </div>
    );
  }

  const maxQuestions = questionSet.question_count;
  const questionOptions = [10, 20, 30, 50].filter((n) => n <= maxQuestions);
  if (maxQuestions > 0 && !questionOptions.includes(maxQuestions)) {
    questionOptions.push(maxQuestions);
  }

  const durationOptions = [15, 30, 45, 60, 90, 120];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/practice')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <FileCheck className="h-5 w-5" />
                <span>Thiết lập thi thử</span>
              </div>
              <CardTitle className="text-2xl">{questionSet.title}</CardTitle>
              {questionSet.description && (
                <CardDescription>{questionSet.description}</CardDescription>
              )}
              <div className="flex items-center gap-4 pt-2">
                <Badge variant="outline">
                  <BookOpen className="mr-1 h-3 w-3" />
                  {questionSet.question_count} câu hỏi
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Login Warning */}
              {!user && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-700 dark:text-orange-400">
                      Bạn cần đăng nhập
                    </p>
                    <p className="text-muted-foreground">
                      Đăng nhập để lưu kết quả thi và xem lại lịch sử
                    </p>
                  </div>
                </div>
              )}

              {/* Question Count */}
              <div className="space-y-2">
                <Label htmlFor="question-count">Số câu hỏi</Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger id="question-count">
                    <SelectValue placeholder="Chọn số câu" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionOptions.map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {n} câu
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Thời gian làm bài</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger id="duration">
                    <SelectValue placeholder="Chọn thời gian" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationOptions.map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {n} phút
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Exam Info */}
              <div className="p-4 rounded-lg bg-muted/50 space-y-2 text-sm">
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Số câu:</span>
                  <span className="font-medium">{questionCount} câu</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Thời gian:</span>
                  <span className="font-medium">{duration} phút</span>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-muted-foreground">Thời gian/câu:</span>
                  <span className="font-medium">
                    {Math.round((parseInt(duration) * 60) / parseInt(questionCount))} giây
                  </span>
                </p>
              </div>

              {/* Start Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleStartExam}
                disabled={maxQuestions === 0}
              >
                <FileCheck className="mr-2 h-5 w-5" />
                {user ? 'Bắt đầu thi thử' : 'Đăng nhập để thi'}
              </Button>

              {maxQuestions === 0 && (
                <p className="text-sm text-muted-foreground text-center">
                  Bộ đề này chưa có câu hỏi
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
