import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  BookOpen, 
  Plus,
  ArrowLeft,
  Save,
  Trash2,
  GripVertical,
  X
} from 'lucide-react';
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

interface Choice {
  id: string;
  text: string;
}

interface Question {
  id?: string;
  prompt: string;
  choices: Choice[];
  answer: string;
  explanation: string;
  difficulty: number;
  tags: string[];
  question_order: number;
  isNew?: boolean;
  isDeleted?: boolean;
}

const QuestionSetEditor = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const { isAdmin, hasPermission, loading: roleLoading } = usePermissionsContext();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  
  // Question Set fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  
  // Questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null);

  const canCreate = hasPermission('questions.create');
  const canEdit = hasPermission('questions.edit');
  const hasAccess = isEditMode ? canEdit : canCreate;

  useEffect(() => {
    if (!roleLoading && !hasAccess) {
      navigate('/');
      toast({
        title: "Không có quyền truy cập",
        description: "Bạn không có quyền thực hiện thao tác này",
        variant: "destructive",
      });
    }
  }, [hasAccess, roleLoading, navigate, toast]);

  useEffect(() => {
    if (hasAccess) {
      fetchCourses();
      if (isEditMode && id) {
        fetchData();
      }
    }
  }, [hasAccess, isEditMode, id]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('id, title')
      .order('title', { ascending: true });
    
    if (!error && data) {
      setCourses(data);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch question set
    const { data: setData, error: setError } = await supabase
      .from('question_sets')
      .select('*')
      .eq('id', id)
      .single();

    if (setError || !setData) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy bộ đề",
        variant: "destructive",
      });
      navigate('/admin/question-sets');
      return;
    }

    setTitle(setData.title);
    setDescription(setData.description || '');
    setLevel(setData.level || 'medium');
    setTags(setData.tags || []);
    setIsPublished(setData.is_published ?? true);
    setCourseId(setData.course_id || null);

    // Fetch questions
    const { data: questionsData, error: questionsError } = await supabase
      .from('practice_questions')
      .select('*')
      .eq('set_id', id)
      .order('question_order', { ascending: true });

    if (!questionsError && questionsData) {
      setQuestions(questionsData.map(q => ({
        id: q.id,
        prompt: q.prompt,
        choices: q.choices as unknown as Choice[],
        answer: q.answer as unknown as string,
        explanation: q.explanation || '',
        difficulty: q.difficulty || 3,
        tags: q.tags || [],
        question_order: q.question_order || 0,
      })));
    }

    setLoading(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      prompt: '',
      choices: [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ],
      answer: 'a',
      explanation: '',
      difficulty: 3,
      tags: [],
      question_order: questions.length + 1,
      isNew: true,
    };
    setQuestions([...questions, newQuestion]);
    setActiveQuestionIndex(questions.length);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    setQuestions(newQuestions);
  };

  const updateChoice = (questionIndex: number, choiceId: string, text: string) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    question.choices = question.choices.map(c => 
      c.id === choiceId ? { ...c, text } : c
    );
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index: number) => {
    const question = questions[index];
    if (question.id) {
      // Mark for deletion
      const newQuestions = [...questions];
      newQuestions[index] = { ...question, isDeleted: true };
      setQuestions(newQuestions);
    } else {
      // Remove new question
      setQuestions(questions.filter((_, i) => i !== index));
    }
    setActiveQuestionIndex(null);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên bộ đề",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      let setId = id;

      // Create or update question set
      if (isEditMode) {
        const { error } = await supabase
          .from('question_sets')
          .update({
            title,
            description: description || null,
            level,
            tags,
            is_published: isPublished,
            course_id: courseId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('question_sets')
          .insert({
            title,
            description: description || null,
            level,
            tags,
            is_published: isPublished,
            course_id: courseId,
            question_count: 0,
            creator_id: user?.id,
          })
          .select()
          .single();

        if (error) throw error;
        setId = data.id;
      }

      // Handle questions
      const activeQuestions = questions.filter(q => !q.isDeleted);
      const deletedQuestions = questions.filter(q => q.isDeleted && q.id);
      const newQuestions = activeQuestions.filter(q => q.isNew);
      const existingQuestions = activeQuestions.filter(q => !q.isNew && q.id);

      // Delete marked questions
      for (const q of deletedQuestions) {
        await supabase.from('practice_questions').delete().eq('id', q.id!);
      }

      // Update existing questions
      for (const q of existingQuestions) {
        await supabase
          .from('practice_questions')
          .update({
            prompt: q.prompt,
            choices: JSON.parse(JSON.stringify(q.choices)),
            answer: JSON.parse(JSON.stringify(q.answer)),
            explanation: q.explanation || null,
            difficulty: q.difficulty,
            tags: q.tags,
            question_order: q.question_order,
          })
          .eq('id', q.id!);
      }

      // Insert new questions
      if (newQuestions.length > 0) {
        const { error } = await supabase
          .from('practice_questions')
          .insert(
            newQuestions.map(q => ({
              set_id: setId,
              type: 'mcq_single',
              prompt: q.prompt,
              choices: JSON.parse(JSON.stringify(q.choices)),
              answer: JSON.parse(JSON.stringify(q.answer)),
              explanation: q.explanation || null,
              difficulty: q.difficulty,
              tags: q.tags,
              question_order: q.question_order,
            }))
          );

        if (error) throw error;
      }

      // Create audit log
      const activeQuestionsCount = questions.filter(q => !q.isDeleted).length;
      await createAuditLog(
        isEditMode ? 'update' : 'create',
        'question_set',
        setId,
        isEditMode ? { title, level, question_count: activeQuestionsCount } : null,
        { title, level, is_published: isPublished, question_count: activeQuestionsCount }
      );

      toast({
        title: "Thành công",
        description: isEditMode ? "Đã cập nhật bộ đề" : "Đã tạo bộ đề mới",
      });

      navigate('/admin/question-sets');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu bộ đề",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (roleLoading || loading) {
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

  if (!hasAccess) {
    return null;
  }

  const activeQuestion = activeQuestionIndex !== null ? questions[activeQuestionIndex] : null;
  const visibleQuestions = questions.filter(q => !q.isDeleted);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/question-sets">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-primary" />
                {isEditMode ? 'Chỉnh sửa bộ đề' : 'Tạo bộ đề mới'}
              </h1>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu...' : 'Lưu bộ đề'}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Question Set Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin bộ đề</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tên bộ đề *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tên bộ đề..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả ngắn về bộ đề..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Độ khó</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Dễ</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="hard">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Thêm tag..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1">
                          {tag}
                          <button onClick={() => removeTag(tag)}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Liên kết khóa học</Label>
                  <Select 
                    value={courseId || 'none'} 
                    onValueChange={(v) => setCourseId(v === 'none' ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn khóa học..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Không liên kết --</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Bộ đề sẽ hiển thị trong phần "Luyện thi" của khóa học được chọn
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="published">Công khai</Label>
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Questions List */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Câu hỏi ({visibleQuestions.length})</CardTitle>
                <Button size="sm" onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-1" />
                  Thêm
                </Button>
              </CardHeader>
              <CardContent>
                {visibleQuestions.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    Chưa có câu hỏi nào
                  </p>
                ) : (
                  <div className="space-y-2">
                    {questions.map((q, index) => {
                      if (q.isDeleted) return null;
                      return (
                        <div
                          key={index}
                          onClick={() => setActiveQuestionIndex(index)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            activeQuestionIndex === index
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                Câu {index + 1}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {q.prompt || 'Chưa có nội dung'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Question Editor */}
          <div className="lg:col-span-2">
            {activeQuestion ? (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Câu hỏi {activeQuestionIndex! + 1}</CardTitle>
                    <CardDescription>Chỉnh sửa nội dung câu hỏi</CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Xóa
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xóa câu hỏi?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteQuestion(activeQuestionIndex!)}>
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question prompt */}
                  <div className="space-y-2">
                    <Label>Nội dung câu hỏi *</Label>
                    <Textarea
                      value={activeQuestion.prompt}
                      onChange={(e) => updateQuestion(activeQuestionIndex!, { prompt: e.target.value })}
                      placeholder="Nhập nội dung câu hỏi..."
                      rows={3}
                    />
                  </div>

                  {/* Choices */}
                  <div className="space-y-3">
                    <Label>Đáp án</Label>
                    {activeQuestion.choices.map((choice, idx) => (
                      <div key={choice.id} className="flex items-center gap-3">
                        <div 
                          onClick={() => updateQuestion(activeQuestionIndex!, { answer: choice.id })}
                          className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer font-medium text-sm transition-colors ${
                            activeQuestion.answer === choice.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {choice.id.toUpperCase()}
                        </div>
                        <Input
                          value={choice.text}
                          onChange={(e) => updateChoice(activeQuestionIndex!, choice.id, e.target.value)}
                          placeholder={`Đáp án ${choice.id.toUpperCase()}...`}
                          className="flex-1"
                        />
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      Click vào chữ cái để chọn đáp án đúng
                    </p>
                  </div>

                  {/* Explanation */}
                  <div className="space-y-2">
                    <Label>Giải thích</Label>
                    <Textarea
                      value={activeQuestion.explanation}
                      onChange={(e) => updateQuestion(activeQuestionIndex!, { explanation: e.target.value })}
                      placeholder="Giải thích đáp án (hiển thị sau khi người dùng trả lời)..."
                      rows={2}
                    />
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-2">
                    <Label>Độ khó (1-5)</Label>
                    <Select 
                      value={String(activeQuestion.difficulty)} 
                      onValueChange={(v) => updateQuestion(activeQuestionIndex!, { difficulty: parseInt(v) })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Rất dễ</SelectItem>
                        <SelectItem value="2">2 - Dễ</SelectItem>
                        <SelectItem value="3">3 - Trung bình</SelectItem>
                        <SelectItem value="4">4 - Khó</SelectItem>
                        <SelectItem value="5">5 - Rất khó</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-96 text-center">
                  <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Chọn một câu hỏi để chỉnh sửa hoặc tạo câu hỏi mới
                  </p>
                  <Button onClick={addQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm câu hỏi
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default QuestionSetEditor;
