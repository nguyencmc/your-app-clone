import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  Users,
  HelpCircle,
  Settings,
  Upload,
  BarChart3,
  ClipboardCheck,
  LucideIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeatureCard {
  title: string;
  description: string;
  color: string;
  borderColor: string;
  numbers?: string[];
  grades?: string[];
  fileTypes?: string[];
  icon?: LucideIcon;
  route?: string;
  action?: string;
}

const featureCards: FeatureCard[] = [
  {
    title: "Manage your exams",
    description: "Create, edit, and manage your examinations",
    color: "from-rose-500/20 to-rose-500/5",
    borderColor: "hover:border-rose-500/30",
    numbers: ["01", "02", "03"],
    route: "/dashboard/exams",
  },
  {
    title: "Lesson planning",
    description: "Plan and organize your teaching materials",
    color: "from-amber-500/20 to-amber-500/5",
    borderColor: "hover:border-amber-500/30",
    icon: Calendar,
    route: "/dashboard/courses",
  },
  {
    title: "View exam analytics",
    description: "Analyze student performance and exam statistics",
    color: "from-purple-500/20 to-purple-500/5",
    borderColor: "hover:border-purple-500/30",
    grades: ["A", "B+", "A-"],
    route: "/dashboard/usage",
  },
  {
    title: "Grade Exams",
    description: "Grade exams efficiently with AI or manually",
    color: "from-primary/20 to-primary/5",
    borderColor: "hover:border-primary/30",
    grades: ["A+", "B+", "A-"],
    action: "grade-exams",
  },
  {
    title: "Student grades",
    description: "View and manage student grades",
    color: "from-cyan-500/20 to-cyan-500/5",
    borderColor: "hover:border-cyan-500/30",
    icon: Users,
    route: "/dashboard/usage",
  },
  {
    title: "Course Files",
    description: "Upload and manage course materials",
    color: "from-orange-500/20 to-orange-500/5",
    borderColor: "hover:border-orange-500/30",
    fileTypes: ["PDF", "DOC", "PPT", "IMG"],
    route: "/dashboard/courses",
  },
  {
    title: "Tutorials",
    description: "Learn how to use ExamAi effectively",
    color: "from-green-500/20 to-green-500/5",
    borderColor: "hover:border-green-500/30",
    icon: HelpCircle,
    route: "/dashboard/documentation",
  },
  {
    title: "Settings",
    description: "Manage your account preferences",
    color: "from-gray-500/20 to-gray-500/5",
    borderColor: "hover:border-gray-400/30",
    icon: Settings,
    route: "/dashboard/settings",
  },
];

const FeatureCards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCardClick = (card: FeatureCard) => {
    if (card.route) {
      navigate(card.route);
    } else if (card.action === "grade-exams") {
      toast({
        title: "Chấm điểm bài thi",
        description: "Vui lòng chọn bài thi từ danh sách Recent Exams để chấm điểm.",
      });
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {featureCards.map((card, index) => (
        <div
          key={index}
          onClick={() => handleCardClick(card)}
          className={`bg-gradient-to-br ${card.color} border border-border/50 ${card.borderColor} rounded-xl p-4 hover:scale-[1.02] transition-all cursor-pointer group`}
        >
          {card.numbers && (
            <div className="flex gap-2 mb-3">
              {card.numbers.map((num, i) => (
                <span
                  key={i}
                  className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded"
                >
                  {num}
                </span>
              ))}
            </div>
          )}
          {card.grades && (
            <div className="flex gap-1 mb-3">
              {card.grades.map((grade, i) => (
                <span
                  key={i}
                  className="text-xs font-bold text-foreground bg-card/50 px-2 py-1 rounded"
                >
                  {grade}
                </span>
              ))}
            </div>
          )}
          {card.fileTypes && (
            <div className="flex gap-1 mb-3 flex-wrap">
              {card.fileTypes.map((type, i) => (
                <span
                  key={i}
                  className="text-[10px] font-medium text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded"
                >
                  {type}
                </span>
              ))}
            </div>
          )}
          {card.icon && (
            <card.icon className="w-6 h-6 text-muted-foreground mb-3 group-hover:text-foreground transition-colors" />
          )}
          <h4 className="text-sm font-medium text-foreground mb-1">{card.title}</h4>
          <p className="text-xs text-muted-foreground">{card.description}</p>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;