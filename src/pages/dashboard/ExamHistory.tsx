import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { useAuth } from "@/hooks/useAuth";
import { useExamAttempts } from "@/hooks/useExamAttempts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Clock, Target, BookOpen, Calendar, Award } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

const ExamHistory = () => {
  const { user } = useAuth();
  const { attempts, isLoading } = useExamAttempts();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Process data for charts
  const scoreOverTime = attempts
    .slice()
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
    .map((attempt) => ({
      date: format(new Date(attempt.completed_at), "dd/MM", { locale: vi }),
      score: attempt.total_questions > 0 
        ? Math.round((attempt.score / attempt.total_questions) * 100) 
        : 0,
      fullDate: format(new Date(attempt.completed_at), "dd/MM/yyyy HH:mm", { locale: vi }),
    }));

  const timeSpentData = attempts
    .slice()
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
    .map((attempt) => ({
      date: format(new Date(attempt.completed_at), "dd/MM", { locale: vi }),
      time: Math.round((attempt.time_spent || 0) / 60),
      fullDate: format(new Date(attempt.completed_at), "dd/MM/yyyy", { locale: vi }),
    }));

  // Calculate statistics
  const totalAttempts = attempts.length;
  const averageScore = totalAttempts > 0
    ? Math.round(
        attempts.reduce((acc, a) => acc + (a.total_questions > 0 ? (a.score / a.total_questions) * 100 : 0), 0) / totalAttempts
      )
    : 0;
  const totalTimeSpent = attempts.reduce((acc, a) => acc + (a.time_spent || 0), 0);
  const bestScore = totalAttempts > 0
    ? Math.max(...attempts.map((a) => (a.total_questions > 0 ? Math.round((a.score / a.total_questions) * 100) : 0)))
    : 0;

  // Score distribution for pie chart
  const scoreRanges = [
    { name: "0-50%", value: 0, color: "hsl(var(--destructive))" },
    { name: "51-70%", value: 0, color: "hsl(var(--chart-4))" },
    { name: "71-85%", value: 0, color: "hsl(var(--chart-2))" },
    { name: "86-100%", value: 0, color: "hsl(var(--primary))" },
  ];

  attempts.forEach((attempt) => {
    const pct = attempt.total_questions > 0 ? (attempt.score / attempt.total_questions) * 100 : 0;
    if (pct <= 50) scoreRanges[0].value++;
    else if (pct <= 70) scoreRanges[1].value++;
    else if (pct <= 85) scoreRanges[2].value++;
    else scoreRanges[3].value++;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar
          userName={user?.email?.split("@")[0] || "User"}
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 overflow-auto">
          <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Lịch sử làm bài
                </h1>
                <p className="text-muted-foreground mt-1">
                  Theo dõi tiến bộ học tập của bạn qua thời gian
                </p>
              </div>
              <Badge variant="secondary" className="w-fit">
                <Calendar className="w-3 h-3 mr-1" />
                {totalAttempts} bài thi đã làm
              </Badge>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{averageScore}%</p>
                      <p className="text-xs text-muted-foreground">Điểm TB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{bestScore}%</p>
                      <p className="text-xs text-muted-foreground">Điểm cao nhất</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">{totalAttempts}</p>
                      <p className="text-xs text-muted-foreground">Bài thi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {Math.round(totalTimeSpent / 60)}
                      </p>
                      <p className="text-xs text-muted-foreground">Phút học</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {totalAttempts === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Chưa có bài thi nào
                  </h3>
                  <p className="text-muted-foreground">
                    Hãy làm bài thi đầu tiên để xem thống kê tiến bộ của bạn!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="progress" className="space-y-4">
                <TabsList className="bg-secondary/50">
                  <TabsTrigger value="progress">Tiến bộ</TabsTrigger>
                  <TabsTrigger value="time">Thời gian</TabsTrigger>
                  <TabsTrigger value="distribution">Phân bố</TabsTrigger>
                  <TabsTrigger value="history">Chi tiết</TabsTrigger>
                </TabsList>

                {/* Progress Tab */}
                <TabsContent value="progress" className="space-y-4">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        Điểm số theo thời gian
                      </CardTitle>
                      <CardDescription>
                        Biểu đồ thể hiện xu hướng điểm số của bạn
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] md:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={scoreOverTime}>
                            <defs>
                              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis domain={[0, 100]} className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                              }}
                              labelStyle={{ color: 'hsl(var(--foreground))' }}
                              formatter={(value: number) => [`${value}%`, 'Điểm']}
                            />
                            <Area
                              type="monotone"
                              dataKey="score"
                              stroke="hsl(var(--primary))"
                              strokeWidth={2}
                              fill="url(#scoreGradient)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Time Tab */}
                <TabsContent value="time" className="space-y-4">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-500" />
                        Thời gian làm bài
                      </CardTitle>
                      <CardDescription>
                        Thời gian (phút) bạn dành cho mỗi bài thi
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] md:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={timeSpentData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                              }}
                              labelStyle={{ color: 'hsl(var(--foreground))' }}
                              formatter={(value: number) => [`${value} phút`, 'Thời gian']}
                            />
                            <Bar
                              dataKey="time"
                              fill="hsl(var(--chart-2))"
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Distribution Tab */}
                <TabsContent value="distribution" className="space-y-4">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-500" />
                        Phân bố điểm số
                      </CardTitle>
                      <CardDescription>
                        Tỷ lệ các mức điểm bạn đạt được
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px] md:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={scoreRanges.filter(r => r.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {scoreRanges.filter(r => r.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px',
                              }}
                              formatter={(value: number) => [`${value} bài`, 'Số lượng']}
                            />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* History Tab */}
                <TabsContent value="history" className="space-y-4">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle>Lịch sử chi tiết</CardTitle>
                      <CardDescription>
                        Danh sách tất cả các bài thi bạn đã làm
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {attempts
                          .slice()
                          .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
                          .map((attempt) => {
                            const pct = attempt.total_questions > 0
                              ? Math.round((attempt.score / attempt.total_questions) * 100)
                              : 0;
                            return (
                              <div
                                key={attempt.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 border border-border/50"
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                                      pct >= 80
                                        ? "bg-green-500/10 text-green-500"
                                        : pct >= 60
                                        ? "bg-amber-500/10 text-amber-500"
                                        : "bg-destructive/10 text-destructive"
                                    }`}
                                  >
                                    {pct}%
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">
                                      {attempt.score}/{attempt.total_questions} câu đúng
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(attempt.completed_at), "dd/MM/yyyy 'lúc' HH:mm", { locale: vi })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {Math.round((attempt.time_spent || 0) / 60)} phút
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default ExamHistory;
