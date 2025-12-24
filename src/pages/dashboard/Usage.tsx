import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu, Zap, FileText, Users, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const Usage = () => {
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

  const usageStats = [
    { label: "Exams Created", value: 12, limit: 50, icon: FileText, color: "text-primary" },
    { label: "AI Generations", value: 45, limit: 100, icon: Zap, color: "text-amber-500" },
    { label: "Students", value: 156, limit: 500, icon: Users, color: "text-teal-500" },
  ];

  const history = [
    { action: "Created exam", details: "Calculus Mid-term", time: "2 hours ago" },
    { action: "AI Generation", details: "Physics Quiz", time: "5 hours ago" },
    { action: "Graded exam", details: "Chemistry Final", time: "1 day ago" },
    { action: "Created exam", details: "History Assessment", time: "2 days ago" },
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
            <h1 className="font-semibold text-foreground">Usage</h1>
            <div className="flex-1" />
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Hero */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                Usage & Limits
              </h1>
              <p className="text-muted-foreground">
                Monitor your account usage and subscription limits
              </p>
            </div>

            {/* Plan Info */}
            <Card className="bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-amber-500/20">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Premium Plan</h3>
                    <p className="text-sm text-muted-foreground">Renews on Jan 15, 2025</p>
                  </div>
                </div>
                <Button variant="outline">Upgrade Plan</Button>
              </CardContent>
            </Card>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {usageStats.map((stat, index) => (
                <Card key={index} className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-foreground">{stat.value}</span>
                        <span className="text-sm text-muted-foreground">/ {stat.limit}</span>
                      </div>
                      <Progress value={(stat.value / stat.limit) * 100} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {Math.round((stat.value / stat.limit) * 100)}% used
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Usage History */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your recent account activity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-card/50"
                  >
                    <div>
                      <p className="font-medium text-foreground text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.details}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {item.time}
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

export default Usage;
