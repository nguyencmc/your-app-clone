import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Check, 
  Trash2, 
  Plus, 
  Clock,
  Pencil,
  Eye,
  GripVertical,
  Play,
  Sparkles
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

interface Question {
  id: number;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface AIExplanation {
  id: string;
  question_id: string;
  explanation: string;
  created_at: string;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  difficulty: string;
  question_type: string;
  time_limit: number;
  questions: Question[];
  question_count: number;
  created_at: string;
  updated_at: string;
  ai_explanations?: Record<string, AIExplanation>;
}

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedExam, setEditedExam] = useState<Exam | null>(null);
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchExam();
    };
    checkAuthAndFetch();
  }, [id, navigate]);

  const fetchExam = async () => {
    if (!id) return;
    
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast({
          title: "Exam Not Found",
          description: "The exam you're looking for doesn't exist.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      const examData: Exam = {
        ...data,
        questions: Array.isArray(data.questions) ? (data.questions as unknown as Question[]) : [],
        ai_explanations: data.ai_explanations as unknown as Record<string, AIExplanation> | undefined
      };
      
      setExam(examData);
      setEditedExam(examData);
    } catch (error) {
      console.error("Error fetching exam:", error);
      toast({
        title: "Error",
        description: "Failed to load exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editedExam) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("exams")
        .update({
          title: editedExam.title,
          questions: JSON.parse(JSON.stringify(editedExam.questions)),
          question_count: editedExam.questions.length,
          time_limit: editedExam.time_limit,
        })
        .eq("id", editedExam.id);

      if (error) throw error;

      setExam(editedExam);
      setIsEditing(false);
      toast({
        title: "Saved!",
        description: "Your exam has been updated successfully.",
      });
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

  const handleDeleteQuestion = (questionId: number) => {
    if (!editedExam) return;
    
    const updatedQuestions = editedExam.questions.filter(q => q.id !== questionId);
    setEditedExam({
      ...editedExam,
      questions: updatedQuestions.map((q, idx) => ({ ...q, id: idx + 1 })),
    });
  };

  const handleAddQuestion = () => {
    if (!editedExam) return;
    
    const newQuestion: Question = {
      id: editedExam.questions.length + 1,
      question: "New question",
      type: editedExam.question_type,
      options: editedExam.question_type === "multiple choice" 
        ? ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"]
        : undefined,
      correctAnswer: editedExam.question_type === "multiple choice" ? "A" : "Answer",
      explanation: "Explanation for this answer",
    };
    
    setEditedExam({
      ...editedExam,
      questions: [...editedExam.questions, newQuestion],
    });
    setEditingQuestionId(newQuestion.id);
  };

  const handleUpdateQuestion = (questionId: number, updates: Partial<Question>) => {
    if (!editedExam) return;
    
    const updatedQuestions = editedExam.questions.map(q => 
      q.id === questionId ? { ...q, ...updates } : q
    );
    setEditedExam({
      ...editedExam,
      questions: updatedQuestions,
    });
  };

  const handleCancelEdit = () => {
    setEditedExam(exam);
    setIsEditing(false);
    setEditingQuestionId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!exam || !editedExam) {
    return null;
  }

  const currentExam = isEditing ? editedExam : exam;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              {isEditing ? (
                <Input
                  value={editedExam.title}
                  onChange={(e) => setEditedExam({ ...editedExam, title: e.target.value })}
                  className="text-xl font-semibold h-auto py-1 px-2"
                />
              ) : (
                <h1 className="text-xl font-semibold">{exam.title}</h1>
              )}
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{exam.subject}</Badge>
                <Badge variant="outline" className="capitalize">{exam.difficulty}</Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {exam.time_limit} min
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => navigate(`/exam/${id}/take`)}>
                  <Play className="mr-2 h-4 w-4" />
                  Take Exam
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Exam
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Exam Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Exam Overview</span>
                <span className="text-lg font-normal text-muted-foreground">
                  {currentExam.questions.length} questions
                </span>
              </CardTitle>
              <CardDescription>
                {isEditing ? "Edit your exam details and questions below" : "Preview your exam questions"}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Questions List */}
          <div className="space-y-4">
            {currentExam.questions.map((question, index) => (
              <Card 
                key={question.id} 
                className={`transition-all ${editingQuestionId === question.id ? "ring-2 ring-primary" : ""}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {isEditing && (
                      <div className="flex-shrink-0 cursor-grab">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    
                    <div className="flex-1 space-y-4">
                      {editingQuestionId === question.id ? (
                        <>
                          <div className="space-y-2">
                            <Label>Question</Label>
                            <Textarea
                              value={question.question}
                              onChange={(e) => handleUpdateQuestion(question.id, { question: e.target.value })}
                              className="min-h-[80px]"
                            />
                          </div>
                          
                          {question.options && (
                            <div className="space-y-2">
                              <Label>Options</Label>
                              {question.options.map((option, optIdx) => (
                                <Input
                                  key={optIdx}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...question.options!];
                                    newOptions[optIdx] = e.target.value;
                                    handleUpdateQuestion(question.id, { options: newOptions });
                                  }}
                                />
                              ))}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Correct Answer</Label>
                              <Input
                                value={question.correctAnswer}
                                onChange={(e) => handleUpdateQuestion(question.id, { correctAnswer: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Explanation</Label>
                            <Textarea
                              value={question.explanation}
                              onChange={(e) => handleUpdateQuestion(question.id, { explanation: e.target.value })}
                            />
                          </div>
                          
                          <Button 
                            variant="secondary" 
                            size="sm"
                            onClick={() => setEditingQuestionId(null)}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Done Editing
                          </Button>
                        </>
                      ) : (
                        <>
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
                          
                          {/* AI Explanation saved from exam results */}
                          {exam?.ai_explanations?.[String(question.id)] && (
                            <div className="mt-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">Giải thích AI đã lưu</span>
                                <span className="text-xs text-muted-foreground">
                                  ({new Date(exam.ai_explanations[String(question.id)].created_at).toLocaleDateString('vi-VN')})
                                </span>
                              </div>
                              <p className="text-sm text-foreground whitespace-pre-wrap">
                                {exam.ai_explanations[String(question.id)].explanation}
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    
                    {isEditing && editingQuestionId !== question.id && (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingQuestionId(question.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Question</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this question? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteQuestion(question.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add Question Button */}
          {isEditing && (
            <Button 
              variant="outline" 
              className="w-full h-16 border-dashed"
              onClick={handleAddQuestion}
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Question
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
