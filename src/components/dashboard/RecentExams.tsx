import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, MoreVertical, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Exam {
  id: string;
  title: string;
  subject: string;
  created_at: string;
  question_count: number;
  difficulty: string;
}

const RecentExams = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("id, title, subject, created_at, question_count, difficulty")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setExams(data || []);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;
      
      setExams(exams.filter(exam => exam.id !== id));
      toast({
        title: "Exam Deleted",
        description: "The exam has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete exam. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleView = (id: string) => {
    navigate(`/exam/${id}`);
  };

  if (isLoading) {
    return (
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Exams</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-secondary/30 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Exams</h3>
        {exams.length > 0 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all
          </Button>
        )}
      </div>
      
      {exams.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No exams created yet</p>
          <p className="text-sm text-muted-foreground">Create your first exam to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <div
              key={exam.id}
              className="flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors group cursor-pointer"
              onClick={() => handleView(exam.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{exam.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {exam.subject} • {format(new Date(exam.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-foreground">{exam.question_count} questions</p>
                  <p className="text-xs text-muted-foreground capitalize">{exam.difficulty}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="gap-2" onClick={(e) => { e.stopPropagation(); handleView(exam.id); }}>
                      <Eye className="w-4 h-4" />
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="gap-2 text-destructive focus:text-destructive"
                      onClick={(e) => { e.stopPropagation(); handleDelete(exam.id); }}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentExams;
