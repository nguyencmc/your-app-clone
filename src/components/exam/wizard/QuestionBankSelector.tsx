import { useState, useEffect } from "react";
import { Library, Search, Check, X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuestionBank } from "@/hooks/useQuestionBank";
import { QuestionBankItem } from "@/types/questionBank";
import { Question } from "../CreateExamWizard";

interface QuestionBankSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectQuestions: (questions: Question[]) => void;
  existingQuestionIds?: number[];
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  hard: "bg-red-500/20 text-red-400 border-red-500/30",
};

const typeLabels: Record<string, string> = {
  multiple_choice: "Multiple Choice",
  long_answer: "Long Answer",
  true_false: "True/False",
};

export default function QuestionBankSelector({
  open,
  onOpenChange,
  onSelectQuestions,
  existingQuestionIds = [],
}: QuestionBankSelectorProps) {
  const { questions, isLoading, subjects, filters, setFilters } = useQuestionBank();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  // Reset selection when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedIds(new Set());
      setLocalSearch("");
    }
  }, [open]);

  // Filter questions locally for search
  const filteredQuestions = questions.filter(q => {
    if (!localSearch) return true;
    const searchLower = localSearch.toLowerCase();
    return q.question.toLowerCase().includes(searchLower) ||
      q.tags.some(t => t.toLowerCase().includes(searchLower)) ||
      (q.subject && q.subject.toLowerCase().includes(searchLower));
  });

  const handleToggleQuestion = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredQuestions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredQuestions.map(q => q.id)));
    }
  };

  const handleAddSelected = () => {
    const selectedQuestions = questions.filter(q => selectedIds.has(q.id));
    const convertedQuestions: Question[] = selectedQuestions.map((q, index) => ({
      id: Date.now() + index,
      question: q.question,
      type: q.type === "true_false" ? "multiple_choice" : q.type as "multiple_choice" | "long_answer",
      options: q.type === "true_false" ? ["True", "False"] : q.options,
      correctAnswer: q.correct_answer,
      explanation: q.explanation || "",
      points: q.points,
    }));
    
    onSelectQuestions(convertedQuestions);
    onOpenChange(false);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      subject: null,
      difficulty: null,
      tags: [],
    });
    setLocalSearch("");
  };

  const hasActiveFilters = filters.subject || filters.difficulty || localSearch;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
        <SheetHeader className="p-4 pb-0">
          <SheetTitle className="flex items-center gap-2">
            <Library className="w-5 h-5 text-primary" />
            Question Bank
          </SheetTitle>
          <SheetDescription>
            Select questions from your library to add to the exam
          </SheetDescription>
        </SheetHeader>

        {/* Search & Filter */}
        <div className="p-4 space-y-3 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 pr-9"
            />
            {localSearch && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setLocalSearch("")}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                  Active
                </Badge>
              )}
            </span>
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-2 gap-2">
              <Select
                value={filters.subject || "all"}
                onValueChange={(value) => setFilters(prev => ({ ...prev, subject: value === "all" ? null : value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filters.difficulty || "all"}
                onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value === "all" ? null : value }))}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="col-span-2 text-xs">
                  Clear Filters
                </Button>
              )}
            </div>
          )}

          {/* Select All */}
          <div className="flex items-center justify-between text-sm">
            <button
              onClick={handleSelectAll}
              className="text-primary hover:underline"
            >
              {selectedIds.size === filteredQuestions.length && filteredQuestions.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>
            <span className="text-muted-foreground">
              {selectedIds.size} selected
            </span>
          </div>
        </div>

        {/* Questions List */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading questions...
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="p-8 text-center">
              <Library className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "No questions match your filters"
                  : "Your question bank is empty"}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredQuestions.map((question) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  isSelected={selectedIds.has(question.id)}
                  onToggle={() => handleToggleQuestion(question.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border bg-background">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSelected}
              disabled={selectedIds.size === 0}
              className="flex-1"
            >
              Add {selectedIds.size > 0 ? `${selectedIds.size} Questions` : "Selected"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface QuestionItemProps {
  question: QuestionBankItem;
  isSelected: boolean;
  onToggle: () => void;
}

function QuestionItem({ question, isSelected, onToggle }: QuestionItemProps) {
  return (
    <div
      onClick={onToggle}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? "border-primary bg-primary/10"
          : "border-border hover:border-primary/50 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
          onClick={(e) => e.stopPropagation()}
          className="mt-0.5"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2 mb-2">
            {question.question}
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className="text-xs px-1.5 py-0">
              {typeLabels[question.type] || question.type}
            </Badge>
            <Badge
              variant="outline"
              className={`text-xs px-1.5 py-0 ${difficultyColors[question.difficulty]}`}
            >
              {question.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {question.points} pts
            </span>
            {question.subject && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {question.subject}
              </Badge>
            )}
          </div>
        </div>
        {isSelected && (
          <Check className="w-4 h-4 text-primary flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
