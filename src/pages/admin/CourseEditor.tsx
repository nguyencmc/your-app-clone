import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionsContext } from '@/contexts/PermissionsContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  GripVertical, 
  Video
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { LessonEditor, CourseLesson, LessonAttachment } from '@/components/admin/course/LessonEditor';
import { CourseTestEditor } from '@/components/admin/course/CourseTestEditor';
import { createAuditLog } from '@/hooks/useAuditLogs';

interface CourseCategory {
  id: string;
  name: string;
  slug: string;
}

interface CourseSection {
  id?: string;
  title: string;
  description: string;
  section_order: number;
  lessons: CourseLesson[];
}

interface CourseFormData {
  title: string;
  slug: string;
  description: string;
  category_id: string;
  price: number;
  original_price: number;
  level: string;
  language: string;
  image_url: string;
  preview_video_url: string;
  requirements: string[];
  what_you_learn: string[];
  is_published: boolean;
  is_featured: boolean;
}

const CourseEditor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isAdmin, hasPermission, canEditOwn, loading: roleLoading } = usePermissionsContext();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [sections, setSections] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    slug: '',
    description: '',
    category_id: '',
    price: 0,
    original_price: 0,
    level: 'beginner',
    language: 'vi',
    image_url: '',
    preview_video_url: '',
    requirements: [''],
    what_you_learn: [''],
    is_published: false,
    is_featured: false,
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newWhatYouLearn, setNewWhatYouLearn] = useState('');

  const canCreate = hasPermission('courses.create');
  const canEdit = hasPermission('courses.edit');
  const isEditing = !!id;
  const hasAccess = isEditing ? (canEdit || hasPermission('courses.edit_own')) : canCreate;

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
      fetchCategories();
      if (isEditing) {
        fetchCourse();
      } else {
        setLoading(false);
      }
    }
  }, [hasAccess, id]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('course_categories')
      .select('id, name, slug')
      .order('display_order');
    setCategories(data || []);
  };

  const fetchCourse = async () => {
    setLoading(true);

    const { data: course, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !course) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy khóa học",
        variant: "destructive",
      });
      navigate('/admin/courses');
      return;
    }

    // Check permission - teachers can only edit their own courses
    if (!isAdmin && course.creator_id !== user?.id) {
      toast({
        title: "Không có quyền",
        description: "Bạn chỉ có thể chỉnh sửa khóa học của mình",
        variant: "destructive",
      });
      navigate('/admin/courses');
      return;
    }

    setFormData({
      title: course.title || '',
      slug: course.slug || '',
      description: course.description || '',
      category_id: course.category_id || '',
      price: course.price || 0,
      original_price: course.original_price || 0,
      level: course.level || 'beginner',
      language: course.language || 'vi',
      image_url: course.image_url || '',
      preview_video_url: course.preview_video_url || '',
      requirements: course.requirements?.length ? course.requirements : [''],
      what_you_learn: course.what_you_learn?.length ? course.what_you_learn : [''],
      is_published: course.is_published || false,
      is_featured: course.is_featured || false,
    });

    // Fetch sections and lessons
    const { data: sectionsData } = await supabase
      .from('course_sections')
      .select('*')
      .eq('course_id', id)
      .order('section_order');

    if (sectionsData) {
      const sectionsWithLessons = await Promise.all(
        sectionsData.map(async (section) => {
          const { data: lessons } = await supabase
            .from('course_lessons')
            .select('*')
            .eq('section_id', section.id)
            .order('lesson_order');
          
          // Fetch attachments for each lesson
          const lessonsWithAttachments = await Promise.all(
            (lessons || []).map(async (lesson) => {
              const { data: attachments } = await supabase
                .from('lesson_attachments')
                .select('*')
                .eq('lesson_id', lesson.id)
                .order('display_order');
              
              return {
                ...lesson,
                content_type: (lesson.content_type || 'video') as 'video' | 'document' | 'test',
                attachments: attachments || [],
              };
            })
          );

          return {
            ...section,
            lessons: lessonsWithAttachments,
          };
        })
      );
      setSections(sectionsWithLessons);
    }

    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value),
    }));
  };

  const addSection = () => {
    setSections(prev => [
      ...prev,
      {
        title: `Phần ${prev.length + 1}`,
        description: '',
        section_order: prev.length,
        lessons: [],
      },
    ]);
  };

  const updateSection = (index: number, data: Partial<CourseSection>) => {
    setSections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...data };
      return updated;
    });
  };

  const removeSection = (index: number) => {
    setSections(prev => prev.filter((_, i) => i !== index));
  };

  const addLesson = (sectionIndex: number) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].lessons.push({
        title: `Bài ${updated[sectionIndex].lessons.length + 1}`,
        description: '',
        video_url: '',
        duration_minutes: 0,
        lesson_order: updated[sectionIndex].lessons.length,
        is_preview: false,
        content_type: 'video',
      });
      return updated;
    });
  };

  const updateLesson = (sectionIndex: number, lessonIndex: number, data: Partial<CourseLesson>) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].lessons[lessonIndex] = {
        ...updated[sectionIndex].lessons[lessonIndex],
        ...data,
      };
      return updated;
    });
  };

  const removeLesson = (sectionIndex: number, lessonIndex: number) => {
    setSections(prev => {
      const updated = [...prev];
      updated[sectionIndex].lessons = updated[sectionIndex].lessons.filter((_, i) => i !== lessonIndex);
      return updated;
    });
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements.filter(r => r), newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const addWhatYouLearn = () => {
    if (newWhatYouLearn.trim()) {
      setFormData(prev => ({
        ...prev,
        what_you_learn: [...prev.what_you_learn.filter(w => w), newWhatYouLearn.trim()],
      }));
      setNewWhatYouLearn('');
    }
  };

  const removeWhatYouLearn = (index: number) => {
    setFormData(prev => ({
      ...prev,
      what_you_learn: prev.what_you_learn.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên khóa học",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      // Get user profile for creator_name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user?.id)
        .single();

      const totalLessons = sections.reduce((acc, section) => acc + section.lessons.length, 0);
      const totalDuration = sections.reduce((acc, section) => 
        acc + section.lessons.reduce((lessonAcc, lesson) => lessonAcc + (lesson.duration_minutes || 0), 0), 0);

      const courseData = {
        title: formData.title,
        slug: formData.slug || generateSlug(formData.title),
        description: formData.description,
        category_id: formData.category_id || null,
        category: categories.find(c => c.id === formData.category_id)?.slug || 'general',
        price: formData.price,
        original_price: formData.original_price,
        level: formData.level,
        language: formData.language,
        image_url: formData.image_url,
        preview_video_url: formData.preview_video_url,
        requirements: formData.requirements.filter(r => r.trim()),
        what_you_learn: formData.what_you_learn.filter(w => w.trim()),
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        lesson_count: totalLessons,
        duration_hours: Math.round(totalDuration / 60),
        creator_id: user?.id,
        creator_name: profile?.full_name || user?.email?.split('@')[0] || 'Unknown',
        updated_at: new Date().toISOString(),
      };

      let courseId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('courses')
          .insert(courseData)
          .select()
          .single();

        if (error) throw error;
        courseId = data.id;
      }

      // Save sections and lessons
      // First, delete existing sections (lessons will cascade)
      if (isEditing) {
        await supabase
          .from('course_sections')
          .delete()
          .eq('course_id', courseId);
      }

      // Insert new sections and lessons
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const { data: newSection, error: sectionError } = await supabase
          .from('course_sections')
          .insert({
            course_id: courseId,
            title: section.title,
            description: section.description,
            section_order: i,
          })
          .select()
          .single();

        if (sectionError) throw sectionError;

        if (section.lessons.length > 0) {
          for (let j = 0; j < section.lessons.length; j++) {
            const lesson = section.lessons[j];
            const lessonData = {
              section_id: newSection.id,
              title: lesson.title,
              description: lesson.description,
              video_url: lesson.video_url,
              duration_minutes: lesson.duration_minutes,
              lesson_order: j,
              is_preview: lesson.is_preview,
              content_type: lesson.content_type || 'video',
            };

            const { data: newLesson, error: lessonError } = await supabase
              .from('course_lessons')
              .insert(lessonData)
              .select()
              .single();

            if (lessonError) throw lessonError;

            // Save attachments if any
            if (lesson.attachments && lesson.attachments.length > 0) {
              const attachmentsData = lesson.attachments.map((att, k) => ({
                lesson_id: newLesson.id,
                file_name: att.file_name,
                file_url: att.file_url,
                file_type: att.file_type,
                file_size: att.file_size,
                display_order: k,
              }));

              const { error: attachmentsError } = await supabase
                .from('lesson_attachments')
                .insert(attachmentsData);

              if (attachmentsError) throw attachmentsError;
            }
          }
        }
      }

      // Create audit log
      await createAuditLog(
        isEditing ? 'update' : 'create',
        'course',
        courseId,
        isEditing ? { title: formData.title, slug: formData.slug } : null,
        { 
          title: formData.title, 
          slug: formData.slug, 
          is_published: formData.is_published,
          lesson_count: totalLessons,
          section_count: sections.length 
        }
      );

      toast({
        title: "Thành công",
        description: isEditing ? "Đã cập nhật khóa học" : "Đã tạo khóa học mới",
      });

      navigate('/admin/courses');
    } catch (error) {
      console.error('Error saving course:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu khóa học",
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

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/admin/courses">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                {isEditing ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
              </h1>
              <p className="text-muted-foreground mt-1">
                Điền thông tin chi tiết về khóa học
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Đang lưu...' : 'Lưu khóa học'}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>Thông tin chính về khóa học của bạn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tên khóa học *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="VD: Lập trình Web với React từ cơ bản đến nâng cao"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Đường dẫn (URL)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="lap-trinh-web-voi-react"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả khóa học</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Mô tả chi tiết về nội dung và mục tiêu của khóa học..."
                    rows={5}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Danh mục</Label>
                    <Select 
                      value={formData.category_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Cấp độ</Label>
                    <Select 
                      value={formData.level} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, level: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn cấp độ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Cơ bản</SelectItem>
                        <SelectItem value="intermediate">Trung bình</SelectItem>
                        <SelectItem value="advanced">Nâng cao</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Media */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Hình ảnh & Video</CardTitle>
                <CardDescription>Ảnh bìa và video giới thiệu khóa học</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image_url">URL ảnh bìa</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="preview_video_url">URL video giới thiệu</Label>
                  <Input
                    id="preview_video_url"
                    value={formData.preview_video_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, preview_video_url: e.target.value }))}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Bạn sẽ học được gì</CardTitle>
                <CardDescription>Liệt kê những điều học viên sẽ đạt được</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newWhatYouLearn}
                    onChange={(e) => setNewWhatYouLearn(e.target.value)}
                    placeholder="VD: Xây dựng ứng dụng web hoàn chỉnh"
                    onKeyPress={(e) => e.key === 'Enter' && addWhatYouLearn()}
                  />
                  <Button type="button" onClick={addWhatYouLearn} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.what_you_learn.filter(w => w).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                      <span className="flex-1">{item}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeWhatYouLearn(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Yêu cầu</CardTitle>
                <CardDescription>Những điều kiện cần thiết để tham gia khóa học</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    placeholder="VD: Kiến thức cơ bản về HTML, CSS"
                    onKeyPress={(e) => e.key === 'Enter' && addRequirement()}
                  />
                  <Button type="button" onClick={addRequirement} size="icon">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.requirements.filter(r => r).map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded">
                      <span className="flex-1">{item}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeRequirement(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Curriculum */}
            <Card className="border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Nội dung khóa học</CardTitle>
                  <CardDescription>Các phần và bài học trong khóa học</CardDescription>
                </div>
                <Button onClick={addSection} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Thêm phần
                </Button>
              </CardHeader>
              <CardContent>
                {sections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Chưa có nội dung nào</p>
                    <Button onClick={addSection} variant="outline" className="mt-4">
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm phần đầu tiên
                    </Button>
                  </div>
                ) : (
                  <Accordion type="multiple" className="space-y-4">
                    {sections.map((section, sectionIndex) => (
                      <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`} className="border rounded-lg">
                        <AccordionTrigger className="px-4 hover:no-underline">
                          <div className="flex items-center gap-3 flex-1">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{section.title}</span>
                            <Badge variant="outline" className="ml-auto mr-2">
                              {section.lessons.length} bài học
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 pb-4 space-y-4">
                          <div className="space-y-3">
                            <div className="space-y-2">
                              <Label>Tên phần</Label>
                              <Input
                                value={section.title}
                                onChange={(e) => updateSection(sectionIndex, { title: e.target.value })}
                                placeholder="VD: Giới thiệu khóa học"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Mô tả</Label>
                              <Textarea
                                value={section.description}
                                onChange={(e) => updateSection(sectionIndex, { description: e.target.value })}
                                placeholder="Mô tả ngắn về phần này..."
                                rows={2}
                              />
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <Label>Bài học</Label>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => addLesson(sectionIndex)}
                                className="gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Thêm bài
                              </Button>
                            </div>
                            
                            {section.lessons.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                Chưa có bài học nào
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {section.lessons.map((lesson, lessonIndex) => (
                                  <div key={lessonIndex}>
                                    <LessonEditor
                                      lesson={lesson}
                                      sectionIndex={sectionIndex}
                                      lessonIndex={lessonIndex}
                                      onUpdate={(data) => updateLesson(sectionIndex, lessonIndex, data)}
                                      onRemove={() => removeLesson(sectionIndex, lessonIndex)}
                                    />
                                    {lesson.content_type === 'test' && lesson.id && (
                                      <div className="mt-2 ml-10">
                                        <CourseTestEditor 
                                          lessonId={lesson.id} 
                                          lessonTitle={lesson.title} 
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end pt-2">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeSection(sectionIndex)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Xóa phần này
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Giá khóa học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá bán (VNĐ)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    placeholder="0 = Miễn phí"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="original_price">Giá gốc (VNĐ)</Label>
                  <Input
                    id="original_price"
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, original_price: parseInt(e.target.value) || 0 }))}
                    placeholder="Để trống nếu không có"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Trạng thái</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Xuất bản</Label>
                    <p className="text-sm text-muted-foreground">Hiển thị công khai</p>
                  </div>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_published: checked }))}
                  />
                </div>
                
                {isAdmin && (
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Nổi bật</Label>
                      <p className="text-sm text-muted-foreground">Hiển thị ở trang chủ</p>
                    </div>
                    <Switch
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Tóm tắt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số phần:</span>
                    <span>{sections.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Số bài học:</span>
                    <span>{sections.reduce((acc, s) => acc + s.lessons.length, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng thời lượng:</span>
                    <span>
                      {Math.round(sections.reduce((acc, s) => 
                        acc + s.lessons.reduce((la, l) => la + (l.duration_minutes || 0), 0), 0) / 60
                      )}h
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseEditor;
