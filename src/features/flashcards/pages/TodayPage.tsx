import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDueCards } from '../hooks/useDueCards';
import { useStudySession } from '../hooks/useStudySession';
import { UserFlashcard } from '../types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FlashcardFlip } from '../components/FlashcardFlip';
import { GradeButtons } from '../components/GradeButtons';
import {
  ArrowLeft,
  CheckCircle,
  RotateCcw,
  Layers,
  Clock,
  Play,
  LogIn,
} from 'lucide-react';

export default function TodayPage() {
  const { user } = useAuth();
  const { dueCards, dueCount, cardsByDeck, isLoading, refetch } = useDueCards();
  const [isStudying, setIsStudying] = useState(false);
  const [studyCards, setStudyCards] = useState<UserFlashcard[]>([]);

  const startStudyAll = () => {
    setStudyCards(dueCards);
    setIsStudying(true);
  };

  const startStudyDeck = (cards: UserFlashcard[]) => {
    setStudyCards(cards);
    setIsStudying(true);
  };

  const handleComplete = () => {
    setIsStudying(false);
    setStudyCards([]);
    refetch();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <LogIn className="w-10 h-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Đăng nhập để xem lịch học</h1>
            <Link to="/auth">
              <Button size="lg">Đăng nhập ngay</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (isStudying && studyCards.length > 0) {
    return <StudySessionView cards={studyCards} onComplete={handleComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <Link
            to="/flashcards"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Flashcards
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Hôm nay</h1>
              <p className="text-muted-foreground">
                {dueCount} thẻ cần ôn tập
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : dueCount === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Tuyệt vời! 🎉</h2>
              <p className="text-muted-foreground mb-6">
                Bạn đã hoàn thành tất cả thẻ cần ôn hôm nay
              </p>
              <Link to="/flashcards">
                <Button>Xem các bộ thẻ</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Study All Button */}
              <Card className="mb-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">Ôn tập tất cả</h3>
                    <p className="text-muted-foreground">
                      {dueCount} thẻ từ {cardsByDeck.length} bộ
                    </p>
                  </div>
                  <Button onClick={startStudyAll} size="lg" className="gap-2">
                    <Play className="w-5 h-5" />
                    Bắt đầu
                  </Button>
                </CardContent>
              </Card>

              {/* Decks with due cards */}
              <h3 className="text-lg font-semibold mb-4">Theo bộ thẻ</h3>
              <div className="space-y-4">
                {cardsByDeck.map((group) => (
                  <Card key={group.deckId} className="border-border/50">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Layers className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{group.deckTitle}</h4>
                          <p className="text-sm text-muted-foreground">
                            {group.cards.length} thẻ đến hạn
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">
                          {group.cards.length}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => startStudyDeck(group.cards)}
                          className="gap-1"
                        >
                          <Play className="w-4 h-4" />
                          Học
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StudySessionView({
  cards,
  onComplete,
}: {
  cards: UserFlashcard[];
  onComplete: () => void;
}) {
  const {
    currentCard,
    currentIndex,
    totalCards,
    isFlipped,
    isComplete,
    isSubmitting,
    progress,
    completedCount,
    gradePreviews,
    flip,
    handleGrade,
    reset,
  } = useStudySession(cards);

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Hoàn thành! 🎉</h1>
          <p className="text-muted-foreground mb-8">
            Bạn đã ôn tập xong {completedCount} thẻ
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={reset} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Học lại
            </Button>
            <Button onClick={onComplete}>Hoàn tất</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-2xl mx-auto mb-8">
          <button
            onClick={onComplete}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>

          {/* Progress */}
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {totalCards}
            </span>
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="max-w-2xl mx-auto mb-8">
          {currentCard && (
            <FlashcardFlip
              front={currentCard.front}
              back={currentCard.back}
              hint={currentCard.hint}
              isFlipped={isFlipped}
              onFlip={flip}
            />
          )}
        </div>

        {/* Grade Buttons */}
        <div className="max-w-xl mx-auto">
          {!isFlipped ? (
            <div className="text-center">
              <Button onClick={flip} size="lg" className="px-12">
                Lật thẻ
              </Button>
            </div>
          ) : (
            <GradeButtons
              onGrade={handleGrade}
              previews={gradePreviews}
              disabled={isSubmitting}
            />
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
