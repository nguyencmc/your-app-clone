import { useState } from "react";
import { Brain, Clock, Copy, Image, ListChecks, Loader2, Minus, Paperclip, Plus, Send, Sparkles, X, Bold, Italic, Underline } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Question } from "../CreateExamWizard";
interface AddQuestionsStepProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  onNext: () => void;
  onPrev: () => void;
}

export default function AddQuestionsStep({
  questions,
  setQuestions,
  onNext,
  onPrev,
}: AddQuestionsStepProps) {
  const { toast } = useToast();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const [editMode, setEditMode] = useState<"raw" | "split" | "preview">("preview");

  const selectedQuestion = selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : null;

  const handleGenerateQuestions = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe the questions you want to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

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
            subject: "General",
            difficulty: "medium",
            questionCount: 5,
            questionType: "multiple choice",
            topic: aiPrompt,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate questions");
      }

      const data = await response.json();
      const newQuestions: Question[] = (data.questions || []).map((q: any, index: number) => ({
        id: Date.now() + index,
        question: q.question,
        type: "multiple_choice" as const,
        options: q.options || [],
        correctAnswer: q.correctAnswer || "",
        explanation: q.explanation || "",
        points: 1,
      }));

      setQuestions((prev) => [...prev, ...newQuestions]);
      setAiPrompt("");

      toast({
        title: "Questions Generated!",
        description: `Successfully generated ${newQuestions.length} questions.`,
      });
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate questions.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddMultipleChoice = () => {
    const newQuestion: Question = {
      id: Date.now(),
      question: "New multiple choice question",
      type: "multiple_choice",
      options: ["Option A", "Option B", "Option C", "Option D"],
      correctAnswer: "Option A",
      explanation: "",
      points: 1,
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setSelectedQuestionIndex(questions.length);
  };

  const handleAddLongAnswer = () => {
    const newQuestion: Question = {
      id: Date.now(),
      question: "New long answer question",
      type: "long_answer",
      correctAnswer: "",
      explanation: "",
      points: 1,
    };
    setQuestions((prev) => [...prev, newQuestion]);
    setSelectedQuestionIndex(questions.length);
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(null);
    } else if (selectedQuestionIndex !== null && selectedQuestionIndex > index) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    if (selectedQuestionIndex === null) return;
    setQuestions((prev) =>
      prev.map((q, i) => (i === selectedQuestionIndex ? updatedQuestion : q))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Add Questions</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage your exam questions
            </p>
          </div>
          <Button onClick={onNext} className="px-6">
            Next Step
          </Button>
        </div>
      </div>

      {/* AI Generation Card */}
      <div className="rounded-xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-transparent p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-pink-400" />
            <h2 className="text-lg font-semibold text-pink-400">
              Generate Questions with AI
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Copy className="w-4 h-4" />
              Clone Exam
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/40 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              4/5 uses left
            </div>
          </div>
        </div>

        <div className="relative">
          <Textarea
            placeholder="Describe the questions you want to generate..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="min-h-[100px] bg-background/50 border-border/40 resize-none pr-24"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Paperclip className="w-4 h-4" />
              Attach
            </Button>
            <Button
              size="icon"
              className="rounded-full bg-gradient-to-r from-primary to-purple-500"
              onClick={handleGenerateQuestions}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Questions Area */}
      {questions.length === 0 ? (
        // Empty State
        <div className="rounded-xl border border-border/40 bg-card/50 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <ListChecks className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Create your practice questions</h3>
          <p className="text-muted-foreground mb-6">Get started by adding questions</p>
          <div className="flex items-center justify-center gap-4">
            <Button onClick={handleAddMultipleChoice} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Add Multiple Choice
            </Button>
            <Button variant="outline" onClick={handleAddLongAnswer} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Long Answer
            </Button>
          </div>
        </div>
      ) : (
        // Question Editor
        <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
          {selectedQuestion ? (
            <>
              {/* Question Header */}
              <div className="p-4 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                    <span className="text-sm">⋮⋮</span>
                  </div>
                  <span className="font-semibold">Question {selectedQuestionIndex! + 1}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button size="sm" className="gap-2 bg-pink-500/20 text-pink-400 hover:bg-pink-500/30 relative">
                    <Sparkles className="w-4 h-4" />
                    Perfection
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-pink-500 text-white text-xs flex items-center justify-center">
                      14
                    </span>
                  </Button>
                  
                  <Button size="sm" variant="outline" className="gap-2 relative">
                    <Image className="w-4 h-4" />
                    Add Image
                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-cyan-500 text-white text-xs flex items-center justify-center">
                      10
                    </span>
                  </Button>

                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50 border border-border/40">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        if (selectedQuestion.points > 1) {
                          handleUpdateQuestion({ ...selectedQuestion, points: selectedQuestion.points - 1 });
                        }
                      }}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{selectedQuestion.points}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        handleUpdateQuestion({ ...selectedQuestion, points: selectedQuestion.points + 1 });
                      }}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteQuestion(selectedQuestionIndex!)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Editor Toolbar */}
              <div className="p-3 border-b border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Underline className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-6 bg-border mx-2" />
                  <Button variant="ghost" size="sm" className="text-xs">
                    H<sub>1</sub>
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    H<sub>2</sub>
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  {(["raw", "split", "preview"] as const).map((mode) => (
                    <Button
                      key={mode}
                      variant={editMode === mode ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setEditMode(mode)}
                      className="capitalize"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Question Content */}
              <div className="p-6">
                <Textarea
                  value={selectedQuestion.question}
                  onChange={(e) =>
                    handleUpdateQuestion({ ...selectedQuestion, question: e.target.value })
                  }
                  className="min-h-[200px] bg-muted/30 border-border/40"
                  placeholder="Enter your question..."
                />

                {/* Options for Multiple Choice */}
                {selectedQuestion.type === "multiple_choice" && selectedQuestion.options && (
                  <div className="mt-4 space-y-2">
                    <Label className="text-sm text-muted-foreground">Answer Options</Label>
                    {selectedQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...selectedQuestion.options!];
                            newOptions[index] = e.target.value;
                            handleUpdateQuestion({ ...selectedQuestion, options: newOptions });
                          }}
                          className="flex-1"
                        />
                        <Button
                          variant={selectedQuestion.correctAnswer === option ? "default" : "outline"}
                          size="sm"
                          onClick={() =>
                            handleUpdateQuestion({ ...selectedQuestion, correctAnswer: option })
                          }
                        >
                          {selectedQuestion.correctAnswer === option ? "Correct" : "Set as Correct"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <p className="text-muted-foreground">Select a question to edit</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Buttons */}
      {questions.length > 0 && (
        <div className="flex items-center gap-4">
          <Button onClick={handleAddMultipleChoice} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Multiple Choice
          </Button>
          <Button onClick={handleAddLongAnswer} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Add Long Answer
          </Button>
        </div>
      )}
    </div>
  );
}
