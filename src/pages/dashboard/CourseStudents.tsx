import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCourseStudents, CourseStudent } from "@/hooks/useCourseStudents";
import { 
  UserPlus, 
  Database, 
  Search, 
  Loader2, 
  Trash2, 
  ArrowLeft,
  Users,
  Pencil
} from "lucide-react";

const CourseStudents = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { students, isLoading, addStudent, addStudentsBulk, updateStudent, deleteStudent } = useCourseStudents(courseId);
  
  const [courseName, setCourseName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Add student form
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  
  // Edit student
  const [editingStudent, setEditingStudent] = useState<CourseStudent | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch course name
      if (courseId) {
        const { data: course } = await supabase
          .from("courses")
          .select("title")
          .eq("id", courseId)
          .maybeSingle();
        
        if (course) {
          setCourseName(course.title);
        }
      }
    };
    checkAuth();
  }, [courseId, navigate]);

  const handleAddStudent = async () => {
    if (!studentName.trim() || !studentEmail.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addStudent(studentName, studentEmail);
      setStudentName("");
      setStudentEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkImport = async () => {
    if (!bulkData.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Parse CSV-like data (name,email per line)
      const lines = bulkData.trim().split("\n");
      const studentsToAdd = lines
        .map(line => {
          const [name, email] = line.split(",").map(s => s.trim());
          return { name, email };
        })
        .filter(s => s.name && s.email);

      if (studentsToAdd.length > 0) {
        await addStudentsBulk(studentsToAdd);
        setBulkData("");
        setIsBulkDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = (student: CourseStudent) => {
    setEditingStudent(student);
    setEditName(student.student_name);
    setEditEmail(student.student_email);
  };

  const handleSaveEdit = async () => {
    if (!editingStudent || !editName.trim() || !editEmail.trim()) return;
    
    setIsSubmitting(true);
    try {
      await updateStudent(editingStudent.id, {
        student_name: editName,
        student_email: editEmail,
      });
      setEditingStudent(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    student =>
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/courses")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">{courseName || "Course"}</h1>
                  <p className="text-muted-foreground">Student Management</p>
                </div>
              </div>
            </div>

            {/* Add Students Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Bulk Import Card */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Load in Bulk</CardTitle>
                      <CardDescription>Import multiple students from various sources.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/30 hover:bg-primary/10"
                    onClick={() => setIsBulkDialogOpen(true)}
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Load in Bulk
                  </Button>
                </CardContent>
              </Card>

              {/* Add Single Student Card */}
              <Card className="border-purple-500/20 bg-purple-500/5">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <UserPlus className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Add New Student</CardTitle>
                      <CardDescription>Manually add students to your course.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Student name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="bg-background/50"
                  />
                  <Input
                    type="email"
                    placeholder="Student email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className="bg-background/50"
                  />
                  <Button 
                    variant="outline"
                    className="w-full border-purple-500/30 hover:bg-purple-500/10"
                    onClick={handleAddStudent}
                    disabled={isSubmitting || !studentName.trim() || !studentEmail.trim()}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Add Student
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search students"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <UserPlus className="w-12 h-12 mb-4" />
                    <p>No students yet</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.student_name}</TableCell>
                          <TableCell>{student.student_email}</TableCell>
                          <TableCell>
                            <Badge variant={student.status === "active" ? "default" : "secondary"}>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditStudent(student)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Student</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove "{student.student_name}" from this course?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteStudent(student.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Remove
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

            {/* Bulk Import Dialog */}
            <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Bulk Import Students</DialogTitle>
                  <DialogDescription>
                    Enter student data in CSV format (name, email per line)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Student Data</Label>
                    <Textarea
                      value={bulkData}
                      onChange={(e) => setBulkData(e.target.value)}
                      placeholder="John Doe, john@example.com&#10;Jane Smith, jane@example.com"
                      rows={8}
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: Name, Email (one student per line)
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleBulkImport} disabled={isSubmitting || !bulkData.trim()}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Import Students
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Edit Student</DialogTitle>
                  <DialogDescription>
                    Update student information
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditingStudent(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CourseStudents;
