import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu, Book, FileText, Video, Code, ExternalLink, Search, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useDocumentation, DocumentationCategory, DocumentationArticle } from "@/hooks/useDocumentation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  book: Book,
  "file-text": FileText,
  video: Video,
  code: Code,
};

const Documentation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<DocumentationArticle | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DocumentationCategory | null>(null);
  const navigate = useNavigate();
  
  const { categories, articles, featuredArticles, isLoading, getArticlesByCategory } = useDocumentation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  // Filter articles based on search
  const filteredArticles = searchQuery
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.summary?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar userName={userName} />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 lg:px-6 h-14 flex items-center gap-4">
            <SidebarTrigger className="lg:hidden">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <h1 className="font-semibold text-foreground">Documentation</h1>
            <div className="flex-1" />
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Hero */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                Documentation
              </h1>
              <p className="text-muted-foreground">
                Everything you need to know about using ExamAi
              </p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && filteredArticles.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-auto">
                  {filteredArticles.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => {
                        setSelectedArticle(article);
                        setSearchQuery("");
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-muted/50 border-b border-border/50 last:border-0"
                    >
                      <p className="font-medium text-foreground text-sm">{article.title}</p>
                      {article.summary && (
                        <p className="text-xs text-muted-foreground truncate">{article.summary}</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Doc Categories */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => {
                  const IconComponent = iconMap[category.icon] || Book;
                  const articleCount = getArticlesByCategory(category.id).length;
                  
                  return (
                    <Card 
                      key={category.id}
                      onClick={() => setSelectedCategory(category)}
                      className={`bg-gradient-to-br ${category.color} border-border/50 hover:scale-[1.02] transition-transform cursor-pointer`}
                    >
                      <CardHeader>
                        <IconComponent className="w-8 h-8 text-foreground mb-2" />
                        <CardTitle className="text-base flex items-center gap-2">
                          {category.name}
                          <Badge variant="secondary" className="text-xs">
                            {articleCount}
                          </Badge>
                        </CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Featured Articles */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Featured Guides</CardTitle>
                <CardDescription>Popular tutorials and how-to articles</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Skeleton key={i} className="h-14 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {featuredArticles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => setSelectedArticle(article)}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-colors text-left"
                      >
                        <FileText className="w-4 h-4 text-primary shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-foreground block truncate">{article.title}</span>
                          {article.summary && (
                            <span className="text-xs text-muted-foreground block truncate">{article.summary}</span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help CTA */}
            <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/20">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Need more help?</h3>
                  <p className="text-sm text-muted-foreground">Contact our support team for assistance</p>
                </div>
                <Button>Contact Support</Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Article Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {selectedArticle?.content.split('\n').map((line, i) => {
              if (line.startsWith('# ')) {
                return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
              }
              if (line.startsWith('## ')) {
                return <h2 key={i} className="text-lg font-semibold mt-3 mb-2">{line.slice(3)}</h2>;
              }
              if (line.startsWith('- ')) {
                return <li key={i} className="ml-4">{line.slice(2)}</li>;
              }
              if (line.match(/^\d+\. /)) {
                return <li key={i} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
              }
              if (line.trim() === '') {
                return <br key={i} />;
              }
              return <p key={i} className="text-muted-foreground">{line}</p>;
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedCategory?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {selectedCategory && getArticlesByCategory(selectedCategory.id).map((article) => (
              <button
                key={article.id}
                onClick={() => {
                  setSelectedArticle(article);
                  setSelectedCategory(null);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground block">{article.title}</span>
                  {article.summary && (
                    <span className="text-xs text-muted-foreground block truncate">{article.summary}</span>
                  )}
                </div>
                {article.is_featured && (
                  <Badge variant="secondary" className="text-xs shrink-0">Featured</Badge>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Documentation;
