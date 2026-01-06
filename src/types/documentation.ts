export interface DocumentationCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  display_order: number;
  created_at: string;
}

export interface DocumentationArticle {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  content: string;
  summary: string | null;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}
