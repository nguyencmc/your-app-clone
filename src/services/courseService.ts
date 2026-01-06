import { supabase } from "@/integrations/supabase/client";
import { Course, CourseStudent } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const courseService = {
  async fetchCourses(userId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async uploadCourseImage(userId: string, file: File): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${uuidv4()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("course-images")
      .upload(fileName, file, { upsert: true });

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("course-images").getPublicUrl(fileName);

    return publicUrl;
  },

  async createCourse(
    userId: string,
    title: string,
    description?: string,
    subject?: string,
    imageUrl?: string | null
  ): Promise<Course> {
    const { data, error } = await supabase
      .from("courses")
      .insert([
        {
          user_id: userId,
          title,
          description,
          subject,
          image_url: imageUrl,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateCourse(
    id: string,
    updates: Partial<Course>
  ): Promise<Course> {
    const { data, error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) throw error;
  },

  // Course Students
  async fetchCourseStudents(courseId: string): Promise<CourseStudent[]> {
    const { data, error } = await supabase
      .from("course_students")
      .select("*")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async addStudent(
    courseId: string,
    studentName: string,
    studentEmail: string
  ): Promise<CourseStudent> {
    const { data, error } = await supabase
      .from("course_students")
      .insert([
        {
          course_id: courseId,
          student_name: studentName,
          student_email: studentEmail,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async addStudentsBulk(
    courseId: string,
    students: { name: string; email: string }[]
  ): Promise<void> {
    const { error } = await supabase.from("course_students").insert(
      students.map((s) => ({
        course_id: courseId,
        student_name: s.name,
        student_email: s.email,
      }))
    );

    if (error) throw error;
  },

  async updateStudent(
    id: string,
    updates: Partial<CourseStudent>
  ): Promise<void> {
    const { error } = await supabase
      .from("course_students")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
  },

  async deleteStudent(id: string): Promise<void> {
    const { error } = await supabase
      .from("course_students")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
