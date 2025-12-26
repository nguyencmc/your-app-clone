import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/playground" element={<Playground />} />
          <Route path="/dashboard/docs" element={<Documentation />} />
          <Route path="/dashboard/forum" element={<Forum />} />
          <Route path="/dashboard/usage" element={<Usage />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          <Route path="/dashboard/courses" element={<Courses />} />
          <Route path="/dashboard/courses/:courseId/students" element={<CourseStudents />} />
          <Route path="/dashboard/admin" element={<Admin />} />
          <Route path="/dashboard/exams" element={<ExamManagement />} />
          <Route path="/create-exam" element={<CreateExam />} />
          <Route path="/exam/:id" element={<ExamDetail />} />
          <Route path="/exam/:id/take" element={<TakeExam />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
