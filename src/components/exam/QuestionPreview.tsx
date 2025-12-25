import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Eye, CheckCircle2, X, Pencil, Save, Plus, Trash2 } from "lucide-react";

interface Question {
  id: number;
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

interface QuestionPreviewProps {
  questions: Question[];
  onClose: () => void;
  onQuestionsUpdate?: (questions: Question[]) => void;
  editable?: boolean;
  questionType?: string;
}

export default function QuestionPreview({ 
  questions, 
  onClose, 
  onQuestionsUpdate,
  editable = true,
  questionType = 'multiple choice'
}: QuestionPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editedQuestion, setEditedQuestion] = useState<Question | null>(null);

  

  const goNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      setIsEditing(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
      setIsEditing(false);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
    setShowAnswer(false);
    setIsEditing(false);
  };

  const startEditing = () => {
    setEditedQuestion({ ...currentQuestion });
    setIsEditing(true);
    setIsAddingNew(false);
  };

  const startAddingNew = () => {
    const newQuestion: Question = {
      id: questions.length + 1,
      question: '',
      type: questionType,
      options: questionType === 'multiple choice' ? ['A. ', 'B. ', 'C. ', 'D. '] : undefined,
      correctAnswer: questionType === 'multiple choice' ? 'A' : questionType === 'true/false' ? 'true' : '',
      explanation: ''
    };
    setEditedQuestion(newQuestion);
    setIsAddingNew(true);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditedQuestion(null);
    setIsEditing(false);
    setIsAddingNew(false);
  };

  const saveQuestion = () => {
    if (!editedQuestion || !onQuestionsUpdate) return;
    
    // Validate question
    if (!editedQuestion.question.trim()) return;
    if (editedQuestion.type === 'multiple choice' && (!editedQuestion.options || editedQuestion.options.length < 2)) return;
    if (!editedQuestion.correctAnswer) return;
    
    if (isAddingNew) {
      // Add new question
      const newQuestions = [...questions, { ...editedQuestion, id: questions.length + 1 }];
      onQuestionsUpdate(newQuestions);
      setCurrentIndex(newQuestions.length - 1);
    } else {
      // Update existing question
      const updatedQuestions = questions.map((q, idx) => 
        idx === currentIndex ? { ...editedQuestion, id: idx + 1 } : q
      );
      onQuestionsUpdate(updatedQuestions);
    }
    
    setIsEditing(false);
    setIsAddingNew(false);
    setEditedQuestion(null);
  };

  const deleteQuestion = () => {
    if (!onQuestionsUpdate || questions.length <= 1) return;
    
    const updatedQuestions = questions
      .filter((_, idx) => idx !== currentIndex)
      .map((q, idx) => ({ ...q, id: idx + 1 }));
    
    onQuestionsUpdate(updatedQuestions);
    
    if (currentIndex >= updatedQuestions.length) {
      setCurrentIndex(Math.max(0, updatedQuestions.length - 1));
    }
  };

  const updateOption = (optionIndex: number, value: string) => {
    if (!editedQuestion?.options) return;
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const newOptions = [...editedQuestion.options];
    // Keep the letter prefix
    newOptions[optionIndex] = `${letters[optionIndex]}. ${value}`;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const addOption = () => {
    if (!editedQuestion) return;
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const currentOptions = editedQuestion.options || [];
    if (currentOptions.length >= 26) return;
    
    const newLetter = letters[currentOptions.length];
    setEditedQuestion({
      ...editedQuestion,
      options: [...currentOptions, `${newLetter}. `]
    });
  };

  const removeOption = (optionIndex: number) => {
    if (!editedQuestion?.options || editedQuestion.options.length <= 2) return;
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const newOptions = editedQuestion.options
      .filter((_, idx) => idx !== optionIndex)
      .map((opt, idx) => {
        const textPart = opt.replace(/^[A-Z][\.\)]\s*/, '');
        return `${letters[idx]}. ${textPart}`;
      });
    
    // Update correct answer if needed
    let newCorrectAnswer = editedQuestion.correctAnswer;
    const removedLetter = letters[optionIndex];
    if (editedQuestion.correctAnswer === removedLetter) {
      newCorrectAnswer = letters[0];
    } else if (editedQuestion.correctAnswer > removedLetter) {
      const answerIndex = letters.indexOf(editedQuestion.correctAnswer);
      newCorrectAnswer = letters[answerIndex - 1];
    }
    
    setEditedQuestion({
      ...editedQuestion,
      options: newOptions,
      correctAnswer: newCorrectAnswer
    });
  };

