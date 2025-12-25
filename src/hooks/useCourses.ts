import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

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

  const uploadCourseImage = async (file: File): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("course-images")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-images")
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image.",
        variant: "destructive",
      });
      return null;
    }
  };

  const createCourse = async (
    title: string, 
    description?: string, 
    subject?: string,
    imageFile?: File
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let image_url: string | null = null;
      if (imageFile) {
        image_url = await uploadCourseImage(imageFile);
      }

      const { data, error } = await supabase
        .from("courses")
        .insert([{
          user_id: user.id,
          title,
          description,
          subject,
          image_url,
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

  const updateCourse = async (
    id: string, 
    updates: Partial<Course>,
    imageFile?: File
  ) => {
    try {
      let image_url = updates.image_url;
      if (imageFile) {
        image_url = await uploadCourseImage(imageFile);
      }

      const { data, error } = await supabase
        .from("courses")
        .update({ ...updates, image_url })
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

  return { 
    courses, 
    isLoading, 
    createCourse, 
    updateCourse, 
    deleteCourse, 
    uploadCourseImage,
    refetch: fetchCourses 
  };
}
