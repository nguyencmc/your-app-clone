import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Sparkles, Loader2, Check, X, BookOpen, Brain, Target, Clock, Upload } from "lucide-react";
import FileUploadQuestions from "@/components/exam/FileUploadQuestions";

interface Question {
  id: number;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "History",
  "Geography",
  "English Literature",
  "Economics",
  "Psychology",
  "Political Science",
  "Philosophy",
  "Art History",
  "Music Theory",
];

const difficulties = [
  { value: "easy", label: "Easy", description: "Basic concepts and fundamentals" },
  { value: "medium", label: "Medium", description: "Intermediate understanding required" },
  { value: "hard", label: "Hard", description: "Advanced concepts and critical thinking" },
];

const questionTypes = [
  { value: "multiple choice", label: "Multiple Choice", icon: Target },
  { value: "true/false", label: "True/False", icon: Check },
  { value: "short answer", label: "Short Answer", icon: BookOpen },
];

export default function CreateExam() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<"ai" | "upload">("ai");
  
  const [formData, setFormData] = useState({
    examTitle: "",
    subject: "",
    difficulty: "medium",
    questionType: "multiple choice",
    questionCount: "5",
    topic: "",
    timeLimit: "30",
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

  const handleGenerateQuestions = async () => {
    if (!formData.subject) {
      toast({
        title: "Subject Required",
        description: "Please select a subject to generate questions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setQuestions([]);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-exam-questions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            subject: formData.subject,
            difficulty: formData.difficulty,
            questionCount: parseInt(formData.questionCount),
            questionType: formData.questionType,
            topic: formData.topic,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate questions");
      }

      const data = await response.json();
      setQuestions(data.questions || []);
      setShowPreview(true);
      
      toast({
        title: "Questions Generated!",
        description: `Successfully generated ${data.questions?.length || 0} questions.`,
      });
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileQuestionsLoaded = (loadedQuestions: Question[]) => {
    setQuestions(loadedQuestions);
    setShowPreview(true);
  };

  const handleSaveExam = async () => {
    if (!userId) {
      toast({
        title: "Not Authenticated",
        description: "Please log in to save exams.",
        variant: "destructive",
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please generate questions before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    
    try {
      const examTitle = formData.examTitle || `${formData.subject} Exam`;
      
      const { error } = await supabase
        .from("exams")
        .insert([{
          user_id: userId,
          title: examTitle,
          subject: formData.subject,
          difficulty: formData.difficulty,
          question_type: formData.questionType,
          time_limit: parseInt(formData.timeLimit),
          questions: JSON.parse(JSON.stringify(questions)),
          question_count: questions.length,
        }]);

      if (error) throw error;

      toast({
        title: "Exam Saved!",
        description: "Your exam has been saved successfully.",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error saving exam:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Create New Exam</h1>
            <p className="text-sm text-muted-foreground">Generate AI-powered exam questions</p>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Exam Configuration
                </CardTitle>
                <CardDescription>
                  Configure your exam and generate questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Exam Title */}
                <div className="space-y-2">
                  <Label htmlFor="examTitle">Exam Title</Label>
                  <Input
                    id="examTitle"
                    placeholder="e.g., Midterm Exam - Chapter 5"
                    value={formData.examTitle}
                    onChange={(e) => setFormData({ ...formData, examTitle: e.target.value })}
                  />
                </div>

                {/* Subject Selection */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select
                    value={formData.subject}
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Question Type */}
                <div className="space-y-3">
                  <Label>Question Type</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {questionTypes.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, questionType: type.value })}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          formData.questionType === type.value
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <type.icon className={`h-5 w-5 mx-auto mb-1 ${
                          formData.questionType === type.value ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <div className="font-medium text-sm">{type.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Limit */}
                <div className="space-y-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Select
                    value={formData.timeLimit}
                    onValueChange={(value) => setFormData({ ...formData, timeLimit: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[15, 30, 45, 60, 90, 120].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} minutes
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Create Mode Tabs */}
                <Tabs value={createMode} onValueChange={(v) => setCreateMode(v as "ai" | "upload")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="ai" className="gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Generate
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload File
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="ai" className="space-y-4 mt-4">
                    {/* Topic/Focus Area */}
                    <div className="space-y-2">
                      <Label htmlFor="topic">Specific Topic (Optional)</Label>
                      <Textarea
                        id="topic"
                        placeholder="e.g., Quadratic equations, Newton's laws, World War II..."
                        value={formData.topic}
                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* Difficulty Selection */}
                    <div className="space-y-3">
                      <Label>Difficulty Level</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {difficulties.map((diff) => (
                          <button
                            key={diff.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, difficulty: diff.value })}
                            className={`p-3 rounded-lg border-2 text-left transition-all ${
                              formData.difficulty === diff.value
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <div className="font-medium text-sm">{diff.label}</div>
                            <div className="text-xs text-muted-foreground mt-1">{diff.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Question Count */}
                    <div className="space-y-2">
                      <Label htmlFor="questionCount">Number of Questions</Label>
                      <Select
                        value={formData.questionCount}
                        onValueChange={(value) => setFormData({ ...formData, questionCount: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 15, 20, 25, 30].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} questions
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Generate Button */}
                    <Button
                      onClick={handleGenerateQuestions}
                      disabled={isLoading || !formData.subject}
                      className="w-full h-12 text-lg gap-2"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Generating Questions...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="upload" className="mt-4">
                    <FileUploadQuestions
                      onQuestionsLoaded={handleFileQuestionsLoaded}
                      questionType={formData.questionType}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <Card className={`min-h-[600px] ${!showPreview ? "flex items-center justify-center" : ""}`}>
              {!showPreview ? (
                <div className="text-center p-8">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ready to Create</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Generate questions with AI or upload a file with your own questions
                  </p>
                </div>
              ) : (
                <>
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <CardTitle>Generated Questions</CardTitle>
                      <CardDescription>
                        {questions.length} questions • {formData.difficulty} difficulty
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {formData.timeLimit} min
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="p-4 rounded-lg border border-border bg-muted/30"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                            {index + 1}
                          </span>
                          <div className="flex-1 space-y-3">
                            <p className="font-medium">{question.question}</p>
                            
                            {question.options && (
                              <div className="space-y-2">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className={`p-2 rounded-md text-sm ${
                                      option.startsWith(question.correctAnswer)
                                        ? "bg-green-500/20 text-green-700 dark:text-green-300 border border-green-500/30"
                                        : "bg-muted"
                                    }`}
                                  >
                                    {option}
                                    {option.startsWith(question.correctAnswer) && (
                                      <Check className="inline h-4 w-4 ml-2" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {question.type === "true/false" && (
                              <div className="flex gap-2">
                                <span className={`px-3 py-1 rounded-md text-sm ${
                                  question.correctAnswer.toLowerCase() === "true"
                                    ? "bg-green-500/20 text-green-700 dark:text-green-300"
                                    : "bg-muted"
                                }`}>
                                  True {question.correctAnswer.toLowerCase() === "true" && <Check className="inline h-3 w-3" />}
                                </span>
                                <span className={`px-3 py-1 rounded-md text-sm ${
                                  question.correctAnswer.toLowerCase() === "false"
                                    ? "bg-green-500/20 text-green-700 dark:text-green-300"
                                    : "bg-muted"
                                }`}>
                                  False {question.correctAnswer.toLowerCase() === "false" && <Check className="inline h-3 w-3" />}
                                </span>
                              </div>
                            )}
                            
                            {question.type === "short answer" && (
                              <div className="p-2 rounded-md bg-green-500/20 text-green-700 dark:text-green-300 text-sm">
                                <span className="font-medium">Answer:</span> {question.correctAnswer}
                              </div>
                            )}
                            
                            {question.explanation && (
                              <p className="text-sm text-muted-foreground italic">
                                💡 {question.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </>
              )}
            </Card>

            {showPreview && questions.length > 0 && (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleGenerateQuestions}
                  disabled={isLoading}
                >
                  Regenerate
                </Button>
                <Button className="flex-1" onClick={handleSaveExam} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Exam"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
