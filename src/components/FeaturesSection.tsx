import { Sparkles, Calendar, Upload, MessageSquare, Zap, Brain } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      tag: "Magic Grading",
      title: "Let AI do the grading",
      description: "Set your rubrics and relax. ExamAi handles homework, exams, and handwriting.",
      icon: Sparkles,
      content: (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">JD</div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm font-bold mb-2">A+</div>
            <div className="text-xs text-muted-foreground">AI Feedback</div>
            <div className="text-sm text-foreground italic">"Great cell diagram! Mitochondria correctly labeled. Consider adding the cell membrane..."</div>
          </div>
        </div>
      ),
    },
    {
      tag: "Smart Planning",
      title: "A semester in minutes",
      description: "Plan your entire curriculum in any format you like.",
      icon: Calendar,
      content: (
        <div className="space-y-2">
          <div className="flex gap-2">
            {["Week 1", "Week 2", "Week 3"].map((week, i) => (
              <div key={i} className={`px-3 py-2 rounded-lg text-xs font-medium ${i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {week}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Generating lesson plan...
          </div>
        </div>
      ),
    },
    {
      tag: "Instant Assessments",
      title: "Create assessments in a flash",
      description: "Upload your book, notebook photos, or whiteboard snaps. We'll handle the rest.",
      icon: Upload,
      content: (
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center text-xs text-muted-foreground">
            Textbook / Notes
          </div>
          <div className="text-2xl text-muted-foreground">→</div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm font-bold">A+</div>
            <div className="text-xs text-muted-foreground">1. Question...</div>
            <div className="text-xs text-muted-foreground">2. Question...</div>
            <div className="text-xs text-muted-foreground">3. Question...</div>
          </div>
        </div>
      ),
    },
    {
      tag: "Student Growth",
      title: "Feedback they'll actually love",
      description: "Detailed, instant feedback meant for learning, not just grading.",
      icon: MessageSquare,
      content: (
        <div className="space-y-3">
          <div className="text-2xl">🤩</div>
          <div className="text-sm text-foreground italic">"Great job connecting the historical context to the modern implications! Try to expand on..."</div>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Insightful</span>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Encouraging</span>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Reimagine Your Workflow
          </h2>
          <p className="text-xl text-muted-foreground">
            More than just tools. It's a whole new way to experience teaching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="glass-card glow-card p-6 rounded-2xl group"
            >
              <div className="flex items-center gap-2 mb-4">
                <feature.icon className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">{feature.tag}</span>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-6">{feature.description}</p>
              
              <div className="bg-secondary/50 rounded-xl p-4">
                {feature.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
