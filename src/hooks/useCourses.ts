import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Course } from "@/types";
import { courseService } from "@/services";
import { authService } from "@/services";

export type { Course } from "@/types";

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      const data = await courseService.fetchCourses(user.id);
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadCourseImage = async (file: File): Promise<string | null> => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      return await courseService.uploadCourseImage(user.id, file);
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
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadCourseImage(imageFile);
      }

      const data = await courseService.createCourse(
        user.id,
        title,
        description,
        subject,
        imageUrl
      );

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
      let imageUrl = updates.image_url;
      if (imageFile) {
        imageUrl = await uploadCourseImage(imageFile);
      }

      const data = await courseService.updateCourse(id, {
        ...updates,
        image_url: imageUrl,
      });

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
      await courseService.deleteCourse(id);

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
    refetch: fetchCourses,
  };
}
