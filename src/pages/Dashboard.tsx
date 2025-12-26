import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import StatsCards from "@/components/dashboard/StatsCards";
import CreateExamCard from "@/components/dashboard/CreateExamCard";
import CourseCard from "@/components/dashboard/CourseCard";
import FeatureCards from "@/components/dashboard/FeatureCards";
import RecentExams from "@/components/dashboard/RecentExams";
import { Menu } from "lucide-react";

const Dashboard = () => {
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
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="hidden sm:inline">Welcome back,</span>
              <span className="font-medium text-foreground">{userName}</span>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6">
            <div className="flex flex-col xl:flex-row gap-6">
              {/* Main Content */}
              <div className="flex-1 space-y-6">
                {/* Welcome */}
                <div className="mb-2">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                    Welcome back, {userName}
                  </h1>
                  <p className="text-muted-foreground">
                    What would you like to do today?
                  </p>
                </div>

                {/* Stats */}
                <StatsCards />

                {/* Hero Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <CreateExamCard />
                  <CourseCard />
                </div>

                {/* Feature Grid */}
                <FeatureCards />

                {/* Recent Exams */}
                <RecentExams />
              </div>

              {/* Right Sidebar - Today's Schedule */}
              <div className="w-full xl:w-80 shrink-0">
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-5 sticky top-20">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Today's Schedule</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <div className="w-1 h-full min-h-[40px] bg-primary rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Math Exam Review</p>
                        <p className="text-xs text-muted-foreground">9:00 AM - 10:30 AM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                      <div className="w-1 h-full min-h-[40px] bg-teal-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Physics Class</p>
                        <p className="text-xs text-muted-foreground">11:00 AM - 12:30 PM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <div className="w-1 h-full min-h-[40px] bg-amber-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Grade Submissions</p>
                        <p className="text-xs text-muted-foreground">2:00 PM - 3:00 PM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                      <div className="w-1 h-full min-h-[40px] bg-rose-500 rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Student Meetings</p>
                        <p className="text-xs text-muted-foreground">4:00 PM - 5:30 PM</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <p className="text-xs text-muted-foreground text-center">
                      4 events scheduled for today
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
