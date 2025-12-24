import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  created_at: string;
  post_count?: number;
}

export interface ForumPost {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  content: string;
  tags: string[];
  likes_count: number;
  replies_count: number;
  created_at: string;
  updated_at: string;
  author_name?: string;
  user_liked?: boolean;
}

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
      const { data: categoriesData, error: catError } = await supabase
        .from("forum_categories")
        .select("*");

      if (catError) throw catError;

      // Get post counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (cat) => {
          const { count } = await supabase
            .from("forum_posts")
            .select("*", { count: "exact", head: true })
            .eq("category_id", cat.id);
          return { ...cat, post_count: count || 0 };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: postsData, error: postsError } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (postsError) throw postsError;

      // Get author names from profiles
      const postsWithAuthors = await Promise.all(
        (postsData || []).map(async (post) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", post.user_id)
            .maybeSingle();

          let userLiked = false;
          if (user) {
            const { data: like } = await supabase
              .from("forum_post_likes")
              .select("id")
              .eq("post_id", post.id)
              .eq("user_id", user.id)
              .maybeSingle();
            userLiked = !!like;
          }

          return {
            ...post,
            author_name: profile?.full_name || "Anonymous",
            user_liked: userLiked,
          };
        })
      );

      setPosts(postsWithAuthors);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPost = async (title: string, content: string, categoryId?: string, tags?: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("forum_posts")
        .insert([{
          user_id: user.id,
          title,
          content,
          category_id: categoryId,
          tags: tags || [],
        }])
        .select()
        .single();

      if (error) throw error;

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.user_liked) {
        // Unlike
        await supabase
          .from("forum_post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", user.id);

        await supabase
          .from("forum_posts")
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq("id", postId);
      } else {
        // Like
        await supabase
          .from("forum_post_likes")
          .insert([{ post_id: postId, user_id: user.id }]);

        await supabase
          .from("forum_posts")
          .update({ likes_count: post.likes_count + 1 })
          .eq("id", postId);
      }

      await fetchPosts();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

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
    refetch: () => { fetchCategories(); fetchPosts(); },
  };
}
