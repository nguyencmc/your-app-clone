import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Sparkles, Zap, Building2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useState } from "react";

type PlanKey = "free" | "premium" | "enterprise";

const Pricing = () => {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("premium");

  const plans = {
    free: {
      name: "Free",
      description: "Perfect for getting started with ExamAi. Try our basic features at no cost.",
      price: "$0",
      period: "forever",
      icon: Sparkles,
      highlight: null,
      features: [
        "5 exams per month",
        "Up to 20 questions per exam",
        "Basic AI generation",
        "Email support",
        "Export to PDF",
      ],
      cta: "Get Started",
      ctaLink: "/auth",
    },
    premium: {
      name: "Premium",
      description: "Best for professional educators who need advanced features and unlimited access.",
      price: "$19",
      period: "/month",
      icon: Zap,
      highlight: "All Free Features Plus:",
      features: [
        "Unlimited exams",
        "Unlimited questions",
        "Advanced AI generation",
        "AI grading assistant",
        "Priority support",
        "Custom branding",
        "Analytics dashboard",
        "Team collaboration",
      ],
      cta: "Start Free Trial",
      ctaLink: "/auth",
    },
    enterprise: {
      name: "Enterprise",
      description: "Complete solution for educational institutions. Contact us for custom pricing.",
      price: "Custom",
      period: "",
      icon: Building2,
      highlight: "All Premium Features Plus:",
      features: [
        "Canvas Integration",
        "Custom University Portal",
        "Custom Analytics and Reporting",
        "Student-Professor Messaging System",
        "Announcements and Updates Platform",
        "Department-Level Scanning Equipment",
        "Dedicated Support Team",
        "Custom Features Development",
      ],
      cta: "Contact Sales",
      ctaLink: "/#contact",
    },
  };

  const currentPlan = plans[selectedPlan];
  const Icon = currentPlan.icon;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-gradient mb-3">
              ExamAI Pricing
            </h1>
            <p className="text-muted-foreground">
              Choose your plan
            </p>
            <div className="w-16 h-1 bg-primary mx-auto mt-4 rounded-full" />
          </div>

          {/* Plan Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-1 p-1.5 bg-muted/50 rounded-full border border-border/50">
              {(Object.keys(plans) as PlanKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedPlan === key
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {plans[key].name}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Plan Card */}
          <div className="max-w-lg mx-auto mb-12">
            <Card 
              key={selectedPlan}
              className="bg-card/80 backdrop-blur-sm border-border/50 overflow-hidden animate-fade-in"
            >
              <CardContent className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '50ms' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xl font-semibold text-primary">
                      {currentPlan.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-foreground">
                      {currentPlan.price}
                    </span>
                    {currentPlan.period && (
                      <span className="text-sm text-muted-foreground">
                        {currentPlan.period}
                      </span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="bg-muted/30 rounded-lg p-4 border border-border/30 animate-fade-in" style={{ animationDelay: '100ms' }}>
                  <p className="text-sm text-muted-foreground">
                    {currentPlan.description}
                  </p>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  {currentPlan.highlight && (
                    <p className="text-sm font-semibold text-primary animate-fade-in" style={{ animationDelay: '150ms' }}>
                      {currentPlan.highlight}
                    </p>
                  )}
                  <ul className="space-y-3">
                    {currentPlan.features.map((feature, i) => (
                      <li 
                        key={i} 
                        className="flex items-center gap-3 text-sm animate-fade-in"
                        style={{ animationDelay: `${200 + i * 50}ms` }}
                      >
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <Button 
                  className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium animate-fade-in"
                  style={{ animationDelay: '400ms' }}
                  asChild
                >
                  <Link to={currentPlan.ctaLink} className="flex items-center justify-center gap-2">
                    <Icon className="w-4 h-4" />
                    {currentPlan.cta}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Terms */}
            <p className="text-center text-xs text-muted-foreground mt-6">
              By selecting a plan, you agree to our{" "}
              <Link to="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>

          {/* FAQ Section */}
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-center text-foreground mb-6">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-4">
              {[
                {
                  question: "Can I switch plans later?",
                  answer: "Yes, you can upgrade or downgrade your plan at any time.",
                },
                {
                  question: "Is there a free trial?",
                  answer: "Yes, Premium plan comes with a 14-day free trial.",
                },
                {
                  question: "Can I cancel anytime?",
                  answer: "Absolutely! No hidden fees or long-term commitments.",
                },
              ].map((faq, index) => (
                <Card key={index} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-foreground mb-1">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
