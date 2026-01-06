import { supabase } from "@/integrations/supabase/client";
import { DocumentationCategory, DocumentationArticle } from "@/types";

export const documentationService = {
  async fetchCategories(): Promise<DocumentationCategory[]> {
    const { data, error } = await supabase
      .from("documentation_categories")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async fetchArticles(): Promise<DocumentationArticle[]> {
    const { data, error } = await supabase
      .from("documentation_articles")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;
    return data || [];
  },
};
