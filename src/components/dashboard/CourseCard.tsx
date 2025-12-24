import { BookOpen } from "lucide-react";

const CourseCard = () => {
  return (
    <div className="bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/20 hover:border-teal-500/40 rounded-xl p-6 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <BookOpen className="w-8 h-8 text-teal-400" />
        <span className="text-xs text-teal-400 bg-teal-400/10 px-2 py-1 rounded-full">3 courses</span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">Manage your courses</h3>
      <p className="text-sm text-muted-foreground">Create and manage your courses and subjects</p>
    </div>
  );
};

export default CourseCard;
