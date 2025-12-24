import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu, MessageSquare, Users, TrendingUp, Clock, Heart, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Forum = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const categories = [
    { icon: MessageSquare, label: "General Discussion", count: 234 },
    { icon: TrendingUp, label: "Tips & Tricks", count: 89 },
    { icon: Users, label: "Community Help", count: 156 },
  ];

  const posts = [
    {
      title: "How to create effective multiple choice questions?",
      author: "Sarah K.",
      replies: 12,
      likes: 45,
      time: "2 hours ago",
      tags: ["tips", "mcq"],
    },
    {
      title: "Best practices for exam time limits",
      author: "John D.",
      replies: 8,
      likes: 32,
      time: "5 hours ago",
      tags: ["discussion"],
    },
    {
      title: "AI grading feature is amazing!",
      author: "Mike R.",
      replies: 23,
      likes: 78,
      time: "1 day ago",
      tags: ["feedback", "ai"],
    },
    {
      title: "Feature request: Export to PDF",
      author: "Emma L.",
      replies: 15,
      likes: 56,
      time: "2 days ago",
      tags: ["feature-request"],
    },
  ];

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
            <h1 className="font-semibold text-foreground">Forum</h1>
            <div className="flex-1" />
            <Button size="sm">New Post</Button>
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Hero */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                Community Forum
              </h1>
              <p className="text-muted-foreground">
                Connect with other educators and share your experiences
              </p>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((cat, index) => (
                <Card key={index} className="glass-card hover:border-primary/30 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <cat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">{cat.label}</h3>
                      <p className="text-sm text-muted-foreground">{cat.count} topics</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Posts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Discussions</CardTitle>
                <CardDescription>Join the conversation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {posts.map((post, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-colors cursor-pointer"
                  >
                    <h3 className="font-medium text-foreground mb-2">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>by {post.author}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.time}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {post.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {post.replies}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Forum;
