import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Playground = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState("");
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

  const examplePrompts = [
    "Create a calculus exam with 10 multiple choice questions",
    "Generate a physics quiz about Newton's laws",
    "Make a history test on World War II",
    "Create an English grammar assessment",
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
            <h1 className="font-semibold text-foreground">Playground</h1>
            <div className="flex-1" />
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
            {/* Hero */}
            <div className="text-center space-y-4 py-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Exam Generation</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gradient">
                Create Exams with AI
              </h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Describe the exam you want to create and let AI generate it for you. It's fast, easy, and powerful.
              </p>
            </div>

            {/* Chat Input */}
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Input
                    placeholder="Describe the exam you want to create..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && prompt.trim()) {
                        navigate("/create-exam");
                      }
                    }}
                  />
                  <Button 
                    onClick={() => navigate("/create-exam")}
                    disabled={!prompt.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Example Prompts */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center">Try these examples:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="text-left p-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 transition-colors text-sm text-muted-foreground hover:text-foreground"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Multiple Question Types</CardTitle>
                  <CardDescription>MCQ, True/False, Short Answer, Essay</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-teal-500/10 to-teal-500/5 border-teal-500/20">
                <CardHeader>
                  <CardTitle className="text-base">Customizable Difficulty</CardTitle>
                  <CardDescription>Easy, Medium, Hard levels</CardDescription>
                </CardHeader>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
                <CardHeader>
                  <CardTitle className="text-base">Instant Generation</CardTitle>
                  <CardDescription>Create exams in seconds</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Playground;
