import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User, Loader2, Sparkles, BookOpen, BarChart3, GraduationCap, Brain, FileText, CheckCircle } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          navigate("/dashboard");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      if (isLogin) {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: "Invalid email or password. Please try again.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Login failed",
              description: error.message,
            });
          }
        }
      } else {
        const result = signupSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) {
              fieldErrors[err.path[0] as string] = err.message;
            }
          });
          setErrors(fieldErrors);
          return;
        }

        setLoading(true);
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              full_name: formData.fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              variant: "destructive",
              title: "Sign up failed",
              description: "This email is already registered. Please login instead.",
            });
          } else {
            toast({
              variant: "destructive",
              title: "Sign up failed",
              description: error.message,
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to ExamAI. You're now logged in.",
          });
        }
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message,
      });
    }
  };

  const features = [
    { icon: Sparkles, label: "AI-Powered Grading" },
    { icon: BookOpen, label: "Smart Assessments" },
    { icon: BarChart3, label: "Learning Analytics" },
  ];

  const floatingIcons = [
    { icon: GraduationCap, position: "top-20 left-8", delay: "0s" },
    { icon: Brain, position: "top-32 right-12", delay: "0.5s" },
    { icon: FileText, position: "bottom-40 left-16", delay: "1s" },
    { icon: CheckCircle, position: "bottom-32 right-8", delay: "1.5s" },
    { icon: BookOpen, position: "top-1/2 left-4", delay: "0.75s" },
    { icon: BarChart3, position: "top-1/2 right-4", delay: "1.25s" },
  ];

  return (
    <div className="min-h-screen bg-background flex relative overflow-hidden">
      {/* Aurora Background - Full Screen */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px] animate-aurora-1" />
        <div className="absolute -bottom-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-accent/15 blur-[100px] animate-aurora-2" />
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[80px] animate-aurora-3" />
      </div>

      {/* Left Section - Hero/Features */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center p-12">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        {/* Floating Icons */}
        {floatingIcons.map((item, index) => (
          <div 
            key={index}
            className={`absolute ${item.position} opacity-30 animate-float`}
            style={{ animationDelay: item.delay }}
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <item.icon className="w-6 h-6 text-primary" />
            </div>
          </div>
        ))}

        {/* Center Content */}
        <div className="relative z-10 text-center max-w-md">
          {/* Logo */}
          <div className="inline-flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <span className="text-4xl font-bold text-gradient">ExamAi</span>
          </div>
          
          <h1 className="text-2xl font-medium text-foreground/80 mb-12 leading-relaxed">
            Transform assessment with intelligent AI-powered tools built for the future of learning
          </h1>

          {/* Circular Feature Display */}
          <div className="relative w-64 h-64 mx-auto">
            {/* Center Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            
            {/* Orbit Ring */}
            <div className="absolute inset-0 rounded-full border border-primary/20" />
            <div className="absolute inset-4 rounded-full border border-primary/10" />
            
            {/* Orbiting Icons */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute top-1/4 -right-2 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse" style={{ animationDelay: "0.5s" }}>
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute bottom-1/4 -right-2 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse" style={{ animationDelay: "1s" }}>
              <CheckCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse" style={{ animationDelay: "1.5s" }}>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute bottom-1/4 -left-2 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse" style={{ animationDelay: "2s" }}>
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="absolute top-1/4 -left-2 w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center animate-pulse" style={{ animationDelay: "2.5s" }}>
              <Brain className="w-5 h-5 text-primary" />
            </div>
          </div>

          {/* Features */}
          <div className="flex justify-center gap-8 mt-12">
            {features.map((feature, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <feature.icon className="w-6 h-6 text-primary" />
                <span className="text-sm text-muted-foreground">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Section - Auth Form */}
      <div className="flex-1 lg:max-w-xl flex items-center justify-center p-6 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">ExamAi</span>
          </div>

          {/* Auth Card */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {isLogin ? "Welcome Back" : "Create an account"}
              </h1>
              <p className="text-muted-foreground">
                {isLogin
                  ? "Sign in to unleash the power of AI in education"
                  : "Sign up to start creating AI-powered exams"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 ${
                        errors.fullName ? "border-destructive" : ""
                      }`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`pl-10 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 ${
                      errors.email ? "border-destructive" : ""
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`pl-10 pr-10 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 ${
                      errors.password ? "border-destructive" : ""
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 h-12 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 ${
                        errors.confirmPassword ? "border-destructive" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {isLogin && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot your password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </>
                ) : (
                  <>{isLogin ? "Sign in" : "Create account"}</>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
            </div>

            {/* Google Login */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 bg-secondary/30 border-border/50 hover:bg-secondary hover:border-primary/50 transition-all"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </Button>

            {/* Toggle */}
            <p className="text-center text-muted-foreground mt-6">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setFormData({
                    fullName: "",
                    email: "",
                    password: "",
                    confirmPassword: "",
                  });
                }}
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          {/* Terms */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
