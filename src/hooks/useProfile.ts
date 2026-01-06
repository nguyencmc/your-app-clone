import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/types";
import { profileService, authService } from "@/services";

export type { Profile } from "@/types";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      let data = await profileService.fetchProfile(user.id);

      if (!data) {
        data = await profileService.createProfile(
          user.id,
          user.user_metadata?.full_name
        );
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      const data = await profileService.updateProfile(user.id, updates);
      setProfile(data);

      toast({
        title: "Profile Updated",
        description: "Your settings have been saved successfully.",
      });

      return data;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadAvatar = async (file: File) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      const publicUrl = await profileService.uploadAvatar(user.id, file);
      await updateProfile({ avatar_url: publicUrl });

      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully.",
      });

      return publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload avatar.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    profile,
    isLoading,
    updateProfile,
    uploadAvatar,
    refetch: fetchProfile,
  };
}
