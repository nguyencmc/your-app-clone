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
  History,
  Crown,
  BookOpen,
  Shield,
  X,
  ChevronRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard", description: "Tổng quan" },
  { icon: BookOpen, label: "Courses", path: "/dashboard/courses", description: "Quản lý khóa học" },
  { icon: Play, label: "Playground", path: "/dashboard/playground", description: "Tạo đề thi" },
  { icon: History, label: "Exam History", path: "/dashboard/history", description: "Lịch sử làm bài" },
  { icon: FileText, label: "Documentation", path: "/dashboard/docs", description: "Tài liệu hướng dẫn" },
  { icon: MessageSquare, label: "Forum", path: "/dashboard/forum", description: "Cộng đồng" },
  { icon: BarChart3, label: "Usage", path: "/dashboard/usage", description: "Thống kê sử dụng" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", description: "Cài đặt tài khoản" },
];

const adminMenuItem = { icon: Shield, label: "Admin", path: "/dashboard/admin", description: "Quản trị hệ thống" };

interface DashboardSidebarProps {
  userName?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const DashboardSidebar = ({ userName = "User", mobileOpen = false, onMobileClose }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const isMobile = useIsMobile();

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

  const handleNavigate = (path: string) => {
    navigate(path);
    onMobileClose?.();
  };

  const userInitials = userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  // Mobile Drawer Menu
  if (isMobile) {
    return (
      <Drawer open={mobileOpen} onOpenChange={(open) => !open && onMobileClose?.()}>
        <DrawerContent className="h-[85vh] bg-background border-t border-border/50">
          <DrawerHeader className="px-4 pb-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <GraduationCap className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <DrawerTitle className="text-left text-lg font-bold">ExamAi</DrawerTitle>
                  <span className="text-xs text-muted-foreground">v4.4</span>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <X className="w-5 h-5" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-auto px-4 py-4">
            {/* User Profile Card */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-primary/30">
                  <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{userName}</p>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 rounded-full text-amber-400 text-xs font-medium mt-1">
                    <Crown className="w-3 h-3" />
                    Premium
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {allMenuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.label}
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "text-muted-foreground hover:bg-secondary/80 hover:text-foreground active:scale-[0.98]"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-primary/20" : "bg-secondary"
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`font-medium ${isActive ? "text-primary" : ""}`}>{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    {isActive && (
                      <div className="w-1.5 h-8 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </nav>

            <Separator className="my-6" />

            {/* Sign Out */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-4 p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200 active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">Sign Out</p>
                <p className="text-xs text-muted-foreground">Đăng xuất khỏi tài khoản</p>
              </div>
            </button>
          </div>

          {/* Bottom Safe Area */}
          <div className="h-8 bg-gradient-to-t from-background to-transparent" />
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop Sidebar
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
