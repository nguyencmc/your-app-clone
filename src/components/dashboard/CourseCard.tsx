import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CourseCard = () => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate("/dashboard/courses")}
      className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 rounded-xl p-5 transition-all cursor-pointer h-full flex flex-col"
    >
      {/* Illustration */}
      <div className="flex-1 flex items-center justify-center mb-4">
        <div className="flex gap-3">
          {/* Card 1 */}
          <div className="w-24 h-20 bg-muted/50 rounded-lg p-2 border border-border/30">
            <div className="w-full h-2 bg-primary/40 rounded mb-2" />
            <div className="w-3/4 h-2 bg-muted-foreground/20 rounded mb-1.5" />
            <div className="w-full h-2 bg-muted-foreground/20 rounded mb-1.5" />
            <div className="w-2/3 h-2 bg-muted-foreground/20 rounded" />
          </div>
          {/* Card 2 */}
          <div className="w-24 h-20 bg-muted/50 rounded-lg p-2 border border-border/30">
            <div className="w-full h-2 bg-primary/40 rounded mb-2" />
            <div className="w-3/4 h-2 bg-muted-foreground/20 rounded mb-1.5" />
            <div className="w-full h-2 bg-muted-foreground/20 rounded mb-1.5" />
            <div className="w-2/3 h-2 bg-muted-foreground/20 rounded" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">Manage your courses</h3>
          <p className="text-sm text-muted-foreground">Create and manage your courses and subjects</p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
