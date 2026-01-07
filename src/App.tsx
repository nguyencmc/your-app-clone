import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import CreateExam from "./pages/CreateExam";
import ExamDetail from "./pages/ExamDetail";
import TakeExam from "./pages/TakeExam";
import Pricing from "./pages/Pricing";
import Playground from "./pages/dashboard/Playground";
import Documentation from "./pages/dashboard/Documentation";
import Forum from "./pages/dashboard/Forum";
import Usage from "./pages/dashboard/Usage";
import Settings from "./pages/dashboard/Settings";
import Courses from "./pages/dashboard/Courses";
import CourseStudents from "./pages/dashboard/CourseStudents";
import Admin from "./pages/dashboard/Admin";
import ExamManagement from "./pages/dashboard/ExamManagement";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Public Route wrapper (redirects to dashboard if logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Root redirect component
function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show landing page for non-authenticated users
  return <Index />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route
      path="/login"
      element={
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      }
    />
    <Route
      path="/register"
      element={
        <PublicRoute>
          <RegisterPage />
        </PublicRoute>
      }
    />
    <Route path="/auth" element={<Auth />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/playground"
      element={
        <ProtectedRoute>
          <Playground />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/docs"
      element={
        <ProtectedRoute>
          <Documentation />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/forum"
      element={
        <ProtectedRoute>
          <Forum />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/usage"
      element={
        <ProtectedRoute>
          <Usage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/settings"
      element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/courses"
      element={
        <ProtectedRoute>
          <Courses />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/courses/:courseId/students"
      element={
        <ProtectedRoute>
          <CourseStudents />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/admin"
      element={
        <ProtectedRoute>
          <Admin />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard/exams"
      element={
        <ProtectedRoute>
          <ExamManagement />
        </ProtectedRoute>
      }
    />
    <Route
      path="/create-exam"
      element={
        <ProtectedRoute>
          <CreateExam />
        </ProtectedRoute>
      }
    />
    <Route path="/exam/:id" element={<ExamDetail />} />
    <Route path="/exam/:id/take" element={<TakeExam />} />
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
