import { useNavigate } from "react-router-dom";
import {
  FileText,
  BookOpen,
  BarChart3,
  Zap,
  Users,
  FolderOpen,
  Play,
  Settings,
  LucideIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeatureCard {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  illustration: "exams" | "lessons" | "analytics" | "grade" | "students" | "files" | "tutorials" | "usage" | "settings";
  route?: string;
  action?: string;
}

const featureCards: FeatureCard[] = [
  {
    title: "Manage your exams",
    description: "Create, edit, and manage your examinations",
    icon: FileText,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted/50",
    illustration: "exams",
    route: "/dashboard/exams",
  },
  {
    title: "Lesson planning",
    description: "Plan and organize your teaching materials",
    icon: BookOpen,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    illustration: "lessons",
    route: "/dashboard/courses",
  },
  {
    title: "View exam analytics",
    description: "Analyze student performance and exam statistics",
    icon: BarChart3,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-400/10",
    illustration: "analytics",
    route: "/dashboard/usage",
  },
  {
    title: "Grade Exams",
    description: "Grade exams efficiently with AI assistance or manual tools.",
    icon: Zap,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10",
    illustration: "grade",
    action: "grade-exams",
  },
  {
    title: "Student grades",
    description: "View and manage student grades",
    icon: Users,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    illustration: "students",
    route: "/dashboard/usage",
  },
  {
    title: "Course Files",
    description: "Upload and manage course materials",
    icon: FolderOpen,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    illustration: "files",
    route: "/dashboard/courses",
  },
  {
    title: "Tutorials",
    description: "Learn how to use ExamAi effectively",
    icon: Play,
    iconColor: "text-rose-400",
    iconBg: "bg-rose-400/10",
    illustration: "tutorials",
    route: "/dashboard/documentation",
  },
  {
    title: "Usage",
    description: "Monitor your account usage and limits",
    icon: Zap,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/10",
    illustration: "usage",
    route: "/dashboard/usage",
  },
  {
    title: "Settings",
    description: "Manage your account preferences",
    icon: Settings,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted/50",
    illustration: "settings",
    route: "/dashboard/settings",
  },
];

const ExamsIllustration = () => (
  <div className="w-full h-24 flex items-center justify-center">
    <div className="w-32 bg-muted/30 rounded-lg p-3 border border-border/30">
      <div className="w-12 h-1.5 bg-primary/30 rounded mb-2" />
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />
          <div className="flex-1 h-1.5 bg-muted-foreground/20 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />
          <div className="flex-1 h-1.5 bg-muted-foreground/20 rounded" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />
          <div className="flex-1 h-1.5 bg-muted-foreground/20 rounded" />
        </div>
      </div>
    </div>
  </div>
);

const LessonsIllustration = () => (
  <div className="w-full h-24 flex items-center justify-center">
    <div className="space-y-2">
      <div className="flex items-center gap-2 bg-teal-500/20 rounded-lg px-3 py-1.5">
        <span className="text-xs font-mono text-teal-400 bg-teal-500/30 px-1.5 py-0.5 rounded">01</span>
        <div className="w-20 h-2 bg-primary/40 rounded" />
      </div>
      <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-3 py-1.5">
        <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">02</span>
        <div className="w-16 h-2 bg-muted-foreground/30 rounded" />
      </div>
    </div>
  </div>
);

const AnalyticsIllustration = () => (
  <div className="w-full h-24 flex items-end justify-center gap-3 pb-2">
    <div className="w-10 h-12 bg-orange-400/30 rounded-t-sm" />
    <div className="w-10 h-16 bg-orange-400/50 rounded-t-sm" />
    <div className="w-10 h-20 bg-orange-400 rounded-t-sm" />
  </div>
);

const GradeIllustration = () => (
  <div className="w-full h-24 flex items-center justify-center">
    <div className="relative">
      <div className="w-20 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-lg shadow-lg transform -rotate-6 absolute -left-4">
        <div className="p-2">
          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold text-green-600 dark:text-green-400 absolute bottom-2 right-2">A</div>
        </div>
      </div>
      <div className="w-20 h-24 bg-amber-50 dark:bg-amber-900/20 rounded-lg shadow-lg transform rotate-3 relative">
        <div className="p-2">
          <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 absolute bottom-2 right-2">B+</div>
        </div>
      </div>
    </div>
  </div>
);

const StudentsIllustration = () => (
  <div className="w-full h-24 flex items-center justify-center">
    <div className="bg-muted/30 rounded-lg p-3 border border-border/30">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-primary/40 rounded" />
          <span className="text-[10px] font-bold text-green-500 bg-green-500/20 px-1.5 py-0.5 rounded">A+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-rose-400/40 rounded" />
          <span className="text-[10px] font-bold text-blue-500 bg-blue-500/20 px-1.5 py-0.5 rounded">B+</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-12 h-2 bg-muted-foreground/30 rounded" />
          <span className="text-[10px] font-bold text-orange-500 bg-orange-500/20 px-1.5 py-0.5 rounded">A-</span>
        </div>
      </div>
    </div>
  </div>
);

const FilesIllustration = () => (
  <div className="w-full h-24 flex items-center justify-center gap-2">
    <div className="w-10 h-12 bg-red-500/20 rounded flex items-center justify-center">
      <span className="text-[8px] font-bold text-red-500">PDF</span>
    </div>
    <div className="w-10 h-12 bg-blue-500/20 rounded flex items-center justify-center">
      <span className="text-[8px] font-bold text-blue-500">DOC</span>
    </div>
    <div className="w-10 h-12 bg-orange-500/20 rounded flex items-center justify-center">
      <span className="text-[8px] font-bold text-orange-500">PPT</span>
    </div>
    <div className="w-10 h-12 bg-teal-500/20 rounded flex items-center justify-center">
      <span className="text-[8px] font-bold text-teal-500">IMG</span>
    </div>
  </div>
);

const TutorialsIllustration = () => (
  <div className="w-full h-24 flex items-center justify-center">
    <div className="w-28 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-lg flex items-center justify-center">
      <div className="w-10 h-10 rounded-full bg-rose-400/30 flex items-center justify-center">
        <Play className="w-5 h-5 text-rose-500 fill-rose-500" />
      </div>
    </div>
  </div>
);

const UsageIllustration = () => (
  <div className="w-full h-24 flex items-center justify-center">
    <div className="relative w-20 h-20">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted/30"
        />
        <circle
          cx="18"
          cy="18"
          r="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="66 100"
          className="text-amber-400"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-foreground">75%</span>
        <span className="text-[8px] text-muted-foreground">USED</span>
      </div>
    </div>
  </div>
);

const SettingsIllustration = () => (
  <div className="w-full h-24 flex items-center justify-center">
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-4 bg-muted/50 rounded-full flex items-center px-0.5">
          <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="w-16 h-2 bg-muted-foreground/20 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-4 bg-primary/30 rounded-full flex items-center justify-end px-0.5">
          <div className="w-3 h-3 rounded-full bg-primary" />
        </div>
        <div className="w-20 h-2 bg-muted-foreground/20 rounded" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-4 bg-muted/50 rounded-full flex items-center px-0.5">
          <div className="w-3 h-3 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="w-14 h-2 bg-muted-foreground/20 rounded" />
      </div>
    </div>
  </div>
);

const getIllustration = (type: FeatureCard["illustration"]) => {
  switch (type) {
    case "exams":
      return <ExamsIllustration />;
    case "lessons":
      return <LessonsIllustration />;
    case "analytics":
      return <AnalyticsIllustration />;
    case "grade":
      return <GradeIllustration />;
    case "students":
      return <StudentsIllustration />;
    case "files":
      return <FilesIllustration />;
    case "tutorials":
      return <TutorialsIllustration />;
    case "usage":
      return <UsageIllustration />;
    case "settings":
      return <SettingsIllustration />;
    default:
      return null;
  }
};

const FeatureCards = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCardClick = (card: FeatureCard) => {
    if (card.route) {
      navigate(card.route);
    } else if (card.action === "grade-exams") {
      toast({
        title: "Chấm điểm bài thi",
        description: "Vui lòng chọn bài thi từ danh sách Exams để chấm điểm.",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {featureCards.map((card, index) => (
        <div
          key={index}
          onClick={() => handleCardClick(card)}
          className="bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 rounded-xl p-4 hover:scale-[1.02] transition-all cursor-pointer group"
        >
          {/* Illustration */}
          {getIllustration(card.illustration)}

          {/* Content */}
          <div className="flex items-start gap-3 mt-2">
            <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
              <card.icon className={`w-4 h-4 ${card.iconColor}`} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-0.5">{card.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;
