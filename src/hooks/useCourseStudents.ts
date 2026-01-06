import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { CourseStudent } from "@/types";
import { courseService } from "@/services";

export type { CourseStudent } from "@/types";

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
      const data = await courseService.fetchCourseStudents(courseId);
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addStudent = async (studentName: string, studentEmail: string) => {
    if (!courseId) return;

    try {
      const data = await courseService.addStudent(
        courseId,
        studentName,
        studentEmail
      );

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

  const addStudentsBulk = async (
    studentsData: { name: string; email: string }[]
  ) => {
    if (!courseId || studentsData.length === 0) return;

    try {
      await courseService.addStudentsBulk(courseId, studentsData);

      toast({
        title: "Students Added",
        description: `${studentsData.length} students have been added to the course.`,
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
      await courseService.updateStudent(id, updates);

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
      await courseService.deleteStudent(id);

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
