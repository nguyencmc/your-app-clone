import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { Menu, User as UserIcon, Bell, Shield, Palette, Globe, CreditCard, Loader2, Camera } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("profile");
  const [fullName, setFullName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { profile, isLoading: profileLoading, updateProfile, uploadAvatar } = useProfile();
  const [isUploading, setIsUploading] = useState(false);

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

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ full_name: fullName });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleNotification = async (key: "email_notifications" | "student_submission_notifications" | "marketing_emails") => {
    if (!profile) return;
    await updateProfile({ [key]: !profile[key] });
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    
    try {
      const { error } = await supabase.auth.admin.deleteUser(user?.id || "");
      if (error) throw error;
      
      await supabase.auth.signOut();
      navigate("/");
      toast({
        title: "Account Deleted",
        description: "Your account has been deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please contact support.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  const settingSections = [
    { id: "profile", icon: UserIcon, label: "Profile" },
    { id: "notifications", icon: Bell, label: "Notifications" },
    { id: "security", icon: Shield, label: "Security" },
    { id: "appearance", icon: Palette, label: "Appearance" },
    { id: "language", icon: Globe, label: "Language" },
    { id: "billing", icon: CreditCard, label: "Billing" },
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
                    {settingSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === section.id 
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
                    {profileLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="relative group">
                            {profile?.avatar_url ? (
                              <img 
                                src={profile.avatar_url} 
                                alt="Avatar" 
                                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                <UserIcon className="w-8 h-8 text-primary" />
                              </div>
                            )}
                            <label 
                              htmlFor="avatar-upload" 
                              className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            >
                              {isUploading ? (
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              ) : (
                                <Camera className="w-5 h-5 text-primary" />
                              )}
                            </label>
                            <input
                              id="avatar-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isUploading}
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setIsUploading(true);
                                try {
                                  await uploadAvatar(file);
                                } finally {
                                  setIsUploading(false);
                                }
                              }}
                            />
                          </div>
                          <div>
                            <label htmlFor="avatar-upload">
                              <Button variant="outline" size="sm" asChild disabled={isUploading}>
                                <span className="cursor-pointer">
                                  {isUploading ? "Uploading..." : "Change Avatar"}
                                </span>
                              </Button>
                            </label>
                            <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB</p>
                          </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" defaultValue={user?.email || ""} disabled />
                          </div>
                        </div>
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </Button>
                      </>
                    )}
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
                      <Switch
                        checked={profile?.email_notifications ?? true}
                        onCheckedChange={() => handleToggleNotification("email_notifications")}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Student Submissions</p>
                        <p className="text-sm text-muted-foreground">Get notified when students submit exams</p>
                      </div>
                      <Switch
                        checked={profile?.student_submission_notifications ?? true}
                        onCheckedChange={() => handleToggleNotification("student_submission_notifications")}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">Marketing Emails</p>
                        <p className="text-sm text-muted-foreground">Receive tips and product updates</p>
                      </div>
                      <Switch
                        checked={profile?.marketing_emails ?? false}
                        onCheckedChange={() => handleToggleNotification("marketing_emails")}
                      />
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
                    <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
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
