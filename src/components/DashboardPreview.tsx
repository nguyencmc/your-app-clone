import { 
  GraduationCap, 
  Home, 
  Play, 
  FileText, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Sparkles,
  BookOpen,
  ClipboardList,
  Calendar,
  TrendingUp,
  Star,
  Users,
  Upload,
  HelpCircle,
  Gauge,
  Crown
} from "lucide-react";

const DashboardPreview = () => {
  const sidebarItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Play, label: "Playground" },
    { icon: FileText, label: "Documentation" },
    { icon: MessageSquare, label: "Forum" },
    { icon: BarChart3, label: "Usage" },
    { icon: Settings, label: "Settings" },
  ];

  const featureCards = [
    {
      title: "Manage your courses",
      description: "Create and manage your courses and subjects",
      color: "from-teal-500/20 to-teal-500/5",
      icon: BookOpen,
    },
    {
      title: "Manage your exams",
      description: "Create, edit, and manage your examinations",
      color: "from-rose-500/20 to-rose-500/5",
      numbers: ["01", "02"],
    },
    {
      title: "Lesson planning",
      description: "Plan and organize your teaching materials",
      color: "from-amber-500/20 to-amber-500/5",
      icon: Calendar,
    },
    {
      title: "View exam analytics",
      description: "Analyze student performance and exam statistics",
      color: "from-purple-500/20 to-purple-500/5",
      grades: ["A", "B+"],
    },
    {
      title: "Grade Exams",
      description: "Grade exams efficiently with AI or manually.",
      color: "from-primary/20 to-primary/5",
      grades: ["A+", "B+", "A-"],
    },
    {
      title: "Student grades",
      description: "View and manage student grades",
      color: "from-cyan-500/20 to-cyan-500/5",
      icon: Users,
    },
    {
      title: "Course Files",
      description: "Upload and manage course materials",
      color: "from-orange-500/20 to-orange-500/5",
      fileTypes: ["PDF", "DOC", "PPT", "IMG"],
    },
    {
      title: "Tutorials",
      description: "Learn how to use ExamAi effectively",
      color: "from-green-500/20 to-green-500/5",
      icon: HelpCircle,
    },
    {
      title: "Usage",
      description: "Monitor your account usage and limits",
      color: "from-blue-500/20 to-blue-500/5",
      progress: 75,
    },
    {
      title: "Settings",
      description: "Manage your account preferences",
      color: "from-gray-500/20 to-gray-500/5",
      icon: Settings,
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="glass-card glow-card overflow-hidden rounded-2xl max-w-6xl mx-auto">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-56 bg-secondary/50 border-r border-border p-4 hidden md:block">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground">ExamAi</span>
                <span className="text-xs text-muted-foreground">v4.4</span>
              </div>
              
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded-full text-amber-400 text-xs font-medium mb-6">
                <Crown className="w-3 h-3" />
                Premium
              </div>

              <nav className="space-y-1">
                {sidebarItems.map((item, index) => (
                  <button
                    key={index}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                      item.active 
                        ? "bg-primary/10 text-primary" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
                
                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground mt-8">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </nav>

              <div className="mt-8 flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm text-foreground">Mr Professor</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gradient mb-2">Welcome back, Mr Professor</h2>
                <p className="text-muted-foreground">What would you like to do today?</p>
              </div>

              {/* Create Exam Card */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl p-6 relative overflow-hidden">
                  <h3 className="text-xl font-semibold text-gradient mb-2">Create Exam with AI</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Take a leap and create an exam with AI. It's fast, easy, and powerful.
                  </p>
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-background/80 rounded-lg text-sm font-medium text-foreground hover:bg-background transition-colors">
                    Create Exam
                    <Sparkles className="w-4 h-4 text-primary" />
                  </button>

                  {/* AI Chat bubble */}
                  <div className="absolute right-4 top-4 w-40 bg-card/90 rounded-lg p-3 border border-border/50 text-xs">
                    <div className="text-muted-foreground mb-1">AI Assistant</div>
                    <div className="text-foreground mb-2">Create a calculus exam</div>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      <span className="text-muted-foreground">Here is a draft exam...</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500/20 to-teal-500/5 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <BookOpen className="w-8 h-8 text-teal-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Manage your courses</h3>
                  <p className="text-sm text-muted-foreground">Create and manage your courses and subjects</p>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {featureCards.slice(1, 5).map((card, index) => (
                  <div 
                    key={index} 
                    className={`bg-gradient-to-br ${card.color} rounded-xl p-4 hover:scale-[1.02] transition-transform cursor-pointer`}
                  >
                    {card.numbers && (
                      <div className="flex gap-2 mb-3">
                        {card.numbers.map((num, i) => (
                          <span key={i} className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">{num}</span>
                        ))}
                      </div>
                    )}
                    {card.grades && (
                      <div className="flex gap-1 mb-3">
                        {card.grades.map((grade, i) => (
                          <span key={i} className="text-xs font-bold text-foreground bg-card/50 px-2 py-1 rounded">{grade}</span>
                        ))}
                      </div>
                    )}
                    {card.icon && (
                      <card.icon className="w-6 h-6 text-muted-foreground mb-3" />
                    )}
                    <h4 className="text-sm font-medium text-foreground mb-1">{card.title}</h4>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardPreview;
