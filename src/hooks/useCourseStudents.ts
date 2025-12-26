import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface CourseStudent {
  id: string;
  course_id: string;
  student_name: string;
  student_email: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useCourseStudents(courseId: string | undefined) {
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      fetchStudents();
    }
  }, [courseId]);

  const fetchStudents = async () => {
    if (!courseId) return;
    
    try {
      const { data, error } = await supabase
        .from("course_students")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addStudent = async (studentName: string, studentEmail: string) => {
    if (!courseId) return;

    try {
      const { data, error } = await supabase
        .from("course_students")
        .insert([{
          course_id: courseId,
          student_name: studentName,
          student_email: studentEmail,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Student Added",
        description: "Student has been added to the course.",
      });

      await fetchStudents();
      return data;
    } catch (error) {
      console.error("Error adding student:", error);
      toast({
        title: "Error",
        description: "Failed to add student.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const addStudentsBulk = async (students: { name: string; email: string }[]) => {
    if (!courseId || students.length === 0) return;

    try {
      const { error } = await supabase
        .from("course_students")
        .insert(
          students.map(s => ({
            course_id: courseId,
            student_name: s.name,
            student_email: s.email,
          }))
        );

      if (error) throw error;

      toast({
        title: "Students Added",
        description: `${students.length} students have been added to the course.`,
      });

      await fetchStudents();
    } catch (error) {
      console.error("Error adding students:", error);
      toast({
        title: "Error",
        description: "Failed to add students.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateStudent = async (id: string, updates: Partial<CourseStudent>) => {
    try {
      const { error } = await supabase
        .from("course_students")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Student Updated",
        description: "Student information has been updated.",
      });

      await fetchStudents();
    } catch (error) {
      console.error("Error updating student:", error);
      toast({
        title: "Error",
        description: "Failed to update student.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { error } = await supabase
        .from("course_students")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Student Removed",
        description: "Student has been removed from the course.",
      });

      await fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    students,
    isLoading,
    addStudent,
    addStudentsBulk,
    updateStudent,
    deleteStudent,
    refetch: fetchStudents,
  };
}
