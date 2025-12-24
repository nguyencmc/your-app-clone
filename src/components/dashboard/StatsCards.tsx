import { FileText, Users, TrendingUp, Clock } from "lucide-react";

const stats = [
  {
    label: "Total Exams",
    value: "24",
    change: "+12%",
    icon: FileText,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Students",
    value: "156",
    change: "+8%",
    icon: Users,
    color: "text-teal-400",
    bgColor: "bg-teal-400/10",
  },
  {
    label: "Avg Score",
    value: "78%",
    change: "+5%",
    icon: TrendingUp,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  {
    label: "Time Saved",
    value: "48h",
    change: "This month",
    icon: Clock,
    color: "text-rose-400",
    bgColor: "bg-rose-400/10",
  },
];

const StatsCards = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <span className="text-xs text-green-400 font-medium">{stat.change}</span>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
