import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import CreateExamCard from "@/components/dashboard/CreateExamCard";
import CourseCard from "@/components/dashboard/CourseCard";
import FeatureCards from "@/components/dashboard/FeatureCards";
import NotesSection from "@/components/dashboard/NotesSection";
import { Menu, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { signOut } = useAuth();

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

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar 
          userName={userName} 
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 lg:px-6 h-14 flex items-center gap-4">
            {isMobile ? (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileMenuOpen(true)}
                className="rounded-full"
              >
                <Menu className="w-5 h-5" />
              </Button>
            ) : (
              <SidebarTrigger className="lg:hidden">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
            )}
            <div className="flex-1" />
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">Welcome back,</span>
                <span className="font-medium text-foreground">{user?.email}</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={async () => {
                  await signOut();
                  navigate("/login");
                }}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Welcome */}
            <div className="mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                Welcome back, {userName}
              </h1>
              <p className="text-muted-foreground">
                What would you like to do today?
              </p>
            </div>

            {/* Hero Cards - Create Exam + Manage Courses */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <CreateExamCard />
              </div>
              <CourseCard />
            </div>

            {/* Notes Section */}
            <NotesSection />

            {/* Feature Grid */}
            <FeatureCards />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
