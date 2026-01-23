import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X,
  BookOpen,
  Layers,
  ArrowLeft
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface FlashcardSet {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  card_count: number | null;
}

interface Flashcard {
  id: string;
  front_text: string;
  back_text: string;
  card_order: number | null;
}

interface UserProgress {
  flashcard_id: string;
  is_remembered: boolean;
}

const Flashcards = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [localProgress, setLocalProgress] = useState<Record<string, boolean>>({});

  // Fetch flashcard sets
  const { data: sets, isLoading: setsLoading } = useQuery({
    queryKey: ["flashcard-sets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("flashcard_sets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as FlashcardSet[];
    },
  });

  // Fetch flashcards for selected set
  const { data: cards, isLoading: cardsLoading } = useQuery({
    queryKey: ["flashcards", selectedSet?.id],
    queryFn: async () => {
      if (!selectedSet) return [];
      const { data, error } = await supabase
        .from("flashcards")
        .select("*")
        .eq("set_id", selectedSet.id)
        .order("card_order", { ascending: true });
      if (error) throw error;
      return data as Flashcard[];
    },
    enabled: !!selectedSet,
  });

  // Fetch user progress
  const { data: userProgress } = useQuery({
    queryKey: ["flashcard-progress", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_flashcard_progress")
        .select("flashcard_id, is_remembered")
        .eq("user_id", user.id);
      if (error) throw error;
      return data as UserProgress[];
    },
    enabled: !!user,
  });

  // Initialize local progress from database
  useEffect(() => {
    if (userProgress) {
      const progressMap: Record<string, boolean> = {};
      userProgress.forEach((p) => {
        progressMap[p.flashcard_id] = p.is_remembered;
      });
      setLocalProgress(progressMap);
    }
  }, [userProgress]);

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ flashcardId, isRemembered }: { flashcardId: string; isRemembered: boolean }) => {
      if (!user) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("user_flashcard_progress")
        .upsert({
          user_id: user.id,
          flashcard_id: flashcardId,
          is_remembered: isRemembered,
          last_reviewed_at: new Date().toISOString(),
          review_count: 1,
        }, {
          onConflict: "user_id,flashcard_id",
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flashcard-progress"] });
    },
  });

  const handleMarkRemembered = (isRemembered: boolean) => {
    if (!cards || cards.length === 0) return;
    
    const currentCard = cards[currentIndex];
    setLocalProgress((prev) => ({
      ...prev,
      [currentCard.id]: isRemembered,
    }));

    if (user) {
      updateProgressMutation.mutate({ 
        flashcardId: currentCard.id, 
        isRemembered 
      });
    }

    toast({
      title: isRemembered ? "Đã đánh dấu nhớ!" : "Đánh dấu chưa nhớ",
      description: isRemembered 
        ? "Thẻ này sẽ được đánh dấu là đã nhớ" 
        : "Bạn có thể ôn lại thẻ này sau",
    });

    // Move to next card
    if (currentIndex < cards.length - 1) {
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      }, 300);
    }
  };

  const goToNext = () => {
    if (cards && currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  };

  const resetCards = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const getRememberedCount = () => {
    if (!cards) return 0;
    return cards.filter((card) => localProgress[card.id]).length;
  };

  const progressPercent = cards ? (getRememberedCount() / cards.length) * 100 : 0;

  if (setsLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show flashcard sets list
  if (!selectedSet) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">Flashcards</h1>
              <p className="text-muted-foreground">
                Học từ vựng hiệu quả với phương pháp thẻ ghi nhớ
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {sets?.map((set) => (
                <Card 
                  key={set.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-border"
                  onClick={() => setSelectedSet(set)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{set.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {set.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="uppercase">
                        {set.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Layers className="w-4 h-4" />
                        <span>{set.card_count} thẻ</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>Bắt đầu học</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {sets?.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có bộ thẻ nào</h3>
                  <p className="text-muted-foreground">
                    Các bộ flashcard sẽ xuất hiện ở đây
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show flashcard study view
  const currentCard = cards?.[currentIndex];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => {
                setSelectedSet(null);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
            
            <h1 className="text-2xl font-bold text-foreground">{selectedSet.title}</h1>
            <p className="text-muted-foreground">{selectedSet.description}</p>
          </div>

          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                Tiến độ: {getRememberedCount()}/{cards?.length || 0} thẻ đã nhớ
              </span>
              <span className="text-muted-foreground">
                Thẻ {currentIndex + 1}/{cards?.length || 0}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {cardsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : currentCard ? (
            <>
              {/* Flashcard */}
              <div 
                className="perspective-1000 mb-6 cursor-pointer"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div 
                  className={`relative w-full h-80 transition-transform duration-500 transform-style-3d ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front */}
                  <Card 
                    className={`absolute inset-0 backface-hidden flex items-center justify-center p-8 ${
                      localProgress[currentCard.id] 
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                        : "border-border"
                    }`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <div className="text-center">
                      <Badge variant="outline" className="mb-4">Mặt trước</Badge>
                      <h2 className="text-3xl font-bold text-foreground">
                        {currentCard.front_text}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-4">
                        Nhấn để lật thẻ
                      </p>
                    </div>
                  </Card>

                  {/* Back */}
                  <Card 
                    className={`absolute inset-0 backface-hidden flex items-center justify-center p-8 ${
                      localProgress[currentCard.id] 
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
                        : "border-border"
                    }`}
                    style={{ 
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <div className="text-center">
                      <Badge variant="outline" className="mb-4">Mặt sau</Badge>
                      <p className="text-xl text-foreground leading-relaxed">
                        {currentCard.back_text}
                      </p>
                      <p className="text-sm text-muted-foreground mt-4">
                        Nhấn để lật thẻ
                      </p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleMarkRemembered(false)}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="w-5 h-5 mr-2" />
                  Chưa nhớ
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleMarkRemembered(true)}
                  className="text-green-600 border-green-600 hover:bg-green-600 hover:text-white dark:text-green-400 dark:border-green-400"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Đã nhớ
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNext}
                  disabled={currentIndex === (cards?.length || 0) - 1}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Reset button */}
              <div className="text-center">
                <Button variant="ghost" onClick={resetCards}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Học lại từ đầu
                </Button>
              </div>
            </>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không có thẻ nào</h3>
                <p className="text-muted-foreground">
                  Bộ flashcard này chưa có thẻ nào
                </p>
              </CardContent>
            </Card>
          )}

          {/* Completion message */}
          {cards && currentIndex === cards.length - 1 && getRememberedCount() === cards.length && (
            <Card className="mt-6 bg-green-50 border-green-500 dark:bg-green-950/20">
              <CardContent className="py-6 text-center">
                <Check className="w-12 h-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">
                  Xuất sắc! Bạn đã nhớ tất cả các thẻ!
                </h3>
                <p className="text-green-600 dark:text-green-500">
                  Hãy tiếp tục ôn luyện để ghi nhớ lâu hơn
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Flashcards;
