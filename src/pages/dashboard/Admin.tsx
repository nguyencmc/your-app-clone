import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useUserRole, AppRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  FileText, 
  BookOpen, 
  Shield, 
  Trash2, 
  Loader2,
  ShieldCheck,
  ShieldAlert,
  User,
  Tag,
  Plus,
  Pencil
} from "lucide-react";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface UserWithRole extends Profile {
  roles: AppRole[];
  email?: string;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  question_count: number;
  created_at: string;
  user_id: string;
  user_name?: string;
}

interface Course {
  id: string;
  title: string;
  subject: string | null;
  description: string | null;
  created_at: string;
  user_id: string;
  user_name?: string;
}

interface Subject {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoading: roleLoading } = useUserRole();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("users");
  
  // Subject management state
  const [newSubjectName, setNewSubjectName] = useState("");
  const [newSubjectDescription, setNewSubjectDescription] = useState("");
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [editSubjectDescription, setEditSubjectDescription] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [roleLoading, isAdmin, navigate, toast]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllData();
    }
  }, [isAdmin]);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([fetchUsers(), fetchExams(), fetchCourses(), fetchSubjects()]);
    setIsLoading(false);
  };

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: allRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Map roles to users
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRoles = (allRoles || [])
          .filter((r) => r.user_id === profile.user_id)
          .map((r) => r.role as AppRole);
        
        return {
          ...profile,
          roles: userRoles.length > 0 ? userRoles : ["user"],
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user profiles for each exam
      const userIds = [...new Set((data || []).map((e) => e.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const examsWithUsers = (data || []).map((exam) => {
        const profile = profiles?.find((p) => p.user_id === exam.user_id);
        return {
          ...exam,
          user_name: profile?.full_name || "Unknown User",
        };
      });

      setExams(examsWithUsers);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get user profiles for each course
      const userIds = [...new Set((data || []).map((c) => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const coursesWithUsers = (data || []).map((course) => {
        const profile = profiles?.find((p) => p.user_id === course.user_id);
        return {
          ...course,
          user_name: profile?.full_name || "Unknown User",
        };
      });

      setCourses(coursesWithUsers);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    try {
      // First, remove existing roles for this user
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      // Then insert the new role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole });

      if (error) throw error;

      toast({
        title: "Role Updated",
        description: `User role has been updated to ${newRole}.`,
      });

      await fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExam = async (id: string) => {
    try {
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Exam Deleted" });
      await fetchExams();
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast({
        title: "Error",
        description: "Failed to delete exam.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Course Deleted" });
      await fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: "Failed to delete course.",
        variant: "destructive",
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) {
      toast({
        title: "Error",
        description: "Subject name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("subjects")
        .insert({ 
          name: newSubjectName.trim(), 
          description: newSubjectDescription.trim() || null 
        });

      if (error) throw error;

      toast({ title: "Subject Added" });
      setNewSubjectName("");
      setNewSubjectDescription("");
      await fetchSubjects();
    } catch (error: any) {
      console.error("Error adding subject:", error);
      toast({
        title: "Error",
        description: error.message?.includes("duplicate") 
          ? "Subject already exists." 
          : "Failed to add subject.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubject = async () => {
    if (!editingSubject || !editSubjectName.trim()) return;

    try {
      const { error } = await supabase
        .from("subjects")
        .update({ 
          name: editSubjectName.trim(), 
          description: editSubjectDescription.trim() || null 
        })
        .eq("id", editingSubject.id);

      if (error) throw error;

      toast({ title: "Subject Updated" });
      setEditingSubject(null);
      setEditSubjectName("");
      setEditSubjectDescription("");
      await fetchSubjects();
    } catch (error: any) {
      console.error("Error updating subject:", error);
      toast({
        title: "Error",
        description: error.message?.includes("duplicate") 
          ? "Subject name already exists." 
          : "Failed to update subject.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      const { error } = await supabase.from("subjects").delete().eq("id", id);
      if (error) throw error;

      toast({ title: "Subject Deleted" });
      await fetchSubjects();
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast({
        title: "Error",
        description: "Failed to delete subject.",
        variant: "destructive",
      });
    }
  };

  const startEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setEditSubjectName(subject.name);
    setEditSubjectDescription(subject.description || "");
  };

  const cancelEditSubject = () => {
    setEditingSubject(null);
    setEditSubjectName("");
    setEditSubjectDescription("");
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <ShieldCheck className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case "moderator":
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <ShieldAlert className="w-3 h-3 mr-1" />
            Moderator
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <User className="w-3 h-3 mr-1" />
            User
          </Badge>
        );
    }
  };

  if (roleLoading || isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <DashboardSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <p className="text-muted-foreground">
                Manage users, exams, and courses across the platform
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{users.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{exams.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{courses.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
                  <Tag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subjects.length}</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Users ({users.length})
                </TabsTrigger>
                <TabsTrigger value="exams" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Exams ({exams.length})
                </TabsTrigger>
                <TabsTrigger value="courses" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Courses ({courses.length})
                </TabsTrigger>
                <TabsTrigger value="subjects" className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Subjects ({subjects.length})
                </TabsTrigger>
              </TabsList>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View and manage user roles</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                {user.avatar_url ? (
                                  <img
                                    src={user.avatar_url}
                                    alt={user.full_name || "User"}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                  </div>
                                )}
                                <div>
                                  <p className="font-medium">{user.full_name || "No name"}</p>
                                  <p className="text-xs text-muted-foreground">{user.user_id.slice(0, 8)}...</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {user.roles.map((role) => (
                                  <span key={role}>{getRoleBadge(role)}</span>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(user.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Select
                                defaultValue={user.roles[0]}
                                onValueChange={(value) => handleRoleChange(user.user_id, value as AppRole)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Change role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="moderator">Moderator</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Exams Tab */}
              <TabsContent value="exams">
                <Card>
                  <CardHeader>
                    <CardTitle>Exam Management</CardTitle>
                    <CardDescription>View and manage all exams</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Questions</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {exams.map((exam) => (
                          <TableRow key={exam.id}>
                            <TableCell className="font-medium">{exam.title}</TableCell>
                            <TableCell>{exam.subject}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{exam.difficulty}</Badge>
                            </TableCell>
                            <TableCell>{exam.question_count}</TableCell>
                            <TableCell>{exam.user_name}</TableCell>
                            <TableCell>
                              {new Date(exam.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Exam</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{exam.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteExam(exam.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Courses Tab */}
              <TabsContent value="courses">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Management</CardTitle>
                    <CardDescription>View and manage all courses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Created By</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {courses.map((course) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.title}</TableCell>
                            <TableCell>{course.subject || "-"}</TableCell>
                            <TableCell>{course.user_name}</TableCell>
                            <TableCell>
                              {new Date(course.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{course.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCourse(course.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Subjects Tab */}
              <TabsContent value="subjects">
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Management</CardTitle>
                    <CardDescription>Manage subjects for exams and courses</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Add New Subject Form */}
                    <div className="flex gap-4 p-4 border rounded-lg bg-muted/30">
                      <Input
                        placeholder="Subject name *"
                        value={newSubjectName}
                        onChange={(e) => setNewSubjectName(e.target.value)}
                        className="max-w-xs"
                      />
                      <Input
                        placeholder="Description (optional)"
                        value={newSubjectDescription}
                        onChange={(e) => setNewSubjectDescription(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleAddSubject}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Subject
                      </Button>
                    </div>

                    {/* Subjects Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Created At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subjects.map((subject) => (
                          <TableRow key={subject.id}>
                            <TableCell className="font-medium">
                              {editingSubject?.id === subject.id ? (
                                <Input
                                  value={editSubjectName}
                                  onChange={(e) => setEditSubjectName(e.target.value)}
                                  className="max-w-xs"
                                />
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Tag className="w-4 h-4 text-primary" />
                                  {subject.name}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {editingSubject?.id === subject.id ? (
                                <Input
                                  value={editSubjectDescription}
                                  onChange={(e) => setEditSubjectDescription(e.target.value)}
                                  placeholder="Description"
                                />
                              ) : (
                                subject.description || "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {new Date(subject.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {editingSubject?.id === subject.id ? (
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={handleUpdateSubject}>
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEditSubject}>
                                    Cancel
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => startEditSubject(subject)}
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Subject</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{subject.name}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteSubject(subject.id)}
                                          className="bg-destructive text-destructive-foreground"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {subjects.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              No subjects yet. Add one above.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Admin;