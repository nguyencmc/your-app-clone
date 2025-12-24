import { FileText, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

const recentExams = [
  {
    name: "Calculus Midterm",
    subject: "Mathematics",
    date: "Dec 20, 2024",
    students: 32,
    avgScore: 78,
  },
  {
    name: "Physics Final",
    subject: "Science",
    date: "Dec 18, 2024",
    students: 28,
    avgScore: 82,
  },
  {
    name: "History Quiz",
    subject: "Social Studies",
    date: "Dec 15, 2024",
    students: 45,
    avgScore: 71,
  },
];

const RecentExams = () => {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Exams</h3>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          View all
        </Button>
      </div>
      
      <div className="space-y-3">
        {recentExams.map((exam, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-secondary/30 hover:bg-secondary/50 rounded-lg transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{exam.name}</p>
                <p className="text-xs text-muted-foreground">{exam.subject} • {exam.date}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-foreground">{exam.students} students</p>
                <p className="text-xs text-muted-foreground">Avg: {exam.avgScore}%</p>
              </div>
              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentExams;
