import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu, Book, FileText, Video, Code, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Documentation = () => {
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

  const docs = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of ExamAi and create your first exam",
      color: "from-primary/20 to-primary/5",
    },
    {
      icon: FileText,
      title: "Creating Exams",
      description: "Detailed guide on creating and customizing exams",
      color: "from-teal-500/20 to-teal-500/5",
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step video guides",
      color: "from-rose-500/20 to-rose-500/5",
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Technical documentation for developers",
      color: "from-purple-500/20 to-purple-500/5",
    },
  ];

  const guides = [
    "How to create multiple choice questions",
    "Setting up exam time limits",
    "Grading exams with AI",
    "Managing student submissions",
    "Exporting exam results",
    "Customizing question difficulty",
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

            {/* Doc Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {docs.map((doc, index) => (
                <Card 
                  key={index} 
                  className={`bg-gradient-to-br ${doc.color} border-border/50 hover:scale-[1.02] transition-transform cursor-pointer`}
                >
                  <CardHeader>
                    <doc.icon className="w-8 h-8 text-foreground mb-2" />
                    <CardTitle className="text-base">{doc.title}</CardTitle>
                    <CardDescription>{doc.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Quick Guides */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Quick Guides</CardTitle>
                <CardDescription>Popular tutorials and how-to articles</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {guides.map((guide, index) => (
                    <button
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-colors text-left"
                    >
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground">{guide}</span>
                      <ExternalLink className="w-3 h-3 text-muted-foreground ml-auto" />
                    </button>
                  ))}
                </div>
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
    </SidebarProvider>
  );
};

export default Documentation;
