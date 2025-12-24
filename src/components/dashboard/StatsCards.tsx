import { useState, useEffect } from "react";
import { FileText, Users, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const StatsCards = () => {
  const [totalExams, setTotalExams] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from("exams")
        .select("id, question_count");

      if (error) throw error;

      const examsCount = data?.length || 0;
      const questionsCount = data?.reduce((sum, exam) => sum + (exam.question_count || 0), 0) || 0;
      
      setTotalExams(examsCount);
      setTotalQuestions(questionsCount);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    {
      label: "Total Exams",
      value: isLoading ? "..." : totalExams.toString(),
      change: "+New",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Questions",
      value: isLoading ? "..." : totalQuestions.toString(),
      change: "Generated",
      icon: Users,
      color: "text-teal-400",
      bgColor: "bg-teal-400/10",
    },
    {
      label: "Avg Questions",
      value: isLoading ? "..." : (totalExams > 0 ? Math.round(totalQuestions / totalExams).toString() : "0"),
      change: "Per exam",
      icon: TrendingUp,
      color: "text-amber-400",
      bgColor: "bg-amber-400/10",
    },
    {
      label: "Time Saved",
      value: isLoading ? "..." : `${Math.round(totalQuestions * 2)}m`,
      change: "Estimated",
      icon: Clock,
      color: "text-rose-400",
      bgColor: "bg-rose-400/10",
    },
  ];

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
            <span className="text-xs text-muted-foreground font-medium">{stat.change}</span>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
          <p className="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
