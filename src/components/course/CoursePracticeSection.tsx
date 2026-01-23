import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuestionSetsByCourse } from "@/features/practice/hooks/useQuestionSetsByCourse";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ClipboardCheck, FileQuestion, Target } from "lucide-react";
import { toast } from "sonner";

interface CoursePracticeSectionProps {
  courseId: string;
}

const getLevelBadge = (level: string) => {
  switch (level) {
    case 'easy':
      return { label: 'Dễ', variant: 'secondary' as const };
    case 'medium':
      return { label: 'Trung bình', variant: 'default' as const };
    case 'hard':
      return { label: 'Khó', variant: 'destructive' as const };
    default:
      return { label: level, variant: 'outline' as const };
  }
};

export function CoursePracticeSection({ courseId }: CoursePracticeSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: questionSets, isLoading, error } = useQuestionSetsByCourse(courseId);

  const handleNavigate = (path: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để luyện thi");
      navigate("/auth");
      return;
    }
    navigate(path);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Luyện thi
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-1/2" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
        Không thể tải bộ đề luyện thi
      </div>
    );
  }

  if (!questionSets || questionSets.length === 0) {
    return (
      <div className="bg-card border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Luyện thi
        </h2>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileQuestion className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Chưa có bộ đề cho khóa học này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        Luyện thi
      </h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        {questionSets.map((set) => {
          const levelBadge = getLevelBadge(set.level);
          
          return (
            <Card key={set.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-2">{set.title}</CardTitle>
                  <Badge variant={levelBadge.variant} className="shrink-0">
                    {levelBadge.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {set.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {set.description}
                  </p>
                )}
                
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <FileQuestion className="w-4 h-4" />
                    {set.question_count} câu hỏi
                  </span>
                </div>
                
                {set.tags && set.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {set.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {set.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{set.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleNavigate(`/practice/setup/${set.id}`)}
                  >
                    <BookOpen className="w-4 h-4 mr-1" />
                    Practice
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleNavigate(`/practice/exam-setup/${set.id}`)}
                  >
                    <ClipboardCheck className="w-4 h-4 mr-1" />
                    Exam
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
