import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CreateExamCard = () => {
  return (
    <div className="bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 rounded-xl p-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      
      <div className="relative z-10">
        <h3 className="text-xl font-semibold text-gradient mb-2">Create Exam with AI</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-md">
          Take a leap and create an exam with AI. It's fast, easy, and powerful.
        </p>
        <Button className="bg-background/80 hover:bg-background text-foreground">
          Create Exam
          <Sparkles className="w-4 h-4 ml-2 text-primary" />
        </Button>
      </div>

      {/* AI Chat bubble */}
      <div className="absolute right-4 top-4 w-44 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border/50 shadow-xl hidden lg:block">
        <div className="text-xs text-muted-foreground mb-1">AI Assistant</div>
        <div className="text-sm text-foreground mb-2">Create a calculus exam</div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">Here is a draft exam...</span>
        </div>
      </div>
    </div>
  );
};

export default CreateExamCard;
