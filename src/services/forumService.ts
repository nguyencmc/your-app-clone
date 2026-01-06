import { supabase } from "@/integrations/supabase/client";
import { ForumCategory, ForumPost } from "@/types";

export const forumService = {
  async fetchCategories(): Promise<ForumCategory[]> {
    const { data: categoriesData, error: catError } = await supabase
      .from("forum_categories")
      .select("*");

    if (catError) throw catError;

    const categoriesWithCounts = await Promise.all(
      (categoriesData || []).map(async (cat) => {
        const { count } = await supabase
          .from("forum_posts")
          .select("*", { count: "exact", head: true })
          .eq("category_id", cat.id);
        return { ...cat, post_count: count || 0 };
      })
    );

    return categoriesWithCounts;
  },

  async fetchPosts(userId?: string): Promise<ForumPost[]> {
    const { data: postsData, error: postsError } = await supabase
      .from("forum_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (postsError) throw postsError;

    const postsWithAuthors = await Promise.all(
      (postsData || []).map(async (post) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", post.user_id)
          .maybeSingle();

        let userLiked = false;
        if (userId) {
          const { data: like } = await supabase
            .from("forum_post_likes")
            .select("id")
            .eq("post_id", post.id)
            .eq("user_id", userId)
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

    return postsWithAuthors;
  },

  async createPost(
    userId: string,
    title: string,
    content: string,
    categoryId?: string,
    tags?: string[]
  ): Promise<ForumPost> {
    const { data, error } = await supabase
      .from("forum_posts")
      .insert([
        {
          user_id: userId,
          title,
          content,
          category_id: categoryId,
          tags: tags || [],
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async toggleLike(
    postId: string,
    userId: string,
    currentLikesCount: number,
    isLiked: boolean
  ): Promise<void> {
    if (isLiked) {
      await supabase
        .from("forum_post_likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);

      await supabase
        .from("forum_posts")
        .update({ likes_count: Math.max(0, currentLikesCount - 1) })
        .eq("id", postId);
    } else {
      await supabase
        .from("forum_post_likes")
        .insert([{ post_id: postId, user_id: userId }]);

      await supabase
        .from("forum_posts")
        .update({ likes_count: currentLikesCount + 1 })
        .eq("id", postId);
    }
  },

  async deletePost(postId: string): Promise<void> {
    const { error } = await supabase
      .from("forum_posts")
      .delete()
      .eq("id", postId);

    if (error) throw error;
  },
};
