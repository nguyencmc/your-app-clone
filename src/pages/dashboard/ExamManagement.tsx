import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { format } from "date-fns";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Eye,
  Edit,
  Play,
  MoreVertical,
  Loader2,
  Filter,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Exam {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  question_count: number;
  time_limit: number;
  created_at: string;
  user_id: string;
  user_email?: string;
}

const ExamManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [deleteExamId, setDeleteExamId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (currentUserId && !roleLoading) {
      fetchExams();
    }
  }, [currentUserId, isAdmin, roleLoading]);

  useEffect(() => {
    filterExams();
  }, [exams, searchQuery, difficultyFilter]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(user.id);
  };

  const fetchExams = async () => {
    try {
      setIsLoading(true);
      
      // Admin sees all exams, user sees only their own
      const query = supabase
        .from("exams")
        .select("id, title, subject, difficulty, question_count, time_limit, created_at, user_id")
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // For admin, fetch user emails
      if (isAdmin && data && data.length > 0) {
        const userIds = [...new Set(data.map(e => e.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        const examsWithUser = data.map(exam => ({
          ...exam,
          user_email: profileMap.get(exam.user_id) || "Unknown User"
        }));
        
        setExams(examsWithUser);
      } else {
        setExams(data || []);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đề thi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = [...exams];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        exam =>
          exam.title.toLowerCase().includes(query) ||
          exam.subject.toLowerCase().includes(query)
      );
    }

    if (difficultyFilter !== "all") {
      filtered = filtered.filter(exam => exam.difficulty === difficultyFilter);
    }

    setFilteredExams(filtered);
  };

  const handleDelete = async () => {
    if (!deleteExamId) return;

    try {
      const { error } = await supabase
        .from("exams")
        .delete()
        .eq("id", deleteExamId);

      if (error) throw error;

      setExams(exams.filter(e => e.id !== deleteExamId));
      toast({
        title: "Đã xoá",
        description: "Đề thi đã được xoá thành công.",
      });
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xoá đề thi.",
        variant: "destructive",
      });
    } finally {
      setDeleteExamId(null);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: "bg-green-500/20 text-green-400 border-green-500/30",
      medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      hard: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[difficulty] || "bg-secondary text-secondary-foreground";
  };

  if (isLoading || roleLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {isAdmin ? "Quản lý tất cả đề thi" : "Đề thi của tôi"}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {isAdmin 
                    ? "Xem và quản lý tất cả đề thi trong hệ thống" 
                    : "Xem, tạo, chỉnh sửa và xoá đề thi của bạn"}
                </p>
              </div>
              <Button onClick={() => navigate("/create-exam")} className="gap-2">
                <Plus className="w-4 h-4" />
                Tạo đề thi mới
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc môn học..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-card/50 border border-border/50 rounded-xl p-4">
                <p className="text-2xl font-bold text-foreground">{exams.length}</p>
                <p className="text-sm text-muted-foreground">Tổng số đề thi</p>
              </div>
              <div className="bg-card/50 border border-border/50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-400">
                  {exams.filter(e => e.difficulty === "easy").length}
                </p>
                <p className="text-sm text-muted-foreground">Đề dễ</p>
              </div>
              <div className="bg-card/50 border border-border/50 rounded-xl p-4">
                <p className="text-2xl font-bold text-yellow-400">
                  {exams.filter(e => e.difficulty === "medium").length}
                </p>
                <p className="text-sm text-muted-foreground">Đề trung bình</p>
              </div>
              <div className="bg-card/50 border border-border/50 rounded-xl p-4">
                <p className="text-2xl font-bold text-red-400">
                  {exams.filter(e => e.difficulty === "hard").length}
                </p>
                <p className="text-sm text-muted-foreground">Đề khó</p>
              </div>
            </div>

            {/* Exam List */}
            {filteredExams.length === 0 ? (
              <div className="bg-card/50 border border-border/50 rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchQuery || difficultyFilter !== "all"
                    ? "Không tìm thấy đề thi"
                    : "Chưa có đề thi nào"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || difficultyFilter !== "all"
                    ? "Thử thay đổi bộ lọc để tìm kiếm"
                    : "Bắt đầu tạo đề thi đầu tiên của bạn"}
                </p>
                {!searchQuery && difficultyFilter === "all" && (
                  <Button onClick={() => navigate("/create-exam")} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Tạo đề thi mới
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-card/50 border border-border/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/30 border-b border-border/50">
                      <tr>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                          Tên đề thi
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                          Môn học
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                          Độ khó
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                          Số câu
                        </th>
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                          Thời gian
                        </th>
                        {isAdmin && (
                          <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden xl:table-cell">
                            Người tạo
                          </th>
                        )}
                        <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                          Ngày tạo
                        </th>
                        <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExams.map((exam) => (
                        <tr
                          key={exam.id}
                          className="border-b border-border/30 hover:bg-secondary/20 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {exam.title}
                                </p>
                                <p className="text-xs text-muted-foreground md:hidden">
                                  {exam.subject}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 hidden md:table-cell">
                            <span className="text-sm text-foreground">{exam.subject}</span>
                          </td>
                          <td className="p-4 hidden sm:table-cell">
                            <Badge
                              variant="outline"
                              className={getDifficultyBadge(exam.difficulty)}
                            >
                              {exam.difficulty === "easy" && "Dễ"}
                              {exam.difficulty === "medium" && "Trung bình"}
                              {exam.difficulty === "hard" && "Khó"}
                            </Badge>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <span className="text-sm text-foreground">
                              {exam.question_count} câu
                            </span>
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <span className="text-sm text-foreground">
                              {exam.time_limit} phút
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="p-4 hidden xl:table-cell">
                              <div className="flex items-center gap-2">
                                <UserIcon className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm text-foreground truncate max-w-[120px]">
                                  {exam.user_email}
                                </span>
                              </div>
                            </td>
                          )}
                          <td className="p-4 hidden md:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {format(new Date(exam.created_at), "dd/MM/yyyy")}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => navigate(`/exam/${exam.id}`)}
                                >
                                  <Eye className="w-4 h-4" />
                                  Xem chi tiết
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => navigate(`/exam/${exam.id}`)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="gap-2"
                                  onClick={() => navigate(`/exam/${exam.id}/take`)}
                                >
                                  <Play className="w-4 h-4" />
                                  Làm bài
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="gap-2 text-destructive focus:text-destructive"
                                  onClick={() => setDeleteExamId(exam.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Xoá
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteExamId} onOpenChange={() => setDeleteExamId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xoá đề thi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xoá đề thi này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xoá
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default ExamManagement;
