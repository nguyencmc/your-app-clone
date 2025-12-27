import { format } from "date-fns";
import { ArrowLeft, Calendar, CheckCircle, Clock, Eye, GraduationCap, List, Loader2, Send, Users, Shield, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExamFormData, Question } from "../CreateExamWizard";
import { Course } from "@/hooks/useCourses";

interface ReviewStepProps {
  formData: ExamFormData;
  questions: Question[];
  courses: Course[];
  onPrev: () => void;
  onPublish: () => Promise<void>;
  isSaving: boolean;
}

export default function ReviewStep({
  formData,
  questions,
  courses,
  onPrev,
  onPublish,
  isSaving,
}: ReviewStepProps) {
  const selectedCourse = courses.find((c) => c.id === formData.courseId);
  
  const multipleChoiceCount = questions.filter((q) => q.type === "multiple_choice").length;
  const longAnswerCount = questions.filter((q) => q.type === "long_answer").length;
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  const getStartDateTime = () => {
    if (!formData.startDate || !formData.startTime) return "Not set";
    const date = new Date(formData.startDate);
    const [hours, minutes] = formData.startTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "MMM do, yyyy, h:mm a");
  };

  const getEndDateTime = () => {
    if (!formData.endDate || !formData.endTime) return "Not set";
    const date = new Date(formData.endDate);
    const [hours, minutes] = formData.endTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "MMM do, yyyy, h:mm a");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3 lg:gap-4">
          <Button variant="ghost" size="icon" onClick={onPrev} className="hidden lg:flex">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">Exam Review</h1>
            <p className="text-muted-foreground text-sm">Review and publish your exam</p>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button onClick={onPublish} disabled={isSaving} className="gap-2 bg-green-500 hover:bg-green-600">
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Publish Exam
          </Button>
        </div>
      </div>

      {/* Exam Title Card */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg lg:text-xl font-semibold">{formData.examName || "Untitled Exam"}</h2>
          <Badge variant="outline" className="gap-2 text-green-400 border-green-400/50 w-fit">
            <CheckCircle className="w-4 h-4" />
            Ready to Publish
          </Badge>
        </div>

        {/* Settings Tags */}
        {(formData.aiProtection || formData.randomizeOrder) && (
          <div className="flex flex-wrap gap-2 mt-4">
            {formData.aiProtection && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full">
                <Shield className="h-3 w-3" />
                AI Protection
              </span>
            )}
            {formData.randomizeOrder && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-accent/10 text-accent px-3 py-1.5 rounded-full">
                <Shuffle className="h-3 w-3" />
                Randomized
              </span>
            )}
          </div>
        )}
      </div>

      {/* Schedule and Course Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Exam Schedule */}
        <div className="rounded-xl border border-border/40 bg-card/50 p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Exam Schedule</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-muted-foreground">Start Time</p>
                <p className="font-medium text-sm lg:text-base truncate">{getStartDateTime()}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-muted-foreground">End Time</p>
                <p className="font-medium text-sm lg:text-base truncate">{getEndDateTime()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="rounded-xl border border-border/40 bg-card/50 p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Course Details</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-muted-foreground">Course Name</p>
                <p className="font-medium text-sm lg:text-base truncate">{selectedCourse?.title || "No course selected"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs lg:text-sm text-muted-foreground">Students</p>
                <p className="font-medium text-sm lg:text-base">0 Enrolled</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Overview */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <List className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Questions Overview</h3>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 lg:gap-6 mb-4 lg:mb-6">
          <div className="text-center lg:text-left">
            <p className="text-xs lg:text-sm text-muted-foreground mb-1">Total</p>
            <p className="text-2xl lg:text-3xl font-bold">{questions.length}</p>
          </div>
          <div className="text-center lg:text-left">
            <p className="text-xs lg:text-sm text-muted-foreground mb-1">Multiple Choice</p>
            <p className="text-2xl lg:text-3xl font-bold">{multipleChoiceCount}</p>
          </div>
          <div className="text-center lg:text-left">
            <p className="text-xs lg:text-sm text-muted-foreground mb-1">Long Answer</p>
            <p className="text-2xl lg:text-3xl font-bold">{longAnswerCount}</p>
          </div>
        </div>

        {/* Total Points */}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <span className="text-sm text-muted-foreground">Total Points</span>
          <span className="font-semibold">{totalPoints} pts</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }} />
        </div>

        {/* Question List */}
        <div className="mt-4 lg:mt-6 space-y-2 lg:space-y-3 max-h-[300px] overflow-y-auto">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="flex items-start gap-3 p-3 lg:p-4 rounded-lg bg-muted/30 border border-border/40"
            >
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs lg:text-sm font-medium flex-shrink-0">
                Q{index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm lg:text-base line-clamp-1">{question.question}</p>
                <div className="flex items-center gap-2 mt-1.5 lg:mt-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      question.type === "multiple_choice"
                        ? "text-primary border-primary/50"
                        : "text-orange-400 border-orange-400/50 bg-orange-500/10"
                    }`}
                  >
                    {question.type === "multiple_choice" ? "Multiple Choice" : "Long Answer"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{question.points} pts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ready to Publish Banner - Mobile */}
      <div className="lg:hidden bg-gradient-to-br from-green-500/20 to-emerald-500/10 rounded-xl p-4 border border-green-500/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="font-semibold text-sm text-green-400">Ready to Publish</p>
            <p className="text-xs text-muted-foreground">
              Review the details above and tap Publish to create your exam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
