import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useExamAttempts } from "@/hooks/useExamAttempts";
import { examService } from "@/services";
import { exportExamResultsToPDF } from "@/lib/documentExport";
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight, Send, Trophy, RotateCcw, Save, Loader2, FileText } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  time_limit: number;
  questions: Question[];
}

type ExamState = "taking" | "submitted";

const TakeExam = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveAttempt } = useExamAttempts();

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examState, setExamState] = useState<ExamState>("taking");
  const [score, setScore] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [savingExplanations, setSavingExplanations] = useState<Record<string, boolean>>({});
  const [savedExplanations, setSavedExplanations] = useState<Record<string, boolean>>({});
  const startTimeRef = useRef<number>(Date.now());
  const timeSpentRef = useRef<number>(0);

  useEffect(() => {
    const fetchExam = async () => {
      if (!id) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error || !data) {
        toast({
          title: "Error",
          description: "Failed to load exam",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      const examData = {
        ...data,
        questions: (data.questions as unknown as Question[]) || [],
      };
      
      setExam(examData);
      setTimeRemaining(data.time_limit * 60);
      setLoading(false);
    };

    fetchExam();
  }, [id, navigate, toast]);

  const handleSubmit = useCallback(async () => {
    if (!exam || !id || isSaving) return;

    setIsSaving(true);
    
    let correctCount = 0;
    exam.questions.forEach((q) => {
      if (answers[q.id] === q.correct_answer) {
        correctCount++;
      }
    });

    // Calculate time spent in seconds
    const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
    timeSpentRef.current = timeSpent;

    // Prepare answers array for saving
    const answersArray = exam.questions.map((q) => ({
      question_id: q.id,
      selected_answer: answers[q.id] || "",
      correct_answer: q.correct_answer,
      is_correct: answers[q.id] === q.correct_answer,
    }));

    try {
      await saveAttempt(id, answersArray, correctCount, exam.questions.length, timeSpent);
      setScore(correctCount);
      setExamState("submitted");
    } catch (error) {
      console.error("Error saving exam attempt:", error);
      // Still show results even if saving fails
      setScore(correctCount);
      setExamState("submitted");
    } finally {
      setIsSaving(false);
    }
  }, [exam, id, answers, isSaving, saveAttempt]);

  useEffect(() => {
    if (examState !== "taking" || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, timeRemaining, handleSubmit]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const getAnsweredCount = () => Object.keys(answers).length;

  const isCorrect = (questionId: string) => {
    const question = exam?.questions.find((q) => q.id === questionId);
    return question && answers[questionId] === question.correct_answer;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Exam not found</p>
      </div>
    );
  }

  if (examState === "submitted") {
    const percentage = Math.round((score / exam.questions.length) * 100);

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Results Header */}
          <Card className="mb-8 border-primary/20 bg-card/50 backdrop-blur">
            <CardContent className="pt-6">
              <div className="text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-primary" />
                <h1 className="text-3xl font-bold mb-2">Exam Completed!</h1>
                <p className="text-muted-foreground mb-6">{exam.title}</p>
                
                <div className="flex justify-center items-center gap-8 mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">{score}</div>
                    <p className="text-muted-foreground">Correct</p>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold text-muted-foreground">{exam.questions.length - score}</div>
                    <p className="text-muted-foreground">Incorrect</p>
                  </div>
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${percentage >= 70 ? 'text-green-500' : percentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {percentage}%
                    </div>
                    <p className="text-muted-foreground">Score</p>
                  </div>
                </div>

                <div className="flex justify-center gap-4 flex-wrap">
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                  <Button onClick={() => {
                    setAnswers({});
                    setCurrentQuestion(0);
                    setTimeRemaining(exam.time_limit * 60);
                    setExamState("taking");
                    startTimeRef.current = Date.now();
                  }}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retake Exam
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      setIsExporting(true);
                      try {
                        await exportExamResultsToPDF({
                          examTitle: exam.title,
                          subject: exam.subject,
                          difficulty: exam.difficulty,
                          score,
                          totalQuestions: exam.questions.length,
                          timeSpent: timeSpentRef.current,
                          questions: exam.questions.map(q => ({
                            id: q.id,
                            question: q.question,
                            options: q.options,
                            correct_answer: q.correct_answer,
                            user_answer: answers[q.id] || '',
                            explanation: q.explanation,
                          })),
                        });
                        toast({
                          title: "Xuất PDF thành công",
                          description: "Cửa sổ in đã mở. Bạn có thể lưu thành PDF.",
                        });
                      } catch (error) {
                        console.error("Export error:", error);
                        toast({
                          title: "Lỗi xuất PDF",
                          description: error instanceof Error ? error.message : "Không thể xuất PDF.",
                          variant: "destructive",
                        });
                      } finally {
                        setIsExporting(false);
                      }
                    }}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <h2 className="text-2xl font-semibold mb-4">Review Your Answers</h2>
          <div className="space-y-4">
            {exam.questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const correct = userAnswer === question.correct_answer;

              return (
                <Card key={question.id} className={`border-l-4 ${correct ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <span className="text-muted-foreground">Q{index + 1}.</span>
                        {question.question}
                      </CardTitle>
                      {correct ? (
                        <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid gap-2">
                      {question.options.map((option, optIndex) => {
                        const isUserAnswer = userAnswer === option;
                        const isCorrectAnswer = question.correct_answer === option;
                        
                        let bgClass = "bg-secondary/30";
                        if (isCorrectAnswer) bgClass = "bg-green-500/20 border-green-500";
                        else if (isUserAnswer && !isCorrectAnswer) bgClass = "bg-red-500/20 border-red-500";

                        return (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg border ${bgClass} flex items-center justify-between`}
                          >
                            <span>{option}</span>
                            <div className="flex items-center gap-2">
                              {isUserAnswer && <Badge variant="outline">Your answer</Badge>}
                              {isCorrectAnswer && <Badge className="bg-green-500">Correct</Badge>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {question.explanation && (
                      <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-primary mb-1">Explanation:</p>
                            <p className="text-sm text-muted-foreground">{question.explanation}</p>
                          </div>
                          {!savedExplanations[question.id] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                if (!id) return;
                                setSavingExplanations(prev => ({ ...prev, [question.id]: true }));
                                try {
                                  await examService.saveAIExplanation(id, question.id, question.explanation);
                                  setSavedExplanations(prev => ({ ...prev, [question.id]: true }));
                                  toast({
                                    title: "Đã lưu",
                                    description: "Giải thích đã được lưu vào đề thi.",
                                  });
                                } catch (error) {
                                  console.error("Error saving explanation:", error);
                                  toast({
                                    title: "Lỗi",
                                    description: "Không thể lưu giải thích.",
                                    variant: "destructive",
                                  });
                                } finally {
                                  setSavingExplanations(prev => ({ ...prev, [question.id]: false }));
                                }
                              }}
                              disabled={savingExplanations[question.id]}
                              className="h-8 px-2 text-primary hover:text-primary"
                            >
                              {savingExplanations[question.id] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          {savedExplanations[question.id] && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Đã lưu
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const question = exam.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">{exam.title}</h1>
              <p className="text-sm text-muted-foreground">{exam.subject} • {exam.difficulty}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining < 60 ? 'bg-red-500/20 text-red-500' : 'bg-secondary'}`}>
                <Clock className="h-5 w-5" />
                <span className="font-mono text-lg font-semibold">{formatTime(timeRemaining)}</span>
              </div>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Exit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {exam.questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {getAnsweredCount()} answered
            </span>
          </div>
          <Progress value={((currentQuestion + 1) / exam.questions.length) * 100} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl leading-relaxed">{question.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all hover:bg-secondary/50 ${
                      answers[question.id] === option ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onClick={() => handleAnswerChange(question.id, option)}
                  >
                    <RadioGroupItem value={option} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2 flex-wrap justify-center max-w-md">
            {exam.questions.map((q, index) => (
              <Button
                key={q.id}
                variant={currentQuestion === index ? "default" : answers[q.id] ? "secondary" : "outline"}
                size="sm"
                className="w-10 h-10"
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>

          {currentQuestion === exam.questions.length - 1 ? (
            <Button onClick={handleSubmit} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Submit Exam"}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion((prev) => Math.min(exam.questions.length - 1, prev + 1))}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
