import { format } from "date-fns";
import { ArrowLeft, Calendar, CheckCircle, Clock, Eye, GraduationCap, List, Loader2, Send, Users } from "lucide-react";
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
    return format(date, "MMMM do, yyyy, h:mm a");
  };

  const getEndDateTime = () => {
    if (!formData.endDate || !formData.endTime) return "Not set";
    const date = new Date(formData.endDate);
    const [hours, minutes] = formData.endTime.split(':');
    date.setHours(parseInt(hours), parseInt(minutes));
    return format(date, "MMMM do, yyyy, h:mm a");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onPrev}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Exam Review</h1>
            <p className="text-muted-foreground">Review and publish your exam</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
      <div className="rounded-xl border border-border/40 bg-card/50 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{formData.examName || "Untitled Exam"}</h2>
          <Badge variant="outline" className="gap-2 text-green-400 border-green-400/50">
            <CheckCircle className="w-4 h-4" />
            Ready to Publish
          </Badge>
        </div>
      </div>

      {/* Schedule and Course Details */}
      <div className="grid grid-cols-2 gap-6">
        {/* Exam Schedule */}
        <div className="rounded-xl border border-border/40 bg-card/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Exam Schedule</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Time</p>
                <p className="font-medium">{getStartDateTime()}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Time</p>
                <p className="font-medium">{getEndDateTime()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Details */}
        <div className="rounded-xl border border-border/40 bg-card/50 p-6">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Course Details</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Course Name</p>
                <p className="font-medium">{selectedCourse?.title || "No course selected"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="font-medium">0 Enrolled</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Questions Overview */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-6">
        <div className="flex items-center gap-3 mb-6">
          <List className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-semibold">Questions Overview</h3>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
            <p className="text-3xl font-bold">{questions.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Multiple Choice</p>
            <p className="text-3xl font-bold">{multipleChoiceCount}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Long Answer</p>
            <p className="text-3xl font-bold">{longAnswerCount}</p>
          </div>
        </div>

        {/* Total Points */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-muted-foreground">Total Points</span>
          <span className="font-semibold">{totalPoints} pts</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full" style={{ width: "100%" }} />
        </div>

        {/* Question List */}
        <div className="mt-6 space-y-3">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/40"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                Q{index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium line-clamp-1">{question.question}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge
                    variant="outline"
                    className={
                      question.type === "multiple_choice"
                        ? "text-primary border-primary/50"
                        : "text-orange-400 border-orange-400/50 bg-orange-500/10"
                    }
                  >
                    {question.type === "multiple_choice" ? "Multiple Choice" : "Long Answer"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">{question.points} pts</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
