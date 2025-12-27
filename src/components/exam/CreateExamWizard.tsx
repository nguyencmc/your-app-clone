import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCourses, Course } from "@/hooks/useCourses";
import StepSidebar from "./wizard/StepSidebar";
import MobileStepIndicator from "./wizard/MobileStepIndicator";
import ExamDetailsStep from "./wizard/ExamDetailsStep";
import AddQuestionsStep from "./wizard/AddQuestionsStep";
import ReviewStep from "./wizard/ReviewStep";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Question {
  id: number;
  question: string;
  type: "multiple_choice" | "long_answer";
  options?: string[];
  correctAnswer: string;
  explanation: string;
  points: number;
}

export interface ExamFormData {
  examName: string;
  startDate: Date | undefined;
  startTime: string;
  endDate: Date | undefined;
  endTime: string;
  aiProtection: boolean;
  randomizeOrder: boolean;
  courseId: string | null;
}

export default function CreateExamWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { courses, isLoading: coursesLoading } = useCourses();
  const [currentStep, setCurrentStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ExamFormData>({
    examName: "",
    startDate: new Date(),
    startTime: new Date().toTimeString().slice(0, 5),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endTime: "23:59",
    aiProtection: false,
    randomizeOrder: false,
    courseId: null,
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    };
    checkAuth();
  }, [navigate]);

  const canProceedToStep2 = formData.examName.trim() !== "";
  const canProceedToStep3 = questions.length > 0;

  const handleNextStep = () => {
    if (currentStep === 1 && !canProceedToStep2) {
      toast({
        title: "Exam Name Required",
        description: "Please enter an exam name to continue.",
        variant: "destructive",
      });
      return;
    }
    if (currentStep === 2 && !canProceedToStep3) {
      toast({
        title: "Questions Required",
        description: "Please add at least one question to continue.",
        variant: "destructive",
      });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePublishExam = async () => {
    if (!userId) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to save exams.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      let startDateTime: string | null = null;
      let endDateTime: string | null = null;

      if (formData.startDate && formData.startTime) {
        const startDate = new Date(formData.startDate);
        const [hours, minutes] = formData.startTime.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes));
        startDateTime = startDate.toISOString();
      }

      if (formData.endDate && formData.endTime) {
        const endDate = new Date(formData.endDate);
        const [hours, minutes] = formData.endTime.split(':');
        endDate.setHours(parseInt(hours), parseInt(minutes));
        endDateTime = endDate.toISOString();
      }

      const selectedCourse = courses.find(c => c.id === formData.courseId);

      const { error } = await supabase
        .from("exams")
        .insert([{
          user_id: userId,
          title: formData.examName,
          subject: selectedCourse?.subject || "General",
          difficulty: "medium",
          question_type: "multiple choice",
          time_limit: 60,
          questions: JSON.parse(JSON.stringify(questions)),
          question_count: questions.length,
          course_id: formData.courseId,
          start_date: startDateTime,
          end_date: endDateTime,
          ai_protection: formData.aiProtection,
          randomize_order: formData.randomizeOrder,
        }]);

      if (error) throw error;

      toast({
        title: "Exam Published!",
        description: "Your exam has been published successfully.",
      });
      navigate("/dashboard/exams");
    } catch (error) {
      console.error("Error saving exam:", error);
      toast({
        title: "Publish Failed",
        description: "Failed to publish exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStepStatus = (step: number): "completed" | "current" | "upcoming" => {
    if (step < currentStep) return "completed";
    if (step === currentStep) return "current";
    return "upcoming";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Create Exam</h1>
          <div className="w-9" />
        </div>
        
        {/* Mobile Step Indicator */}
        <MobileStepIndicator
          currentStep={currentStep}
          getStepStatus={getStepStatus}
        />
      </header>

      {/* Desktop Sidebar - Hidden on Mobile */}
      <div className="hidden lg:block">
        <StepSidebar
          currentStep={currentStep}
          getStepStatus={getStepStatus}
          onStepClick={(step) => {
            if (step < currentStep || (step === 2 && canProceedToStep2) || (step === 3 && canProceedToStep3)) {
              setCurrentStep(step);
            }
          }}
          questions={questions}
          showQuestionsList={currentStep === 2}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto pb-24 lg:pb-8">
        <div className="lg:p-8">
          {currentStep === 1 && (
            <ExamDetailsStep
              formData={formData}
              setFormData={setFormData}
              courses={courses}
              coursesLoading={coursesLoading}
              onNext={handleNextStep}
            />
          )}

          {currentStep === 2 && (
            <AddQuestionsStep
              questions={questions}
              setQuestions={setQuestions}
              onNext={handleNextStep}
              onPrev={handlePrevStep}
            />
          )}

          {currentStep === 3 && (
            <ReviewStep
              formData={formData}
              questions={questions}
              courses={courses}
              onPrev={handlePrevStep}
              onPublish={handlePublishExam}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <footer className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border p-4 z-50">
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevStep}
              className="flex-1 h-12"
            >
              Back
            </Button>
          )}
          {currentStep < 3 ? (
            <Button
              onClick={handleNextStep}
              className="flex-1 h-12 bg-primary hover:bg-primary/90"
              disabled={currentStep === 1 && !formData.examName.trim()}
            >
              {currentStep === 1 ? "Add Questions" : "Review"}
            </Button>
          ) : (
            <Button
              onClick={handlePublishExam}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Exam"
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
