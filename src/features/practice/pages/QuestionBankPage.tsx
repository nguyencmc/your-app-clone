import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, PlayCircle, FileCheck, Search, Filter } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useQuestionSets } from '../hooks/useQuestionSets';

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const { data: questionSets, isLoading, error } = useQuestionSets();

  const filteredSets = useMemo(() => {
    if (!questionSets) return [];
    
    return questionSets.filter((set) => {
      const matchesSearch =
        set.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLevel = levelFilter === 'all' || set.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [questionSets, searchQuery, levelFilter]);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Ngân hàng câu hỏi</h1>
          <p className="text-muted-foreground">
            Chọn bộ đề để luyện tập hoặc thi thử
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bộ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Có lỗi xảy ra khi tải dữ liệu</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredSets.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy bộ đề</h3>
            <p className="text-muted-foreground">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}

        {/* Question Sets Grid */}
        {!isLoading && !error && filteredSets.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSets.map((set) => {
              const levelInfo = getLevelBadge(set.level);
              return (
                <Card key={set.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2">{set.title}</CardTitle>
                      <Badge variant={levelInfo.variant}>{levelInfo.label}</Badge>
                    </div>
                    {set.description && (
                      <CardDescription className="line-clamp-2">
                        {set.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {set.question_count} câu hỏi
                      </span>
                    </div>

                    {/* Tags */}
                    {set.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
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

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/practice/setup/${set.id}`)}
                      >
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Luyện tập
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={() => navigate(`/practice/exam-setup/${set.id}`)}
                      >
                        <FileCheck className="mr-2 h-4 w-4" />
                        Thi thử
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
