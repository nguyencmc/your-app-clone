import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionsProvider } from "@/contexts/PermissionsContext";
import { MiniPlayerProvider } from "@/contexts/MiniPlayerContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MiniPlayer } from "@/components/podcast/MiniPlayer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import CourseViewer from "./pages/CourseViewer";
import Exams from "./pages/Exams";
import Podcasts from "./pages/Podcasts";
import PodcastDetail from "./pages/PodcastDetail";
import Books from "./pages/Books";
import BookDetail from "./pages/BookDetail";
import BookReader from "./pages/BookReader";
import ExamCategoryDetail from "./pages/ExamCategoryDetail";
import ExamDetail from "./pages/ExamDetail";
import ExamTaking from "./pages/ExamTaking";
import ExamHistory from "./pages/ExamHistory";
import AttemptDetail from "./pages/AttemptDetail";
import UserProfile from "./pages/UserProfile";
import Leaderboard from "./pages/Leaderboard";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Admin & Teacher pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/admin/TeacherDashboard";
import ExamManagement from "./pages/admin/ExamManagement";
import ExamEditor from "./pages/admin/ExamEditor";
import FlashcardManagement from "./pages/admin/FlashcardManagement";
import FlashcardEditor from "./pages/admin/FlashcardEditor";
import PodcastManagement from "./pages/admin/PodcastManagement";
import PodcastEditor from "./pages/admin/PodcastEditor";
import CategoryManagement from "./pages/admin/CategoryManagement";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import CourseEditor from "./pages/admin/CourseEditor";
import QuestionSetManagement from "./pages/admin/QuestionSetManagement";
import QuestionSetEditor from "./pages/admin/QuestionSetEditor";
import PermissionManagement from "./pages/admin/PermissionManagement";
import AuditLogs from "./pages/admin/AuditLogs";
import StudentDashboard from "./pages/StudentDashboard";
import Achievements from "./pages/Achievements";
import StudyGroups from "./pages/StudyGroups";
import StudyGroupDetail from "./pages/StudyGroupDetail";
import VerifyCertificate from "./pages/VerifyCertificate";
import InstructorProfile from "./pages/InstructorProfile";
import MyCourses from "./pages/MyCourses";

// Practice feature pages
import QuestionBankPage from "./features/practice/pages/QuestionBankPage";
import PracticeSetup from "./features/practice/pages/PracticeSetup";
import PracticeRunner from "./features/practice/pages/PracticeRunner";
import ExamSetup from "./features/practice/pages/ExamSetup";
import ExamRunner from "./features/practice/pages/ExamRunner";
import ExamResult from "./features/practice/pages/ExamResult";
import ReviewWrongRunner from "./features/practice/pages/ReviewWrongRunner";

// Flashcards feature pages
import DeckListPage from "./features/flashcards/pages/DeckListPage";
import DeckDetailPage from "./features/flashcards/pages/DeckDetailPage";
import StudyDeckPage from "./features/flashcards/pages/StudyDeckPage";
import TodayPage from "./features/flashcards/pages/TodayPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <AuthProvider>
          <PermissionsProvider>
            <MiniPlayerProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/course/:id" element={<CourseDetail />} />
              <Route path="/course/:id/learn" element={<CourseViewer />} />
              {/* Old flashcards route removed - now using DeckListPage at /flashcards */}
              <Route path="/podcasts" element={<Podcasts />} />
              <Route path="/podcast/:slug" element={<PodcastDetail />} />
              <Route path="/exams" element={<Exams />} />
              <Route path="/exams/:slug" element={<ExamCategoryDetail />} />
              <Route path="/books" element={<Books />} />
              <Route path="/book/:slug" element={<BookDetail />} />
              <Route path="/book/:slug/read" element={<BookReader />} />
              <Route path="/exam/:slug" element={<ExamDetail />} />
              <Route path="/exam/:slug/take" element={<ExamTaking />} />
              <Route path="/history" element={<ExamHistory />} />
              <Route path="/history/:attemptId" element={<AttemptDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/my-courses" element={<MyCourses />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/study-groups" element={<StudyGroups />} />
              <Route path="/study-groups/:groupId" element={<StudyGroupDetail />} />
              <Route path="/@:username" element={<UserProfile />} />
              <Route path="/verify-certificate/:certificateNumber" element={<VerifyCertificate />} />
              <Route path="/instructor/:instructorId" element={<InstructorProfile />} />
              
              {/* Practice feature routes */}
              <Route path="/practice" element={<QuestionBankPage />} />
              <Route path="/practice/setup/:setId" element={<PracticeSetup />} />
              <Route path="/practice/run/:setId" element={<PracticeRunner />} />
              <Route path="/practice/exam-setup/:setId" element={<ExamSetup />} />
              <Route path="/practice/exam/:setId" element={<ExamRunner />} />
              <Route path="/practice/result/:sessionId" element={<ExamResult />} />
              <Route path="/practice/review" element={<ReviewWrongRunner />} />
              
              {/* Flashcards feature routes */}
              <Route path="/flashcards" element={<DeckListPage />} />
              <Route path="/flashcards/decks/:deckId" element={<DeckDetailPage />} />
              <Route path="/flashcards/study/:deckId" element={<StudyDeckPage />} />
              <Route path="/flashcards/today" element={<TodayPage />} />
              
              {/* Admin & Teacher routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/teacher" element={<TeacherDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/permissions" element={<PermissionManagement />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/exams" element={<ExamManagement />} />
              <Route path="/admin/exams/create" element={<ExamEditor />} />
              <Route path="/admin/exams/:id" element={<ExamEditor />} />
              <Route path="/admin/flashcards" element={<FlashcardManagement />} />
              <Route path="/admin/flashcards/create" element={<FlashcardEditor />} />
              <Route path="/admin/flashcards/:id" element={<FlashcardEditor />} />
              <Route path="/admin/podcasts" element={<PodcastManagement />} />
              <Route path="/admin/podcasts/create" element={<PodcastEditor />} />
              <Route path="/admin/podcasts/:id" element={<PodcastEditor />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/admin/courses/create" element={<CourseEditor />} />
              <Route path="/admin/courses/:id" element={<CourseEditor />} />
              <Route path="/admin/question-sets" element={<QuestionSetManagement />} />
              <Route path="/admin/question-sets/create" element={<QuestionSetEditor />} />
              <Route path="/admin/question-sets/:id" element={<QuestionSetEditor />} />
              
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MiniPlayer />
            </BrowserRouter>
            </MiniPlayerProvider>
          </PermissionsProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
