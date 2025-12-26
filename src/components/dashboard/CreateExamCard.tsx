import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CreateExamCard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-gradient-to-r from-primary/80 via-primary/60 to-violet-500/60 border border-primary/20 rounded-xl p-6 relative overflow-hidden h-full min-h-[180px]">
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-400/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">Create Exam with AI</h3>
          <p className="text-sm text-white/80 mb-4 max-w-xs">
            Take a leap and create an exam with AI. It's fast, easy, and powerful.
          </p>
          <Button 
            onClick={() => navigate("/create-exam")}
            className="bg-white hover:bg-white/90 text-primary font-medium"
          >
            Create Exam
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* AI Chat bubble */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-48 bg-white rounded-xl p-3 shadow-xl hidden lg:block">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
          <span className="text-xs font-medium text-gray-800">AI Assistant</span>
          <div className="flex gap-0.5 ml-auto">
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <div className="w-1 h-1 rounded-full bg-gray-300" />
          </div>
        </div>
        <div className="text-xs text-gray-600 mb-2 pl-7">Create a calculus exam</div>
        <div className="flex items-center gap-1.5 pl-7">
          <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-primary" />
          </div>
          <span className="text-xs text-gray-500">Here is a draft exam...</span>
        </div>
      </div>
    </div>
  );
};

export default CreateExamCard;
