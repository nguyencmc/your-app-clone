import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      description: "Perfect for getting started",
      price: "$0",
      period: "forever",
      icon: Sparkles,
      color: "from-gray-500/20 to-gray-500/5",
      borderColor: "border-border/50",
      features: [
        "5 exams per month",
        "Up to 20 questions per exam",
        "Basic AI generation",
        "Email support",
        "Export to PDF",
      ],
      cta: "Get Started",
      ctaVariant: "outline" as const,
    },
    {
      name: "Premium",
      description: "Best for professional educators",
      price: "$19",
      period: "/month",
      icon: Zap,
      color: "from-primary/20 to-primary/5",
      borderColor: "border-primary/50",
      popular: true,
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
      ctaVariant: "default" as const,
    },
    {
      name: "Enterprise",
      description: "For schools and institutions",
      price: "Custom",
      period: "",
      icon: Building2,
      color: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/50",
      features: [
        "Everything in Premium",
        "Unlimited team members",
        "SSO integration",
        "Dedicated account manager",
        "Custom AI training",
        "API access",
        "99.9% uptime SLA",
        "On-premise deployment",
      ],
      cta: "Contact Sales",
      ctaVariant: "outline" as const,
    },
  ];

  const faqs = [
    {
      question: "Can I switch plans later?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes, Premium plan comes with a 14-day free trial. No credit card required.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.",
    },
    {
      question: "Can I cancel anytime?",
      answer: "Absolutely! You can cancel your subscription at any time with no hidden fees.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="secondary" className="mb-4">
              Simple, transparent pricing
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gradient mb-4">
              Choose the right plan for you
            </h1>
            <p className="text-lg text-muted-foreground">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative bg-gradient-to-br ${plan.color} ${plan.borderColor} overflow-hidden transition-transform hover:scale-[1.02]`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center mb-4">
                    <plan.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    variant={plan.ctaVariant} 
                    className="w-full"
                    asChild
                  >
                    <Link to="/auth">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center text-foreground mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="glass-card">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                    <p className="text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-20">
            <Card className="bg-gradient-to-r from-primary/20 to-primary/5 border-primary/20 max-w-2xl mx-auto">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Ready to get started?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Join thousands of educators who are already using ExamAi
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" asChild>
                    <Link to="/auth">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/#contact">Contact Sales</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
