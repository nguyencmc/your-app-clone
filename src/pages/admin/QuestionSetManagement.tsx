import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  BookOpen, 
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowLeft,
  HelpCircle,
  Eye,
  EyeOff
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

interface QuestionSet {
  id: string;
  title: string;
  description: string | null;
  level: string | null;
  tags: string[] | null;
  is_published: boolean | null;
  question_count: number | null;
  created_at: string;
  updated_at: string;
}

const QuestionSetManagement = () => {
  const { isAdmin, hasPermission, loading: roleLoading } = usePermissionsContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [questionSets, setQuestionSets] = useState<QuestionSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const canView = hasPermission('questions.view');
  const canCreate = hasPermission('questions.create');
  const canEdit = hasPermission('questions.edit');
  const canDelete = hasPermission('questions.delete');

  useEffect(() => {
    if (!roleLoading && !canView) {
      navigate('/');
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền xem bộ câu hỏi",
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
    
    // Admin sees all question sets, others see only their own
    let query = supabase.from('question_sets').select('*').order('created_at', { ascending: false });
    if (!isAdmin) {
      query = query.eq('creator_id', user?.id);
    }
    
    const { data, error } = await query;

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách bộ đề",
        variant: "destructive",
      });
    } else {
      setQuestionSets(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (setId: string) => {
    // Get question set info for audit log
    const setToDelete = questionSets.find(s => s.id === setId);

    // First delete all questions associated with this set
    const { error: questionsError } = await supabase
      .from('practice_questions')
      .delete()
      .eq('set_id', setId);

    if (questionsError) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa câu hỏi của bộ đề",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('question_sets')
      .delete()
      .eq('id', setId);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa bộ đề",
        variant: "destructive",
      });
      return;
    }

    // Create audit log
    await createAuditLog(
      'delete',
      'question_set',
      setId,
      { title: setToDelete?.title, level: setToDelete?.level, question_count: setToDelete?.question_count },
      null
    );

    toast({
      title: "Thành công",
      description: "Đã xóa bộ đề",
    });
    
    fetchData();
  };

  const togglePublish = async (setId: string, currentStatus: boolean | null) => {
    const { error } = await supabase
      .from('question_sets')
      .update({ is_published: !currentStatus })
      .eq('id', setId);

    if (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Thành công",
      description: currentStatus ? "Đã ẩn bộ đề" : "Đã công khai bộ đề",
    });
    
    fetchData();
  };

  const getLevelBadge = (level: string | null) => {
    switch (level) {
      case 'easy':
        return { label: 'Dễ', variant: 'secondary' as const };
      case 'medium':
        return { label: 'Trung bình', variant: 'default' as const };
      case 'hard':
        return { label: 'Khó', variant: 'destructive' as const };
      default:
        return { label: level || 'Chưa xác định', variant: 'outline' as const };
    }
  };

  const filteredSets = questionSets.filter(set =>
    set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    set.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
                <BookOpen className="w-8 h-8 text-primary" />
                Quản lý bộ câu hỏi
              </h1>
              <p className="text-muted-foreground mt-1">{questionSets.length} bộ đề</p>
            </div>
          </div>
          {canCreate && (
            <Link to="/admin/question-sets/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Tạo bộ đề mới
              </Button>
            </Link>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bộ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Question Sets Table */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredSets.length === 0 ? (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg mb-4">
                  {searchQuery ? 'Không tìm thấy bộ đề nào' : 'Chưa có bộ đề nào'}
                </p>
                <Link to="/admin/question-sets/create">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo bộ đề đầu tiên
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên bộ đề</TableHead>
                    <TableHead>Độ khó</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Câu hỏi</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSets.map((set) => {
                    const levelInfo = getLevelBadge(set.level);
                    return (
                      <TableRow key={set.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{set.title}</p>
                            {set.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {set.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={levelInfo.variant}>{levelInfo.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap max-w-[200px]">
                            {set.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {(set.tags?.length || 0) > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{(set.tags?.length || 0) - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                            {set.question_count || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={set.is_published ? 'default' : 'secondary'}>
                            {set.is_published ? 'Công khai' : 'Nháp'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(set.created_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => togglePublish(set.id, set.is_published)}
                              title={set.is_published ? 'Ẩn bộ đề' : 'Công khai bộ đề'}
                            >
                              {set.is_published ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                            <Link to={`/admin/question-sets/${set.id}`}>
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
                                  <AlertDialogTitle>Xóa bộ đề?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Hành động này không thể hoàn tác. Tất cả câu hỏi trong bộ đề sẽ bị xóa.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(set.id)}>
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default QuestionSetManagement;
