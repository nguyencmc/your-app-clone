import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export const useDocumentation = () => {
  const [categories, setCategories] = useState<DocumentationCategory[]>([]);
  const [articles, setArticles] = useState<DocumentationArticle[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<DocumentationArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("documentation_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch all articles
      const { data: articlesData, error: articlesError } = await supabase
        .from("documentation_articles")
        .select("*")
        .order("display_order", { ascending: true });

      if (articlesError) throw articlesError;

      setCategories(categoriesData || []);
      setArticles(articlesData || []);
      setFeaturedArticles((articlesData || []).filter((a) => a.is_featured));
    } catch (error) {
      console.error("Error fetching documentation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getArticlesByCategory = (categoryId: string) => {
    return articles.filter((article) => article.category_id === categoryId);
  };

  const getArticleBySlug = (slug: string) => {
    return articles.find((article) => article.slug === slug);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    categories,
    articles,
    featuredArticles,
    isLoading,
    getArticlesByCategory,
    getArticleBySlug,
    refetch: fetchData,
  };
};
