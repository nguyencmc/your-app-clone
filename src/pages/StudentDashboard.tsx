import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { AITutorButton } from '@/components/ai/AITutorButton';
import { AchievementsBadgeDisplay } from '@/components/achievements/AchievementsBadgeDisplay';
import { useAchievements } from '@/hooks/useAchievements';
import { PracticeTodayWidget } from '@/components/dashboard/PracticeTodayWidget';
import { PracticeStatsWidget } from '@/components/dashboard/PracticeStatsWidget';
import { useDueCards } from '@/features/flashcards/hooks/useDueCards';
import { 
  BookOpen, 
  FileText, 
  Headphones, 
  Layers,
  Trophy,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  Flame,
  Star,
  BarChart3,
  GraduationCap,
} from 'lucide-react';

interface Stats {
  totalExamsTaken: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  points: number;
  level: number;
  flashcardsLearned: number;
}

interface WeeklyProgress {
  day: string;
  attempts: number;
  correct: number;
}


const StudentDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, isTeacher } = useUserRole();
  const { checkAndAwardAchievements, getUserProgress } = useAchievements();
  
  const [stats, setStats] = useState<Stats>({
    totalExamsTaken: 0,
    totalQuestionsAnswered: 0,
    totalCorrectAnswers: 0,
    points: 0,
    level: 1,
    flashcardsLearned: 0,
  });
  const [weeklyProgress, setWeeklyProgress] = useState<WeeklyProgress[]>([]);
  const [enrolledCoursesCount, setEnrolledCoursesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const { dueCount: flashcardDueCount } = useDueCards();

  useEffect(() => {
    if (user) {
      fetchData();
      // Check achievements on load
      checkAchievements();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkAchievements = async () => {
    const progress = await getUserProgress();
    await checkAndAwardAchievements(progress);
  };

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch profile stats
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .single();

    if (profile) {
      setStats({
        totalExamsTaken: profile.total_exams_taken || 0,
        totalQuestionsAnswered: profile.total_questions_answered || 0,
        totalCorrectAnswers: profile.total_correct_answers || 0,
        points: profile.points || 0,
        level: profile.level || 1,
        flashcardsLearned: 0,
      });
    }

    // Fetch flashcard progress
    const { count: flashcardsCount } = await supabase
      .from('user_flashcard_progress')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('is_remembered', true);

    setStats(prev => ({
      ...prev,
      flashcardsLearned: flashcardsCount || 0,
    }));

    // Calculate weekly progress
    const weekDays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: weekAttempts } = await supabase
      .from('exam_attempts')
      .select('completed_at, correct_answers')
      .eq('user_id', user?.id)
      .gte('completed_at', weekAgo.toISOString());

    const progressByDay: Record<string, { attempts: number; correct: number }> = {};
    weekDays.forEach(day => {
      progressByDay[day] = { attempts: 0, correct: 0 };
    });

    weekAttempts?.forEach(attempt => {
      const date = new Date(attempt.completed_at);
      const dayName = weekDays[date.getDay()];
      progressByDay[dayName].attempts += 1;
      progressByDay[dayName].correct += attempt.correct_answers || 0;
    });

    setWeeklyProgress(weekDays.map(day => ({
      day,
      ...progressByDay[day],
    })));

    // Calculate streak (consecutive days with activity)
    let currentStreak = 0;
    const attemptDates = new Set(
      weekAttempts?.map(a => new Date(a.completed_at).toDateString()) || []
    );
    
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      if (attemptDates.has(checkDate.toDateString())) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }
    setStreak(currentStreak);

    // Fetch enrolled courses count
    const { count: enrollmentCount } = await supabase
      .from('user_course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id);

    setEnrolledCoursesCount(enrollmentCount || 0);

    setLoading(false);
  };

  const accuracy = stats.totalQuestionsAnswered > 0 
    ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100) 
    : 0;

  const pointsToNextLevel = (stats.level * 100) - (stats.points % 100);
  const levelProgress = ((stats.points % 100) / 100) * 100;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Đăng nhập để xem Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Theo dõi tiến độ học tập và thống kê cá nhân của bạn
          </p>
          <Link to="/auth">
            <Button size="lg">Đăng nhập ngay</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 sm:py-8 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2 sm:gap-3">
              <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
              <span className="truncate">Dashboard</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Theo dõi tiến độ học tập của bạn</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {(isAdmin || isTeacher) && (
              <Link to={isAdmin ? "/admin" : "/teacher"}>
                <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                  {isAdmin ? 'Admin' : 'Teacher'}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Grid - Mobile optimized */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2 sm:mb-3">
                <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground truncate">{stats.points.toLocaleString()}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Điểm</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center mb-2 sm:mb-3">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">Lv.{stats.level}</p>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">{pointsToNextLevel}đ → lv.{stats.level + 1}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardContent className="p-3 sm:p-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-2 sm:mb-3">
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{streak}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Streak</p>
            </CardContent>
          </Card>

          <Link to="/history" className="block">
            <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full">
              <CardContent className="p-3 sm:p-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-purple-500/20 transition-colors">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                </div>
                <p className="text-lg sm:text-2xl font-bold text-foreground">{stats.totalExamsTaken}</p>
                <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-primary transition-colors">Đề đã làm</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Links Grid - Mobile 4 cols */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Link to="/exams" className="block">
            <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full">
              <CardContent className="p-2 sm:p-3 flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-1 sm:mb-2 group-hover:bg-green-500/20 transition-colors">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-primary truncate w-full">{accuracy}%</p>
              </CardContent>
            </Card>
          </Link>

          <Link to={flashcardDueCount > 0 ? "/flashcards/today" : "/flashcards"} className="block">
            <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full relative">
              <CardContent className="p-2 sm:p-3 flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-1 sm:mb-2 group-hover:bg-cyan-500/20 transition-colors">
                  <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-500" />
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-primary truncate w-full">
                  {flashcardDueCount > 0 ? `${flashcardDueCount} thẻ` : 'Flashcard'}
                </p>
                {flashcardDueCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-orange-500 text-white text-[8px] px-1 py-0 h-4 min-w-4">!</Badge>
                )}
              </CardContent>
            </Card>
          </Link>

          <Link to="/my-courses" className="block">
            <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full">
              <CardContent className="p-2 sm:p-3 flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-1 sm:mb-2 group-hover:bg-blue-500/20 transition-colors">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-primary truncate w-full">Khóa học</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/podcasts" className="block">
            <Card className="border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group h-full">
              <CardContent className="p-2 sm:p-3 flex flex-col items-center text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-pink-500/10 flex items-center justify-center mb-1 sm:mb-2 group-hover:bg-pink-500/20 transition-colors">
                  <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-muted-foreground group-hover:text-primary truncate w-full">Podcast</p>
              </CardContent>
            </Card>
          </Link>
        </div>


        {/* Practice Widgets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <PracticeTodayWidget />
          <PracticeStatsWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Progress & Weekly Chart */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Level Progress */}
            <Card className="border-border/50">
              <CardHeader className="pb-2 sm:pb-3 p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  Tiến độ Level
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Level {stats.level}</span>
                  <span className="text-xs sm:text-sm text-muted-foreground">Level {stats.level + 1}</span>
                </div>
                <Progress value={levelProgress} className="h-2 sm:h-3" />
                <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center">
                  Còn {pointsToNextLevel} điểm nữa để lên level
                </p>
              </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="border-border/50">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  Hoạt động tuần
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">Số lượt làm bài theo ngày</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
                <div className="flex items-end justify-between gap-1 sm:gap-2 h-28 sm:h-40">
                  {weeklyProgress.map((day, index) => {
                    const maxAttempts = Math.max(...weeklyProgress.map(d => d.attempts), 1);
                    const height = (day.attempts / maxAttempts) * 100;
                    const isToday = index === new Date().getDay();
                    
                    return (
                      <div key={day.day} className="flex-1 flex flex-col items-center min-w-0">
                        <div className="w-full flex flex-col items-center justify-end h-20 sm:h-32">
                          <div 
                            className={`w-full max-w-6 sm:max-w-8 rounded-t-md transition-all ${
                              isToday ? 'bg-primary' : 'bg-primary/30'
                            }`}
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                        </div>
                        <span className={`text-[10px] sm:text-xs mt-1 sm:mt-2 ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                          {day.day}
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {day.attempts}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions - Hidden on mobile as they're duplicated above */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-3">
              <Link to="/exams">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors flex-shrink-0">
                      <FileText className="w-5 h-5 text-purple-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">Làm đề thi</h3>
                      <p className="text-xs text-muted-foreground">Luyện tập ngay</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/flashcards">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors flex-shrink-0">
                      <Layers className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">Flashcards</h3>
                      <p className="text-xs text-muted-foreground">Học từ vựng</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              
              <Link to="/podcasts">
                <Card className="cursor-pointer hover:shadow-lg transition-shadow border-border/50 group h-full">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors flex-shrink-0">
                      <Headphones className="w-5 h-5 text-pink-500" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">Podcasts</h3>
                      <p className="text-xs text-muted-foreground">Luyện nghe</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="space-y-4 sm:space-y-6">
            {/* Achievements */}
            <Link to="/achievements" className="block">
              <AchievementsBadgeDisplay />
            </Link>
            {/* Performance Summary */}
            <Card className="border-border/50">
              <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  Thống kê tổng quan
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground">Tổng câu hỏi</span>
                  <span className="font-semibold text-sm sm:text-base">{stats.totalQuestionsAnswered}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    Đúng
                  </span>
                  <span className="font-semibold text-green-600 text-sm sm:text-base">{stats.totalCorrectAnswers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                    Sai
                  </span>
                  <span className="font-semibold text-red-600 text-sm sm:text-base">
                    {stats.totalQuestionsAnswered - stats.totalCorrectAnswers}
                  </span>
                </div>
                <div className="pt-2 sm:pt-3 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs sm:text-sm font-medium">Độ chính xác</span>
                    <span className="font-bold text-primary text-sm sm:text-base">{accuracy}%</span>
                  </div>
                  <Progress value={accuracy} className="h-1.5 sm:h-2" />
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
      
      <AITutorButton />
      <Footer />
    </div>
  );
};

export default StudentDashboard;