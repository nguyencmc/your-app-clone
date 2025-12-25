import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import {
  GraduationCap,
  Home,
  Play,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Crown,
  ChevronLeft,
  Menu,
  BookOpen,
  Shield,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: BookOpen, label: "Courses", path: "/dashboard/courses" },
  { icon: Play, label: "Playground", path: "/dashboard/playground" },
  { icon: FileText, label: "Documentation", path: "/dashboard/docs" },
  { icon: MessageSquare, label: "Forum", path: "/dashboard/forum" },
  { icon: BarChart3, label: "Usage", path: "/dashboard/usage" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const adminMenuItem = { icon: Shield, label: "Admin", path: "/dashboard/admin" };

interface DashboardSidebarProps {
  userName?: string;
}

const DashboardSidebar = ({ userName = "User" }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAdmin } = useUserRole();

  const allMenuItems = isAdmin 
    ? [...menuItems, adminMenuItem] 
    : menuItems;

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    } else {
      navigate("/");
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50 bg-secondary/30">
      <SidebarContent className="p-4">
        {/* Logo */}
        <div className={`flex items-center gap-2 mb-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <>
              <span className="font-bold text-foreground">ExamAi</span>
              <span className="text-xs text-muted-foreground">v4.4</span>
            </>
          )}
        </div>

        {/* Premium Badge */}
        {!collapsed && (
          <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-medium mb-6 w-fit">
            <Crown className="w-3 h-3" />
            Premium
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center mb-6">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {allMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && <span>{item.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sign Out */}
        <div className="mt-8">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className={`w-full justify-start gap-3 text-muted-foreground hover:text-foreground ${collapsed ? "px-0 justify-center" : "px-3"}`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>

        {/* User Profile */}
        <div className={`mt-auto pt-8 flex items-center gap-3 ${collapsed ? "justify-center" : "px-3"}`}>
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4 text-primary" />
          </div>
          {!collapsed && (
            <span className="text-sm text-foreground truncate">{userName}</span>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
