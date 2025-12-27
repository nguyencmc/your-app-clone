import { useState } from "react";
import { Brain, Clock, Copy, Image, ListChecks, Loader2, Minus, Paperclip, Plus, Send, Sparkles, X, Bold, Italic, Underline, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Question } from "../CreateExamWizard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const selectedQuestion = selectedQuestionIndex !== null ? questions[selectedQuestionIndex] : null;

  const toggleQuestionExpand = (index: number) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

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
      setShowAiPanel(false);

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
    setExpandedQuestions(prev => new Set(prev).add(questions.length));
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
    setExpandedQuestions(prev => new Set(prev).add(questions.length));
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(null);
    } else if (selectedQuestionIndex !== null && selectedQuestionIndex > index) {
      setSelectedQuestionIndex(selectedQuestionIndex - 1);
    }
    setExpandedQuestions(prev => {
      const newSet = new Set<number>();
      prev.forEach(i => {
        if (i < index) newSet.add(i);
        else if (i > index) newSet.add(i - 1);
      });
      return newSet;
    });
  };

  const handleUpdateQuestion = (index: number, updatedQuestion: Question) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? updatedQuestion : q))
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 lg:space-y-6 p-4 lg:p-0">
      {/* Header */}
      <div className="rounded-xl border border-border/40 bg-card/50 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">Add Questions</h1>
            <p className="text-muted-foreground text-sm lg:text-base mt-1">
              Create and manage your exam questions
            </p>
          </div>
          <Button onClick={onNext} className="hidden lg:flex px-6">
            Next Step
          </Button>
        </div>
      </div>

      {/* AI Generation Card - Collapsible on Mobile */}
      <div className="rounded-xl border-2 border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-transparent overflow-hidden">
        <button
          onClick={() => setShowAiPanel(!showAiPanel)}
          className="w-full p-4 flex items-center justify-between lg:hidden"
        >
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-pink-400" />
            <span className="font-semibold text-pink-400">Generate with AI</span>
          </div>
          {showAiPanel ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        <div className={`p-4 lg:p-6 ${showAiPanel ? 'block' : 'hidden lg:block'} ${showAiPanel ? '' : 'lg:pt-6'}`}>
          <div className="hidden lg:flex items-center justify-between mb-4">
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
              className="min-h-[80px] lg:min-h-[100px] bg-background/50 border-border/40 resize-none pr-12 lg:pr-24"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <Button variant="ghost" size="sm" className="hidden lg:flex gap-2">
                <Paperclip className="w-4 h-4" />
                Attach
              </Button>
              <Button
                size="icon"
                className="rounded-full bg-gradient-to-r from-primary to-purple-500 h-9 w-9"
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
      </div>

      {/* Add Question Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={handleAddMultipleChoice} variant="outline" className="h-12 gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span> Multiple Choice
        </Button>
        <Button onClick={handleAddLongAnswer} variant="outline" className="h-12 gap-2 text-sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add</span> Long Answer
        </Button>
      </div>

      {/* Questions Area */}
      {questions.length === 0 ? (
        <div className="rounded-xl border border-border/40 bg-card/50 p-8 lg:p-12 text-center">
          <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <ListChecks className="w-7 h-7 lg:w-8 lg:h-8 text-primary" />
          </div>
          <h3 className="text-lg lg:text-xl font-semibold mb-2">Create your practice questions</h3>
          <p className="text-muted-foreground text-sm mb-6">Get started by adding questions</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <Collapsible
              key={question.id}
              open={expandedQuestions.has(index)}
              onOpenChange={() => toggleQuestionExpand(index)}
            >
              <div className="rounded-xl border border-border/40 bg-card/50 overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium flex-shrink-0">
                    Q{index + 1}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium truncate text-sm lg:text-base">{question.question}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {question.type === "multiple_choice" ? "Multiple Choice" : "Long Answer"} • {question.points} pts
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {expandedQuestions.has(index) ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="p-4 pt-0 border-t border-border/40 space-y-4">
                    {/* Question Text */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Question</Label>
                      <Textarea
                        value={question.question}
                        onChange={(e) =>
                          handleUpdateQuestion(index, { ...question, question: e.target.value })
                        }
                        className="min-h-[80px] lg:min-h-[100px] bg-muted/30 border-border/40"
                        placeholder="Enter your question..."
                      />
                    </div>

                    {/* Options for Multiple Choice */}
                    {question.type === "multiple_choice" && question.options && (
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Answer Options</Label>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs flex-shrink-0">
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...question.options!];
                                  newOptions[optIndex] = e.target.value;
                                  handleUpdateQuestion(index, { ...question, options: newOptions });
                                }}
                                className="flex-1 h-10"
                              />
                              <Button
                                variant={question.correctAnswer === option ? "default" : "outline"}
                                size="sm"
                                onClick={() =>
                                  handleUpdateQuestion(index, { ...question, correctAnswer: option })
                                }
                                className="h-10 px-2 lg:px-3 text-xs lg:text-sm"
                              >
                                {question.correctAnswer === option ? "✓" : "Set"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Points and Delete */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm text-muted-foreground">Points:</Label>
                        <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50 border border-border/40">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              if (question.points > 1) {
                                handleUpdateQuestion(index, { ...question, points: question.points - 1 });
                              }
                            }}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center text-sm">{question.points}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              handleUpdateQuestion(index, { ...question, points: question.points + 1 });
                            }}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteQuestion(index)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}

      {/* Summary */}
      {questions.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Total: {questions.length} questions
          </span>
          <span className="text-sm font-medium">
            {questions.reduce((sum, q) => sum + q.points, 0)} points
          </span>
        </div>
      )}
    </div>
  );
}
