import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourseAssistant } from "@/hooks/useCourseAssistant";
import { courseService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Users, 
  MessageSquare, 
  Loader2,
  Copy,
  Check,
  X,
  Save,
  History,
  Download,
  FileText,
  FileDown
} from "lucide-react";
import { exportSuggestions } from "@/lib/documentExport";
import { Course, AISuggestion } from "@/types";

interface AICourseAssistantProps {
  course: Course;
  studentCount?: number;
  onSuggestionSaved?: () => void;
}

export const AICourseAssistant = ({ course, studentCount = 0, onSuggestionSaved }: AICourseAssistantProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("syllabus");
  const [showHistory, setShowHistory] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Syllabus options
  const [duration, setDuration] = useState("12 tuần");
  const [level, setLevel] = useState("intermediate");
  
  // Question input
  const [question, setQuestion] = useState("");
  
  const { toast } = useToast();
  const { 
    isLoading, 
    response, 
    generateSyllabus, 
    suggestContent, 
    analyzeStudents,
    askQuestion,
    clearResponse 
  } = useCourseAssistant();

  const courseContext = {
    title: course.title,
    subject: course.subject || undefined,
    description: course.description || undefined,
    studentCount,
  };

  const handleGenerateSyllabus = () => {
    clearResponse();
    generateSyllabus(courseContext, { duration, level });
  };

  const handleSuggestContent = () => {
    clearResponse();
    suggestContent(courseContext);
  };

  const handleAnalyzeStudents = () => {
    clearResponse();
    analyzeStudents(courseContext);
  };

  const handleAskQuestion = () => {
    if (!question.trim()) return;
    clearResponse();
    askQuestion(courseContext, question);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveSuggestion = async () => {
    if (!response.trim()) return;
    
    setIsSaving(true);
    try {
      const suggestionType = activeTab as AISuggestion['type'];
      await courseService.saveAISuggestion(course.id, {
        type: suggestionType,
        content: response,
        metadata: {
          duration: activeTab === 'syllabus' ? duration : undefined,
          level: activeTab === 'syllabus' ? level : undefined,
          question: activeTab === 'question' ? question : undefined,
        },
      });
      
      toast({
        title: "Đã lưu",
        description: "Gợi ý AI đã được lưu vào khóa học.",
      });
      
      onSuggestionSaved?.();
    } catch (error) {
      console.error("Error saving suggestion:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu gợi ý. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSavedSuggestion = async (suggestionId: string) => {
    try {
      await courseService.deleteAISuggestion(course.id, suggestionId);
      toast({
        title: "Đã xóa",
        description: "Gợi ý đã được xóa.",
      });
      onSuggestionSaved?.();
    } catch (error) {
      console.error("Error deleting suggestion:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa gợi ý.",
        variant: "destructive",
      });
    }
  };

  const levelLabels: Record<string, string> = {
    beginner: "Cơ bản",
    intermediate: "Trung cấp",
    advanced: "Nâng cao",
  };

  const savedSuggestions = course.ai_suggestions || [];
  const filteredSuggestions = savedSuggestions.filter(s => {
    if (activeTab === 'ask') return s.type === 'question';
    return s.type === activeTab;
  });

  const typeLabels: Record<string, string> = {
    syllabus: 'Syllabus',
    content: 'Nội dung',
    students: 'Học sinh',
    question: 'Hỏi đáp',
  };

  const handleExport = async (format: 'pdf' | 'word') => {
    if (savedSuggestions.length === 0) {
      toast({
        title: "Không có gợi ý",
        description: "Chưa có gợi ý nào được lưu để xuất.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      await exportSuggestions({
        title: `Gợi ý AI - ${course.title}`,
        courseTitle: course.title,
        suggestions: savedSuggestions,
        format,
      });
      
      toast({
        title: "Xuất thành công",
        description: format === 'pdf' 
          ? "Cửa sổ in PDF đã được mở." 
          : "File Word đã được tải xuống.",
      });
    } catch (error) {
      console.error("Error exporting:", error);
      toast({
        title: "Lỗi xuất file",
        description: error instanceof Error ? error.message : "Không thể xuất file. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white border-0 h-8 px-3"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          AI Assistant
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader className="pb-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                  AI Course Assistant
                </span>
                <p className="text-xs text-muted-foreground font-normal mt-0.5">
                  {course.title}
                </p>
              </div>
            </SheetTitle>
            <div className="flex items-center gap-1">
              {savedSuggestions.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport('pdf')}
                    disabled={isExporting}
                    className="h-8 px-2"
                    title="Xuất PDF"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExport('word')}
                    disabled={isExporting}
                    className="h-8 px-2"
                    title="Xuất Word"
                  >
                    {isExporting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileDown className="w-4 h-4" />
                    )}
                  </Button>
                </>
              )}
              <Button
                variant={showHistory ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="h-8 px-2"
              >
                <History className="w-4 h-4 mr-1" />
                Đã lưu ({savedSuggestions.length})
              </Button>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden mt-4">
          <TabsList className="grid w-full grid-cols-4 mb-4">
            <TabsTrigger value="syllabus" className="text-xs sm:text-sm">
              <BookOpen className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
              Syllabus
            </TabsTrigger>
            <TabsTrigger value="content" className="text-xs sm:text-sm">
              <Lightbulb className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
              Nội dung
            </TabsTrigger>
            <TabsTrigger value="students" className="text-xs sm:text-sm">
              <Users className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
              Học sinh
            </TabsTrigger>
            <TabsTrigger value="ask" className="text-xs sm:text-sm">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5 hidden sm:block" />
              Hỏi đáp
            </TabsTrigger>
          </TabsList>

          {/* Syllabus Tab */}
          <TabsContent value="syllabus" className="flex-1 flex flex-col overflow-hidden m-0">
            <Card className="border-violet-500/20 bg-violet-500/5 mb-4">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Thời lượng</Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="4 tuần">4 tuần</SelectItem>
                        <SelectItem value="8 tuần">8 tuần</SelectItem>
                        <SelectItem value="12 tuần">12 tuần</SelectItem>
                        <SelectItem value="16 tuần">16 tuần</SelectItem>
                        <SelectItem value="1 học kỳ">1 học kỳ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Cấp độ</Label>
                    <Select value={level} onValueChange={setLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Cơ bản</SelectItem>
                        <SelectItem value="intermediate">Trung cấp</SelectItem>
                        <SelectItem value="advanced">Nâng cao</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleGenerateSyllabus} 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Tạo Syllabus
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="flex-1 flex flex-col overflow-hidden m-0">
            <Card className="border-cyan-500/20 bg-cyan-500/5 mb-4">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-4">
                  AI sẽ phân tích khóa học và đề xuất nội dung bổ sung phù hợp: bài học, tài liệu, bài tập, và hoạt động.
                </p>
                <Button 
                  onClick={handleSuggestContent} 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lightbulb className="w-4 h-4 mr-2" />
                  )}
                  Đề xuất Nội dung
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="flex-1 flex flex-col overflow-hidden m-0">
            <Card className="border-amber-500/20 bg-amber-500/5 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="secondary" className="bg-amber-500/20 text-amber-300">
                    <Users className="w-3 h-3 mr-1" />
                    {studentCount} học sinh
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  AI sẽ phân tích và xác định học sinh cần hỗ trợ (at-risk), đề xuất các biện pháp can thiệp phù hợp.
                </p>
                <Button 
                  onClick={handleAnalyzeStudents} 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  Phân tích Học sinh
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ask Tab */}
          <TabsContent value="ask" className="flex-1 flex flex-col overflow-hidden m-0">
            <Card className="border-emerald-500/20 bg-emerald-500/5 mb-4">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Câu hỏi của bạn</Label>
                  <Textarea
                    placeholder="Ví dụ: Làm thế nào để tăng sự tham gia của học sinh? Nên tổ chức bao nhiêu bài kiểm tra?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <Button 
                  onClick={handleAskQuestion} 
                  disabled={isLoading || !question.trim()}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageSquare className="w-4 h-4 mr-2" />
                  )}
                  Gửi câu hỏi
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Response Area */}
          {(response || isLoading) && (
            <Card className="flex-1 flex flex-col overflow-hidden border-border/50">
              <CardHeader className="py-3 px-4 border-b border-border/50 flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  Kết quả
                </CardTitle>
                {response && !isLoading && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveSuggestion}
                      disabled={isSaving}
                      className="h-8 px-2 text-green-500 hover:text-green-600"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopy}
                      className="h-8 px-2"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearResponse}
                      className="h-8 px-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full max-h-[400px]">
                  <div className="p-4 prose prose-sm prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
                      {response || "Đang xử lý..."}
                    </pre>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Saved Suggestions History */}
          {showHistory && filteredSuggestions.length > 0 && (
            <Card className="flex-1 flex flex-col overflow-hidden border-border/50 mt-4">
              <CardHeader className="py-3 px-4 border-b border-border/50">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Gợi ý đã lưu - {typeLabels[activeTab === 'ask' ? 'question' : activeTab]}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full max-h-[300px]">
                  <div className="p-4 space-y-4">
                    {filteredSuggestions.map((suggestion) => (
                      <div key={suggestion.id} className="border border-border/50 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {typeLabels[suggestion.type]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(suggestion.created_at).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={async () => {
                                await navigator.clipboard.writeText(suggestion.content);
                                toast({
                                  title: "Đã sao chép",
                                  description: "Nội dung đã được sao chép vào clipboard.",
                                });
                              }}
                              className="h-7 px-2"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSavedSuggestion(suggestion.id)}
                              className="h-7 px-2 text-destructive hover:text-destructive"
                            >
                              <X className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                        {suggestion.metadata?.question && (
                          <p className="text-xs text-muted-foreground italic">
                            Câu hỏi: {suggestion.metadata.question}
                          </p>
                        )}
                        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/80 max-h-32 overflow-hidden">
                          {suggestion.content.length > 500 
                            ? suggestion.content.slice(0, 500) + '...' 
                            : suggestion.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {showHistory && filteredSuggestions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Chưa có gợi ý nào được lưu cho {typeLabels[activeTab === 'ask' ? 'question' : activeTab]}</p>
            </div>
          )}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};
