import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  Users,
  HelpCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { createAuditLog } from '@/hooks/useAuditLogs';

interface Exam {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  question_count: number | null;
  attempt_count: number | null;
  difficulty: string | null;
  duration_minutes: number | null;
  created_at: string;
  category_id: string | null;
}

interface ExamCategory {
  id: string;
  name: string;
  slug: string;
}

const ExamManagement = () => {
  const { isAdmin, hasPermission, canEditOwn, canDeleteOwn, loading: roleLoading } = usePermissionsContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exams, setExams] = useState<Exam[]>([]);
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const canView = hasPermission('exams.view');
  const canCreate = hasPermission('exams.create');

  useEffect(() => {
    if (!roleLoading && !canView) {
      navigate('/');
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền xem đề thi",
        variant: "destructive",
      });
    }
  }, [canView, roleLoading, navigate, toast]);

  useEffect(() => {
    if (canView && user) {
      fetchData();
    }
  }, [canView, user]);

  const fetchData = async () => {
    setLoading(true);
    
    // Admin sees all exams, others see only their own if they have edit_own permission
    let examsQuery = supabase.from('exams').select('*').order('created_at', { ascending: false });
    if (!isAdmin && hasPermission('exams.edit_own')) {
      examsQuery = examsQuery.eq('creator_id', user?.id);
    }
    
    const [{ data: examsData }, { data: categoriesData }] = await Promise.all([
      examsQuery,
      supabase.from('exam_categories').select('id, name, slug'),
    ]);

    setExams(examsData || []);
    setCategories(categoriesData || []);
    setLoading(false);
  };

  const handleDelete = async (examId: string) => {
    // Get exam info for audit log
    const examToDelete = exams.find(e => e.id === examId);

    // First delete all questions associated with this exam
    const { error: questionsError } = await supabase
      .from('questions')
      .delete()
      .eq('exam_id', examId);

    if (questionsError) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi của đề thi",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', examId);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa đề thi",
        variant: "destructive",
      });
      return;
    }

    // Create audit log
    await createAuditLog(
      'delete',
      'exam',
      examId,
      { title: examToDelete?.title, slug: examToDelete?.slug, question_count: examToDelete?.question_count },
      null
    );

    toast({
      title: "Thành công",
      description: "Đã xóa đề thi",
    });
    
    fetchData();
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Chưa phân loại';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Không xác định';
  };

  const filteredExams = exams.filter(exam =>
    exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exam.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!canView) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={isAdmin ? "/admin" : "/teacher"}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                Quản lý đề thi
              </h1>
              <p className="text-muted-foreground mt-1">{exams.length} đề thi</p>
            </div>
          </div>
          {canCreate && (
            <Link to="/admin/exams/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tạo đề thi mới
              </Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm đề thi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Exams Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-4">
                  {searchQuery ? 'Không tìm thấy đề thi nào' : 'Chưa có đề thi nào'}
                </p>
                <Link to="/admin/exams/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo đề thi đầu tiên
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên đề thi</TableHead>
                    <TableHead>Danh mục</TableHead>
                    <TableHead>Độ khó</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Câu hỏi</TableHead>
                    <TableHead>Lượt làm</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          {exam.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {exam.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryName(exam.category_id)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            exam.difficulty === 'easy' ? 'secondary' : 
                            exam.difficulty === 'hard' ? 'destructive' : 'default'
                          }
                        >
                          {exam.difficulty || 'medium'}
                        </Badge>
                      </TableCell>
                      <TableCell>{exam.duration_minutes || 60} phút</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          {exam.question_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {exam.attempt_count || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(exam.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/exams/${exam.id}`}>
                            <Button variant="ghost" size="icon">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Xóa đề thi?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này không thể hoàn tác. Tất cả câu hỏi trong đề thi sẽ bị xóa.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(exam.id)}>
                                  Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ExamManagement;
