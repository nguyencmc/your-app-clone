import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCourses, Course } from "@/hooks/useCourses";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GraduationCap, 
  Image, 
  Loader2, 
  Users, 
  Search,
  LayoutGrid,
  List,
  MoreVertical,
  FileText,
  BookOpen,
  Calendar,
  FolderOpen,
  ClipboardList
} from "lucide-react";

const Courses = () => {
  const navigate = useNavigate();
  const { courses, isLoading, createCourse, updateCourse, deleteCourse } = useCourses();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) navigate("/auth");
    };
    checkAuth();
  }, [navigate]);

  // Fetch student counts for all courses
  useEffect(() => {
    const fetchStudentCounts = async () => {
      if (courses.length === 0) return;
      
      const counts: Record<string, number> = {};
      for (const course of courses) {
        const { count } = await supabase
          .from("course_students")
          .select("*", { count: "exact", head: true })
          .eq("course_id", course.id);
        counts[course.id] = count || 0;
      }
      setStudentCounts(counts);
    };
    
    fetchStudentCounts();
  }, [courses]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", subject: "" });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) return;
    
    setIsSaving(true);
    try {
      const newCourse = await createCourse(
        formData.title,
        formData.description || undefined,
        formData.subject || undefined,
        imageFile || undefined
      );
      resetForm();
      setIsCreateOpen(false);
      if (newCourse?.id) {
        navigate(`/dashboard/courses/${newCourse.id}/students`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || "",
      subject: course.subject || "",
    });
    setImagePreview(course.image_url);
    setIsEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingCourse || !formData.title.trim()) return;
    
    setIsSaving(true);
    try {
      await updateCourse(
        editingCourse.id,
        {
          title: formData.title,
          description: formData.description || null,
          subject: formData.subject || null,
        },
        imageFile || undefined
      );
      resetForm();
      setEditingCourse(null);
      setIsEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    await deleteCourse(deletingCourse.id);
    setDeletingCourse(null);
    setIsDeleteOpen(false);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIconColor = (index: number) => {
    const colors = [
      "bg-purple-500/20 text-purple-400",
      "bg-cyan-500/20 text-cyan-400",
      "bg-pink-500/20 text-pink-400",
      "bg-amber-500/20 text-amber-400",
      "bg-emerald-500/20 text-emerald-400",
    ];
    return colors[index % colors.length];
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                  Courses
                </h1>
                <p className="text-muted-foreground">Manage your courses and students</p>
              </div>
              
              <Button 
                onClick={() => { resetForm(); setIsCreateOpen(true); }}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white border-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Course
              </Button>
            </div>

            {/* Search and View Toggle */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary/50 border-border/50"
                />
              </div>
              <div className="flex items-center rounded-lg bg-secondary/50 p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-primary" : ""}
                >
                  <LayoutGrid className="w-4 h-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-primary" : ""}
                >
                  <List className="w-4 h-4 mr-2" />
                  List
                </Button>
              </div>
            </div>

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredCourses.length === 0 ? (
              /* Empty State */
              <Card className="border-dashed border-primary/30 bg-primary/5">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <GraduationCap className="w-12 h-12 text-primary/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first course to get started
                  </p>
                  <Button 
                    onClick={() => { resetForm(); setIsCreateOpen(true); }}
                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Courses Section */
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <CardContent className="p-6">
                  {/* Section Header */}
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold">§ All Courses</span>
                      <Badge variant="secondary" className="bg-secondary/80">
                        {filteredCourses.length} Courses
                      </Badge>
                    </div>
                  </div>

                  {/* Courses Grid/List */}
                  <div className={
                    viewMode === "grid" 
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                      : "space-y-4"
                  }>
                    {filteredCourses.map((course, index) => (
                      <Card 
                        key={course.id} 
                        className="bg-secondary/30 border-border/50 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group"
                      >
                        <CardContent className="p-5">
                          {/* Course Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${getIconColor(index)}`}>
                                <GraduationCap className="w-6 h-6" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{course.title}</h3>
                                {course.subject && (
                                  <p className="text-sm text-muted-foreground">{course.subject}</p>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(course)}>
                                  <Pencil className="w-4 h-4 mr-2" />
                                  Edit Course
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => { setDeletingCourse(course); setIsDeleteOpen(true); }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Course
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Course Stats */}
                          <div className="flex items-center gap-2 flex-wrap mb-4">
                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30">
                              <Users className="w-3 h-3 mr-1" />
                              {studentCounts[course.id] || 0} students
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs border-border/50 hover:bg-secondary"
                              onClick={() => navigate(`/dashboard/courses/${course.id}/students`)}
                            >
                              <Users className="w-3 h-3 mr-1" />
                              Students
                            </Button>
                            {course.created_at && (
                              <Badge variant="outline" className="border-amber-500/30 text-amber-300">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(course.created_at).getFullYear()}
                              </Badge>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border/50 hover:border-primary/50 hover:bg-primary/10"
                            >
                              <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
                              Files
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-500/50"
                            >
                              <ClipboardList className="w-3.5 h-3.5 mr-1.5" />
                              View Exams
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-pink-500/30 text-pink-300 hover:bg-pink-500/10 hover:border-pink-500/50"
                            >
                              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
                              Lessons
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Create Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Course</DialogTitle>
                  <DialogDescription>
                    Add a new course to your collection
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Course title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g., Mathematics, Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Course description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Course Image</Label>
                    <div className="flex items-center gap-4">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center border">
                          <Image className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={isSaving || !formData.title.trim()}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Course
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Edit Course</DialogTitle>
                  <DialogDescription>
                    Update your course details
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Course title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-subject">Subject</Label>
                    <Input
                      id="edit-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g., Mathematics, Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Course description"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-image">Course Image</Label>
                    <div className="flex items-center gap-4">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center border">
                          <Image className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      <Input
                        id="edit-image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdate} disabled={isSaving || !formData.title.trim()}>
                    {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Alert Dialog */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Course</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{deletingCourse?.title}"? This will also remove all students from this course. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeletingCourse(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Courses;
