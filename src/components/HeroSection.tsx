import { GraduationCap, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Aurora background effect - enhanced purple glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-purple-500/30 via-purple-600/20 to-transparent blur-3xl opacity-60" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-b from-violet-500/25 to-transparent blur-2xl opacity-50" />
      </div>
      <div className="aurora-glow" />
      
      {/* Floating document cards */}
      <div className="floating-card left-[5%] top-1/4 w-24 h-16 flex items-center gap-2 px-3 animate-float opacity-60">
        <FileText className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1 space-y-1">
          <div className="h-2 bg-muted rounded w-full" />
          <div className="h-2 bg-muted rounded w-3/4" />
        </div>
      </div>
      
      <div className="floating-card right-[5%] top-1/4 w-24 h-16 flex items-center gap-2 px-3 animate-float-delayed opacity-60">
        <FileText className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1 space-y-1">
          <div className="h-2 bg-muted rounded w-full" />
          <div className="h-2 bg-muted rounded w-3/4" />
        </div>
      </div>
      
      <div className="floating-card left-[10%] bottom-1/3 w-24 h-16 flex items-center gap-2 px-3 animate-float-delayed opacity-40">
        <FileText className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1 space-y-1">
          <div className="h-2 bg-muted rounded w-full" />
          <div className="h-2 bg-muted rounded w-2/3" />
        </div>
      </div>
      
      <div className="floating-card right-[10%] bottom-1/3 w-24 h-16 flex items-center gap-2 px-3 animate-float opacity-40">
        <FileText className="w-5 h-5 text-muted-foreground" />
        <div className="flex-1 space-y-1">
          <div className="h-2 bg-muted rounded w-full" />
          <div className="h-2 bg-muted rounded w-2/3" />
        </div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <GraduationCap className="w-7 h-7 text-primary-foreground" />
          </div>
          <span className="text-3xl font-bold text-gradient">ExamAi</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-8 max-w-4xl mx-auto leading-tight">
          AI Grading for Schools
        </h1>

        {/* Live users badge */}
        <div className="inline-flex items-center gap-4 glass-card px-5 py-3 mb-8">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-green-400">LIVE</span>
          </div>
          
          <div className="flex -space-x-2">
            {[45, 46, 47, 48].map((seed) => (
              <img
                key={seed}
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`}
                alt="User"
                className="w-8 h-8 rounded-full border-2 border-background"
              />
            ))}
          </div>
          
          <div className="text-left">
            <div className="text-lg font-bold text-foreground">50,000+</div>
            <div className="text-xs text-muted-foreground">Users active in the last 24h</div>
          </div>
          
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          AI-powered lesson planning, assessments, and grading.
          <br />
          So you can focus on teaching.
        </p>

        {/* CTA Button */}
        <Button variant="hero" size="xl" className="group">
          Start for Free
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
