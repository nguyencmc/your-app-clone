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
