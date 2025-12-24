import { Zap, FileText, BarChart3, Sparkles, GraduationCap } from "lucide-react";

const ProToolsSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Pro-grade tools.<span className="text-gradient">Zero complexity.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Lightning Fast */}
          <div className="glass-card glow-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium text-foreground">Lightning Fast</span>
            </div>
            <p className="text-muted-foreground mb-4">Faster and more accurate than any AI.</p>
            
            <div className="bg-secondary/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Save Hours Weekly</h4>
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 rounded text-amber-400 text-xs font-medium mb-3">
                ⚡ Fast
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lesson Planning</span>
                  <span className="text-foreground font-medium">2 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Exam Creation</span>
                  <span className="text-foreground font-medium">3 min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grade 30 Exams</span>
                  <span className="text-foreground font-medium">&lt; 1 min</span>
                </div>
              </div>
            </div>
          </div>

          {/* Instant Rubrics */}
          <div className="glass-card glow-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Instant Rubrics</span>
            </div>
            <p className="text-muted-foreground mb-4">Generate standardized rubrics in seconds.</p>
            
            <div className="bg-secondary/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-foreground">Math Rubric</h4>
                <span className="text-lg font-bold text-foreground">50 Pts</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Correct Answer</span>
                  <span className="text-foreground">20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Work Shown</span>
                  <span className="text-foreground">15</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Method Used</span>
                  <span className="text-foreground">15</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-green-400">
                <span>Auto-generated</span>
                <span>✓ Ready</span>
              </div>
            </div>
          </div>

          {/* Deep Insights */}
          <div className="glass-card glow-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-foreground">Deep Insights</span>
            </div>
            <p className="text-muted-foreground mb-4">Spot learning gaps instantly.</p>
            
            <div className="bg-secondary/50 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Hardest Questions</h4>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-red-500/20 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: "32%" }} />
                  </div>
                  <span className="text-muted-foreground text-xs">Q7: Integration 32%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-orange-500/20 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: "45%" }} />
                  </div>
                  <span className="text-muted-foreground text-xs">Q12: Derivatives 45%</span>
                </div>
              </div>
              <h4 className="text-sm font-semibold text-foreground mb-2">Common Gaps</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Chain Rule</span>
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Limits</span>
                <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">U-Sub</span>
              </div>
            </div>
          </div>

          {/* Magic Grading */}
          <div className="glass-card glow-card p-6 rounded-2xl lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Magic Grading</span>
            </div>
            <p className="text-muted-foreground mb-4">Snap a photo. Let AI analyze and grade drawings instantly.</p>
            
            <div className="bg-secondary/50 rounded-xl p-4 flex flex-col md:flex-row gap-4">
              <div className="w-32 h-32 bg-card rounded-lg flex items-center justify-center border border-border">
                <div className="text-center">
                  <div className="text-3xl mb-1">🧬</div>
                  <div className="text-xs text-muted-foreground">Cell diagram</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-foreground mb-2">AI Feedback</div>
                <p className="text-sm text-muted-foreground mb-2">
                  "Great work! The mitochondria is correctly placed inside the cell."
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  The nucleus is also properly labeled. Consider adding the cell membrane label.
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 font-medium">Excellent</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-bold">4/5 Points</span>
                </div>
              </div>
            </div>
          </div>

          {/* Education-First AI */}
          <div className="glass-card glow-card p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Education-First AI</span>
            </div>
            <p className="text-muted-foreground mb-4">Built with Stanford & MIT guidance.</p>
            
            <div className="bg-secondary/50 rounded-xl p-4 flex justify-center gap-4">
              <div className="px-4 py-2 bg-primary/20 rounded-lg text-primary text-sm font-medium">Exams</div>
              <div className="px-4 py-2 bg-primary/20 rounded-lg text-primary text-sm font-medium">Grading</div>
              <div className="px-4 py-2 bg-primary/20 rounded-lg text-primary text-sm font-medium">Lessons</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProToolsSection;