  const getOptionText = (option: string) => {
    return option.replace(/^[A-Z][\.\)]\s*/, '');
  };

  // Handle empty questions list
  if (questions.length === 0 && !isAddingNew) {
    return null;
  }

  const currentQuestion = !isAddingNew ? questions[currentIndex] : null;

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            {isAddingNew ? 'Thêm câu hỏi mới' : isEditing ? 'Chỉnh sửa câu hỏi' : 'Xem trước câu hỏi'}
          </CardTitle>
          <div className="flex items-center gap-1">
            {editable && !isEditing && (
              <>
                <Button variant="ghost" size="icon" onClick={startAddingNew} title="Thêm câu hỏi mới">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={startEditing} title="Chỉnh sửa">
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
            {editable && !isEditing && questions.length > 1 && (
              <Button variant="ghost" size="icon" onClick={deleteQuestion} className="text-destructive hover:text-destructive" title="Xóa câu hỏi">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {!isAddingNew && currentQuestion && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Câu {currentIndex + 1} / {questions.length}</span>
            <Badge variant="outline" className="text-xs">
              {currentQuestion.type}
            </Badge>
          </div>
        )}
        {isAddingNew && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Thêm câu hỏi #{questions.length + 1}</span>
            <Badge variant="outline" className="text-xs">
              {questionType}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question Navigation Pills */}
        <ScrollArea className="w-full">
          <div className="flex gap-1 pb-2">
            {questions.map((_, index) => (
              <Button
                key={index}
                variant={index === currentIndex ? "default" : "outline"}
                size="sm"
                className="h-7 w-7 p-0 text-xs shrink-0"
                onClick={() => goToQuestion(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </ScrollArea>

        {isEditing && editedQuestion ? (
          /* Edit Mode */
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Câu hỏi</Label>
              <Textarea
                value={editedQuestion.question}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            {/* Options for multiple choice */}
            {editedQuestion.type === 'multiple choice' && editedQuestion.options && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Các đáp án</Label>
                  {editedQuestion.options.length < 26 && (
                    <Button variant="outline" size="sm" onClick={addOption}>
                      <Plus className="h-3 w-3 mr-1" />
                      Thêm
                    </Button>
                  )}
                </div>
                {editedQuestion.options.map((option, idx) => {
                  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-medium">{letters[idx]}.</span>
                      <Input
                        value={getOptionText(option)}
                        onChange={(e) => updateOption(idx, e.target.value)}
                        className="flex-1"
                      />
                      {editedQuestion.options && editedQuestion.options.length > 2 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(idx)}
                          className="shrink-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Correct Answer */}
            <div className="space-y-2">
              <Label>Đáp án đúng</Label>
              {editedQuestion.type === 'multiple choice' && editedQuestion.options ? (
                <Select
                  value={editedQuestion.correctAnswer}
                  onValueChange={(value) => setEditedQuestion({ ...editedQuestion, correctAnswer: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {editedQuestion.options.map((_, idx) => {
                      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                      return (
                        <SelectItem key={idx} value={letters[idx]}>
                          {letters[idx]}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : editedQuestion.type === 'true/false' ? (
                <Select
                  value={editedQuestion.correctAnswer}
                  onValueChange={(value) => setEditedQuestion({ ...editedQuestion, correctAnswer: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">True</SelectItem>
                    <SelectItem value="false">False</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={editedQuestion.correctAnswer}
                  onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value })}
                />
              )}
            </div>

            {/* Explanation */}
            <div className="space-y-2">
              <Label>Giải thích (tùy chọn)</Label>
              <Textarea
                value={editedQuestion.explanation}
                onChange={(e) => setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
                placeholder="Nhập giải thích cho đáp án..."
              />
            </div>

            {/* Edit Actions */}
            <div className="flex gap-2">
              <Button onClick={saveQuestion} className="flex-1">
                <Save className="h-4 w-4 mr-1" />
                Lưu
              </Button>
              <Button variant="outline" onClick={cancelEditing} className="flex-1">
                Hủy
              </Button>
            </div>
          </div>
        ) : currentQuestion ? (
          /* View Mode */
          <>
            {/* Question Content */}
            <div className="p-4 bg-muted/30 rounded-lg space-y-4">
              <p className="font-medium text-foreground leading-relaxed">
                {currentQuestion.question}
              </p>

              {/* Options for multiple choice */}
              {currentQuestion.options && currentQuestion.options.length > 0 && (
                <div className="space-y-2">
                  {currentQuestion.options.map((option, idx) => {
                    const optionLetter = option.charAt(0);
                    const isCorrect = optionLetter === currentQuestion.correctAnswer;
                    
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-md border transition-colors ${
                          showAnswer && isCorrect
                            ? 'border-green-500 bg-green-500/10'
                            : 'border-border bg-background/50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {showAnswer && isCorrect && (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          )}
                          <span className={showAnswer && isCorrect ? 'text-green-700 dark:text-green-300' : ''}>
                            {option}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* True/False display */}
              {currentQuestion.type === 'true/false' && (
                <div className="flex gap-3">
                  {['True', 'False'].map((opt) => {
                    const isCorrect = currentQuestion.correctAnswer.toLowerCase() === opt.toLowerCase();
                    return (
                      <div
                        key={opt}
                        className={`flex-1 p-3 rounded-md border text-center transition-colors ${
                          showAnswer && isCorrect
                            ? 'border-green-500 bg-green-500/10 text-green-700 dark:text-green-300'
                            : 'border-border bg-background/50'
                        }`}
                      >
                        {showAnswer && isCorrect && (
                          <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto mb-1" />
                        )}
                        {opt}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Short answer display */}
              {currentQuestion.type === 'short answer' && showAnswer && (
                <div className="p-3 rounded-md border border-green-500 bg-green-500/10">
                  <p className="text-sm text-muted-foreground mb-1">Đáp án:</p>
                  <p className="font-medium text-green-700 dark:text-green-300">
                    {currentQuestion.correctAnswer}
                  </p>
                </div>
              )}
            </div>

            {/* Show Answer Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswer(!showAnswer)}
              className="w-full"
            >
              {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
            </Button>

            {/* Explanation */}
            {showAnswer && currentQuestion.explanation && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                  Giải thích:
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-200">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}
          </>
        ) : null}

        {/* Navigation Buttons */}
        {!isEditing && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trước
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {questions.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={goNext}
              disabled={currentIndex === questions.length - 1}
            >
              Sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}