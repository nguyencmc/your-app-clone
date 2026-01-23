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
import { ArrowLeft, PlayCircle, BookOpen, Settings } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useQuestionSet } from '../hooks/useQuestionSets';

export default function PracticeSetup() {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { data: questionSet, isLoading, error } = useQuestionSet(setId);

  const [questionCount, setQuestionCount] = useState('10');
  const [difficulty, setDifficulty] = useState('all');

  const handleStartPractice = () => {
    const params = new URLSearchParams({
      count: questionCount,
      difficulty,
    });
    navigate(`/practice/run/${setId}?${params.toString()}`);
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
                <Settings className="h-5 w-5" />
                <span>Thiết lập luyện tập</span>
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

              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Độ khó</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Chọn độ khó" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="easy">Dễ (1-2)</SelectItem>
                    <SelectItem value="medium">Trung bình (3)</SelectItem>
                    <SelectItem value="hard">Khó (4-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Button */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleStartPractice}
                disabled={maxQuestions === 0}
              >
                <PlayCircle className="mr-2 h-5 w-5" />
                Bắt đầu luyện tập
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
