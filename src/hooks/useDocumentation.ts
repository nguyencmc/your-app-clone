import { useState, useEffect } from "react";
import { DocumentationCategory, DocumentationArticle } from "@/types";
import { documentationService } from "@/services";

export type { DocumentationCategory, DocumentationArticle } from "@/types";

export const useDocumentation = () => {
  const [categories, setCategories] = useState<DocumentationCategory[]>([]);
  const [articles, setArticles] = useState<DocumentationArticle[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<
    DocumentationArticle[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [categoriesData, articlesData] = await Promise.all([
        documentationService.fetchCategories(),
        documentationService.fetchArticles(),
      ]);

      setCategories(categoriesData);
      setArticles(articlesData);
      setFeaturedArticles(articlesData.filter((a) => a.is_featured));
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
