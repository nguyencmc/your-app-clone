import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDeckDetail } from '../hooks/useDeckDetail';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DueBadge } from '../components/DueBadge';
import { AIFlashcardGenerator } from '../components/AIFlashcardGenerator';
import {
  ArrowLeft,
  Plus,
  Play,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function DeckDetailPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  const { deck, cards, isLoading, createCard, deleteCard, isCreatingCard } = useDeckDetail(deckId!);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newHint, setNewHint] = useState('');

  const handleCreateCard = () => {
    if (!newFront.trim() || !newBack.trim()) return;
    createCard(
      {
        front: newFront.trim(),
        back: newBack.trim(),
        hint: newHint.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setNewFront('');
          setNewBack('');
          setNewHint('');
        },
      }
    );
  };

  const handleAICardsGenerated = async (cards: { front: string; back: string; hint?: string }[]) => {
    // Create cards one by one
    for (const card of cards) {
      await createCard(
        {
          front: card.front,
          back: card.back,
          hint: card.hint,
        },
        { onSuccess: () => {} }
      );
    }
    setIsAIDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-72 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy bộ thẻ</h1>
          <Link to="/flashcards">
            <Button>Quay lại</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-8">
        <div className="container mx-auto px-4">
          <Link
            to="/flashcards"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{deck.title}</h1>
                <p className="text-muted-foreground">
                  {cards.length} thẻ
                </p>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              {cards.length > 0 && (
                <Link to={`/flashcards/study/${deck.id}`}>
                  <Button className="gap-2">
                    <Play className="w-4 h-4" />
                    Học ngay
                  </Button>
                </Link>
              )}

              {/* AI Generate Button */}
              <Dialog open={isAIDialogOpen} onOpenChange={setIsAIDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10">
                    <Sparkles className="w-4 h-4" />
                    Tạo bằng AI
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Tạo Flashcard bằng AI
                    </DialogTitle>
                  </DialogHeader>
                  <AIFlashcardGenerator
                    onCardsGenerated={handleAICardsGenerated}
                    onClose={() => setIsAIDialogOpen(false)}
                  />
                </DialogContent>
              </Dialog>
              
              {/* Manual Add Button */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Thêm thủ công
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Thêm thẻ mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="front">Mặt trước (Câu hỏi) *</Label>
                      <Textarea
                        id="front"
                        value={newFront}
                        onChange={(e) => setNewFront(e.target.value)}
                        placeholder="Nội dung cần học..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="back">Mặt sau (Đáp án) *</Label>
                      <Textarea
                        id="back"
                        value={newBack}
                        onChange={(e) => setNewBack(e.target.value)}
                        placeholder="Đáp án hoặc giải thích..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hint">Gợi ý (tùy chọn)</Label>
                      <Input
                        id="hint"
                        value={newHint}
                        onChange={(e) => setNewHint(e.target.value)}
                        placeholder="Gợi ý nhỏ..."
                      />
                    </div>
                    <Button
                      onClick={handleCreateCard}
                      disabled={!newFront.trim() || !newBack.trim() || isCreatingCard}
                      className="w-full"
                    >
                      {isCreatingCard ? 'Đang thêm...' : 'Thêm thẻ'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Cards List */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {cards.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Layers className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Chưa có thẻ nào</h2>
              <p className="text-muted-foreground mb-6">
                Thêm thẻ đầu tiên để bắt đầu học
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Thêm thẻ
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map((card) => (
                <Card key={card.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground line-clamp-2 mb-1">
                          {card.front}
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {card.back}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <DueBadge dueAt={card.review?.due_at || null} />
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xóa thẻ này?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteCard(card.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
