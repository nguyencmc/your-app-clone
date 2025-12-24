import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Course {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  subject: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createCourse = async (title: string, description?: string, subject?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("courses")
        .insert([{
          user_id: user.id,
          title,
          description,
          subject,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Course Created",
        description: "Your course has been created successfully.",
      });

      await fetchCourses();
      return data;
    } catch (error) {
      console.error("Error creating course:", error);
      toast({
        title: "Error",
        description: "Failed to create course.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCourse = async (id: string, updates: Partial<Course>) => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Course Updated",
        description: "Your course has been updated successfully.",
      });

      await fetchCourses();
      return data;
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: "Failed to update course.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCourse = async (id: string) => {
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Course Deleted",
        description: "Your course has been deleted.",
      });

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

  return { courses, isLoading, createCourse, updateCourse, deleteCourse, refetch: fetchCourses };
}
