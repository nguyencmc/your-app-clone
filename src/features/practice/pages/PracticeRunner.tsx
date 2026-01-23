import { useState, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, ArrowRight, Check, RotateCcw } from 'lucide-react';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { usePracticeQuestions } from '../hooks/usePracticeQuestions';
import { QuestionCard } from '../components/QuestionCard';
import { ProgressBar } from '../components/ProgressBar';
import { createAttempt } from '../api';
import type { AnswerState } from '../types';

export default function PracticeRunner() {
  const { setId } = useParams<{ setId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const count = parseInt(searchParams.get('count') || '10', 10);
  const difficulty = (searchParams.get('difficulty') || 'all') as 'all' | 'easy' | 'medium' | 'hard';

  const { data: questions, isLoading, error } = usePracticeQuestions({
    setId: setId!,
    limit: count,
    difficulty,
    shuffle: true,
    enabled: !!setId,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerState>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [stats, setStats] = useState({ correct: 0, wrong: 0 });

  const currentQuestion = questions?.[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;
  const isLastQuestion = questions ? currentIndex === questions.length - 1 : false;

  const handleSelectAnswer = useCallback((choiceId: string) => {
    if (!currentQuestion || currentAnswer?.isChecked) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        selected: choiceId,
        isChecked: false,
        isCorrect: null,
        timeSpent: 0,
      },
    }));
  }, [currentQuestion, currentAnswer]);

  const handleCheck = useCallback(async () => {
    if (!currentQuestion || !currentAnswer?.selected || currentAnswer.isChecked) return;

    setIsChecking(true);
    const isCorrect = currentAnswer.selected === currentQuestion.answer;

    // Update local state
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        ...prev[currentQuestion.id],
        isChecked: true,
        isCorrect,
      },
    }));

    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
    }));

    // Save to database if user is logged in
    if (user) {
      try {
        await createAttempt({
          user_id: user.id,
          question_id: currentQuestion.id,
          mode: 'practice',
          selected: currentAnswer.selected,
          is_correct: isCorrect,
          time_spent_sec: 0,
        });
      } catch (error) {
        console.error('Failed to save attempt:', error);
      }
    }

    setIsChecking(false);
  }, [currentQuestion, currentAnswer, user]);

  const handleNext = useCallback(() => {
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, questions]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswers({});
    setStats({ correct: 0, wrong: 0 });
  };

  const handleFinish = () => {
    navigate('/practice');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 max-w-3xl">
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
              ? 'Không có câu hỏi phù hợp với tiêu chí đã chọn'
              : 'Có lỗi xảy ra khi tải câu hỏi'}
          </p>
          <Button onClick={() => navigate(`/practice/setup/${setId}`)}>
            Quay lại thiết lập
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Progress */}
        <ProgressBar
          current={currentIndex + 1}
          total={questions.length}
          answered={Object.keys(answers).filter((id) => answers[id]?.isChecked).length}
          className="mb-6"
        />

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-green-500" />
            <span>Đúng: {stats.correct}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            <span>Sai: {stats.wrong}</span>
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            selectedAnswer={currentAnswer?.selected || null}
            showResult={currentAnswer?.isChecked || false}
            isCorrect={currentAnswer?.isCorrect || null}
            onSelectAnswer={handleSelectAnswer}
          />
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 gap-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Trước
          </Button>

          <div className="flex gap-2">
            {!currentAnswer?.isChecked ? (
              <Button
                onClick={handleCheck}
                disabled={!currentAnswer?.selected || isChecking}
              >
                <Check className="mr-2 h-4 w-4" />
                Kiểm tra
              </Button>
            ) : isLastQuestion ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRestart}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Làm lại
                </Button>
                <Button onClick={handleFinish}>
                  Hoàn thành
                </Button>
              </div>
            ) : (
              <Button onClick={handleNext}>
                Tiếp theo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={isLastQuestion}
          >
            Tiếp
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
