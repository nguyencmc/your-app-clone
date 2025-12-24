import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu, MessageSquare, Users, TrendingUp, Clock, Heart, MessageCircle, Plus, X, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForum } from "@/hooks/useForum";
import { formatDistanceToNow } from "date-fns";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "message-square": MessageSquare,
  "trending-up": TrendingUp,
  "users": Users,
};

const Forum = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNewPostDialog, setShowNewPostDialog] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const { categories, posts, isLoading: forumLoading, createPost, toggleLike, deletePost } = useForum();

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

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    setIsSubmitting(true);
    try {
      const tags = newPostTags.split(",").map(t => t.trim()).filter(Boolean);
      await createPost(newPostTitle, newPostContent, newPostCategory || undefined, tags);
      setShowNewPostDialog(false);
      setNewPostTitle("");
      setNewPostContent("");
      setNewPostCategory("");
      setNewPostTags("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

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
            <Button size="sm" onClick={() => setShowNewPostDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              New Post
            </Button>
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
              {categories.map((cat) => {
                const IconComponent = iconMap[cat.icon] || MessageSquare;
                return (
                  <Card key={cat.id} className="glass-card hover:border-primary/30 transition-colors cursor-pointer">
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{cat.name}</h3>
                        <p className="text-sm text-muted-foreground">{cat.post_count || 0} topics</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Recent Posts */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Recent Discussions</CardTitle>
                <CardDescription>Join the conversation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {forumLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-lg border border-border/50 bg-card/50 animate-pulse">
                        <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                        <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No posts yet. Be the first to start a discussion!</p>
                  </div>
                ) : (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-colors"
                    >
                      <h3 className="font-medium text-foreground mb-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span>by {post.author_name}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {post.tags?.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <button
                            onClick={() => toggleLike(post.id)}
                            className={`flex items-center gap-1 hover:text-primary transition-colors ${
                              post.user_liked ? "text-primary" : ""
                            }`}
                          >
                            <Heart className={`w-3 h-3 ${post.user_liked ? "fill-current" : ""}`} />
                            {post.likes_count}
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {post.replies_count}
                          </span>
                          {post.user_id === user?.id && (
                            <button
                              onClick={() => deletePost(post.id)}
                              className="flex items-center gap-1 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* New Post Dialog */}
      <Dialog open={showNewPostDialog} onOpenChange={setShowNewPostDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>Share your thoughts with the community</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What's your topic?"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Share your thoughts..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                placeholder="tips, discussion, help"
                value={newPostTags}
                onChange={(e) => setNewPostTags(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewPostDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePost} disabled={isSubmitting || !newPostTitle.trim() || !newPostContent.trim()}>
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default Forum;
