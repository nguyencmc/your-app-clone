import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDecks } from '../hooks/useDecks';
import { useDueCards } from '../hooks/useDueCards';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DeckCard } from '../components/DeckCard';
import { Layers, Plus, Clock, LogIn, Play, Zap } from 'lucide-react';

export default function DeckListPage() {
  const { user } = useAuth();
  const { decks, isLoading, createDeck, isCreating } = useDecks();
  const { dueCount } = useDueCards();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createDeck(
      { title: newTitle.trim(), description: newDescription.trim() || undefined },
      {
        onSuccess: () => {
          setIsDialogOpen(false);
          setNewTitle('');
          setNewDescription('');
        },
      }
    );
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
            <h1 className="text-2xl font-bold mb-4">Đăng nhập để sử dụng Flashcards</h1>
            <p className="text-muted-foreground mb-6">
              Tạo và học flashcard với hệ thống lặp lại cách quãng thông minh
            </p>
            <Link to="/auth">
              <Button size="lg">
                <LogIn className="w-4 h-4 mr-2" />
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Flashcards</h1>
                <p className="text-muted-foreground">
                  Học thông minh với lặp lại cách quãng (SM-2)
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {dueCount > 0 && (
                <Link to="/flashcards/today">
                  <Button variant="default" className="gap-2">
                    <Clock className="w-4 h-4" />
                    {dueCount} thẻ đến hạn
                  </Button>
                </Link>
              )}
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo bộ thẻ
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Tạo bộ thẻ mới</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title">Tên bộ thẻ *</Label>
                      <Input
                        id="title"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Ví dụ: Từ vựng TOEIC"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Mô tả</Label>
                      <Textarea
                        id="description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="Mô tả ngắn về bộ thẻ..."
                        rows={3}
                      />
                    </div>
                    <Button
                      onClick={handleCreate}
                      disabled={!newTitle.trim() || isCreating}
                      className="w-full"
                    >
                      {isCreating ? 'Đang tạo...' : 'Tạo bộ thẻ'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Today Quick Access */}
      {dueCount > 0 && (
        <section className="py-6 border-b">
          <div className="container mx-auto px-4">
            <Link to="/flashcards/today">
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Học ngay hôm nay</h3>
                      <p className="text-muted-foreground">
                        {dueCount} thẻ cần ôn tập
                      </p>
                    </div>
                  </div>
                  <Button className="gap-2">
                    <Play className="w-4 h-4" />
                    Bắt đầu
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </section>
      )}

      {/* Decks Grid */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-semibold mb-6">Bộ thẻ của tôi</h2>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-5">
                    <Skeleton className="w-12 h-12 rounded-xl mb-3" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : decks.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Layers className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Chưa có bộ thẻ nào</h2>
              <p className="text-muted-foreground mb-6">
                Tạo bộ thẻ đầu tiên để bắt đầu học
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Tạo bộ thẻ
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((deck) => (
                <DeckCard key={deck.id} deck={deck} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
