import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { ForumCategory, ForumPost } from "@/types";
import { forumService, authService } from "@/services";

export type { ForumCategory, ForumPost } from "@/types";

export function useForum() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await forumService.fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const user = await authService.getCurrentUser();
      const data = await forumService.fetchPosts(user?.id);
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (
    title: string,
    content: string,
    categoryId?: string,
    tags?: string[]
  ) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      const data = await forumService.createPost(
        user.id,
        title,
        content,
        categoryId,
        tags
      );

      toast({
        title: "Post Created",
        description: "Your post has been published successfully.",
      });

      await fetchPosts();
      await fetchCategories();
      return data;
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const toggleLike = async (postId: string) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) throw new Error("Not authenticated");

      const post = posts.find((p) => p.id === postId);
      if (!post) return;

      await forumService.toggleLike(
        postId,
        user.id,
        post.likes_count,
        post.user_liked || false
      );

      await fetchPosts();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      await forumService.deletePost(postId);

      toast({
        title: "Post Deleted",
        description: "Your post has been deleted.",
      });

      await fetchPosts();
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    }
  };

  return {
    categories,
    posts,
    isLoading,
    createPost,
    toggleLike,
    deletePost,
    refetch: () => {
      fetchCategories();
      fetchPosts();
    },
  };
}
