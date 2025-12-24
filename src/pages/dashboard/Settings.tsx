import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu, User as UserIcon, Bell, Shield, Palette, Globe, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
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

  const settingSections = [
    { icon: UserIcon, label: "Profile", active: true },
    { icon: Bell, label: "Notifications" },
    { icon: Shield, label: "Security" },
    { icon: Palette, label: "Appearance" },
    { icon: Globe, label: "Language" },
    { icon: CreditCard, label: "Billing" },
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
            <h1 className="font-semibold text-foreground">Settings</h1>
            <div className="flex-1" />
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6 space-y-6">
            {/* Hero */}
            <div className="mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-gradient mb-2">
                Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account preferences and settings
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Settings Nav */}
              <Card className="glass-card lg:col-span-1 h-fit">
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    {settingSections.map((section, index) => (
                      <button
                        key={index}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                          section.active 
                            ? "bg-primary/10 text-primary" 
                            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                        }`}
                      >
                        <section.icon className="w-4 h-4" />
                        {section.label}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>

              {/* Settings Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Profile Settings */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-primary" />
                      </div>
                      <Button variant="outline" size="sm">Change Avatar</Button>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" defaultValue={userName} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                      </div>
                    </div>
                    <Button>Save Changes</Button>
                  </CardContent>
                </Card>

                {/* Notification Settings */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>Manage your notification preferences</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive exam updates via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Student Submissions</p>
                        <p className="text-sm text-muted-foreground">Get notified when students submit exams</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Marketing Emails</p>
                        <p className="text-sm text-muted-foreground">Receive tips and product updates</p>
                      </div>
                      <Switch />
                    </div>
                  </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                  <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible account actions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="destructive">Delete Account</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
