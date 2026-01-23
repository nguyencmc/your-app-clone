import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  Play, 
  RotateCcw, 
  Zap, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  LogIn,
  BookOpen,
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react';

interface InProgressSession {
  id: string;
  set_id: string | null;
  started_at: string;
  total: number;
}

interface WrongAnswerStats {
  count: number;
  questionIds: string[];
}

interface LastPracticeSet {
  id: string;
  title: string;
}

interface Recommendation {
  type: 'exam' | 'flashcard' | 'practice' | 'review';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  examId?: string;
}

interface SmartRecommendationsData {
  summary: string;
  strengths: string[];
  improvements: string[];
  recommendations: Recommendation[];
  suggestedDifficulty: 'easy' | 'medium' | 'hard';
}

// Check if date is today
const isToday = (dateStr: string) => {
  const date = new Date(dateStr);
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const PracticeTodayWidget = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [inProgressSession, setInProgressSession] = useState<InProgressSession | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswerStats>({ count: 0, questionIds: [] });
  const [lastPracticeSet, setLastPracticeSet] = useState<LastPracticeSet | null>(null);
  
  // Smart recommendations state
  const [smartData, setSmartData] = useState<SmartRecommendationsData | null>(null);
  const [smartLoading, setSmartLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  // Moved useEffect after function definitions - see end of functions block

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch in-progress exam session
      const { data: sessions } = await supabase
        .from('practice_exam_sessions')
        .select('id, set_id, started_at, total')
        .eq('user_id', user?.id)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        setInProgressSession(sessions[0]);
      }

      // Fetch wrong answers (distinct question_ids)
      const { data: wrongAttempts } = await supabase
        .from('practice_attempts')
        .select('question_id')
        .eq('user_id', user?.id)
        .eq('is_correct', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (wrongAttempts && wrongAttempts.length > 0) {
        const uniqueQuestionIds = [...new Set(wrongAttempts.map(a => a.question_id))].slice(0, 10);
        setWrongAnswers({
          count: uniqueQuestionIds.length,
          questionIds: uniqueQuestionIds,
        });
      }

      // Fetch last practiced set (from attempts -> questions -> set_id)
      const { data: recentAttempts } = await supabase
        .from('practice_attempts')
        .select('question_id')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentAttempts && recentAttempts.length > 0) {
        // Get the question to find its set
        const { data: question } = await supabase
          .from('practice_questions')
          .select('set_id')
          .eq('id', recentAttempts[0].question_id)
          .maybeSingle();

        if (question?.set_id) {
          const { data: set } = await supabase
            .from('question_sets')
            .select('id, title')
            .eq('id', question.set_id)
            .maybeSingle();

          if (set) {
            setLastPracticeSet(set);
          }
        }
      }

      // Fallback: get first published set if no recent practice
      if (!lastPracticeSet) {
        const { data: fallbackSet } = await supabase
          .from('question_sets')
          .select('id, title')
          .eq('is_published', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (fallbackSet && fallbackSet.length > 0) {
          setLastPracticeSet(fallbackSet[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching practice today data:', error);
    }

    setLoading(false);
  };

  // Load cached recommendations or fetch new ones if first login today
  const loadSmartRecommendations = async () => {
    if (!user) return;
    
    setSmartLoading(true);
    try {
      // Check for cached recommendations
      const { data: cached } = await supabase
        .from('user_smart_recommendations')
        .select('recommendations, generated_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (cached && isToday(cached.generated_at)) {
        // Use cached data if generated today
        setSmartData(cached.recommendations as unknown as SmartRecommendationsData);
        setLastUpdated(cached.generated_at);
        setSmartLoading(false);
        return;
      }

      // First login today - generate new recommendations
      await generateNewRecommendations();
    } catch (error) {
      console.error('Load smart recommendations error:', error);
    } finally {
      setSmartLoading(false);
    }
  };

  // Generate new AI recommendations and cache them
  const generateNewRecommendations = async () => {
    if (!user) return;
    
    setSmartLoading(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('smart-recommendations', {
        body: { userId: user.id },
      });

      if (error) throw error;
      
      setSmartData(result);
      
      // Cache the recommendations using upsert
      const now = new Date().toISOString();
      const { error: upsertError } = await supabase
        .from('user_smart_recommendations')
        .upsert({
          user_id: user.id,
          recommendations: result,
          generated_at: now,
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) {
        console.error('Cache recommendations error:', upsertError);
      } else {
        setLastUpdated(now);
      }
    } catch (error) {
      console.error('Generate smart recommendations error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo gợi ý học tập',
        variant: 'destructive',
      });
    } finally {
      setSmartLoading(false);
    }
  };

  // Manual refresh handler
  const handleManualRefresh = async () => {
    await generateNewRecommendations();
    toast({
      title: 'Đã cập nhật',
      description: 'Gợi ý học tập đã được làm mới',
    });
  };

  // Load data on component mount
  useEffect(() => {
    if (user) {
      fetchData();
      loadSmartRecommendations();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleContinueExam = () => {
    if (inProgressSession) {
      navigate(`/practice/exam/${inProgressSession.set_id}`, {
        state: { sessionId: inProgressSession.id }
      });
    }
  };

  const handleReviewWrong = () => {
    navigate('/practice/review');
  };

  const handleQuickPractice = () => {
    if (lastPracticeSet) {
      navigate(`/practice/setup/${lastPracticeSet.id}`, {
        state: { quickStart: true, questionCount: 10 }
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exam': return <BookOpen className="w-4 h-4" />;
      case 'flashcard': return <Brain className="w-4 h-4" />;
      case 'practice': return <Target className="w-4 h-4" />;
      case 'review': return <TrendingUp className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-muted';
    }
  };

  const handleRecommendationClick = (rec: Recommendation) => {
    switch (rec.type) {
      case 'exam':
        if (rec.examId) navigate(`/exams/${rec.examId}`);
        else navigate('/exams');
        break;
      case 'flashcard':
        navigate('/flashcards');
        break;
      case 'practice':
        navigate('/practice');
        break;
      case 'review':
        navigate('/practice/review');
        break;
      default:
        navigate('/dashboard');
    }
  };

  // Not logged in state
  if (!user) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Hôm nay học gì?
          </CardTitle>
          <CardDescription>Luyện tập mỗi ngày để tiến bộ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <LogIn className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">
              Đăng nhập để theo dõi tiến độ học tập
            </p>
            <Link to="/auth">
              <Button>
                <LogIn className="w-4 h-4 mr-2" />
                Đăng nhập ngay
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Hôm nay học gì?
          </CardTitle>
          <CardDescription>Luyện tập mỗi ngày để tiến bộ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Hôm nay học gì?
            </CardTitle>
            <CardDescription>Luyện tập mỗi ngày để tiến bộ</CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => { fetchData(); loadSmartRecommendations(); }}
            disabled={loading || smartLoading}
          >
            <RefreshCw className={`w-4 h-4 ${(loading || smartLoading) ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* A) Continue Exam */}
        <div className="p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground mb-1">Bài thi đang làm dở</h4>
              {inProgressSession ? (
                <>
                  <p className="text-sm text-muted-foreground mb-3">
                    Bạn có 1 bài thi chưa hoàn thành ({inProgressSession.total} câu)
                  </p>
                  <Button size="sm" onClick={handleContinueExam} className="gap-2">
                    <Play className="w-4 h-4" />
                    Tiếp tục làm bài
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Không có bài thi đang làm dở
                </p>
              )}
            </div>
          </div>
        </div>

        {/* B) Review Wrong */}
        <div className="p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground mb-1">Ôn câu sai</h4>
              {wrongAnswers.count > 0 ? (
                <>
                  <p className="text-sm text-muted-foreground mb-3">
                    Bạn có <Badge variant="destructive" className="mx-1">{wrongAnswers.count}</Badge> câu sai cần ôn lại
                  </p>
                  <Button size="sm" variant="outline" onClick={handleReviewWrong} className="gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Ôn ngay
                  </Button>
                </>
              ) : (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Bạn chưa có câu sai để ôn
                </p>
              )}
            </div>
          </div>
        </div>

        {/* C) Quick Practice */}
        <div className="p-4 rounded-lg border border-border/50 bg-card hover:bg-accent/5 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground mb-1">Luyện nhanh 10 câu</h4>
              {lastPracticeSet ? (
                <>
                  <p className="text-sm text-muted-foreground mb-3 truncate">
                    Bộ đề: {lastPracticeSet.title}
                  </p>
                  <Button size="sm" variant="secondary" onClick={handleQuickPractice} className="gap-2">
                    <Zap className="w-4 h-4" />
                    Luyện nhanh 10 câu
                  </Button>
                </>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    Chưa có bộ đề nào
                  </p>
                  <Link to="/practice">
                    <Button size="sm" variant="outline" className="gap-2">
                      <BookOpen className="w-4 h-4" />
                      Khám phá bộ đề
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* D) Smart Recommendations */}
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h4 className="font-medium text-foreground">Gợi ý học tập thông minh</h4>
            </div>
            <div className="flex items-center gap-2">
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Cập nhật {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true, locale: vi })}
                </span>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleManualRefresh}
                disabled={smartLoading}
                className="h-7 w-7 p-0"
                title="Làm mới gợi ý"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${smartLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {smartLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Đang phân tích...</span>
            </div>
          ) : smartData ? (
            <div className="space-y-3">
              {/* Summary */}
              <div className="p-3 bg-primary/5 rounded-lg text-sm">
                {smartData.summary}
              </div>
              
              {/* Recommendations */}
              {smartData.recommendations.slice(0, 3).map((rec, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-accent/5 cursor-pointer transition-colors"
                  onClick={() => handleRecommendationClick(rec)}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {getTypeIcon(rec.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{rec.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{rec.description}</p>
                  </div>
                  <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                    {rec.priority === 'high' ? 'Ưu tiên' : rec.priority === 'medium' ? 'Nên làm' : 'Tùy chọn'}
                  </Badge>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground">Chưa có dữ liệu gợi ý</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={generateNewRecommendations}>
                Tạo gợi ý
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
