import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection = () => {
  const faqs = [
    {
      icon: "🎓",
      question: "What is ExamAI?",
      answer: "ExamAI is an AI-powered assessment platform that helps educators create exams, grade submissions automatically, and gain insights through analytics. Save 95% of grading time while maintaining quality.",
    },
    {
      icon: "💰",
      question: "How much does it cost?",
      answer: "ExamAI offers a free tier with 5 AI question generations, 60 gradings, 15 polishing, and 10 images per month. Premium is $19/month for unlimited usage. Enterprise plans available for institutions.",
    },
    {
      icon: "✨",
      question: "Can I try it for free?",
      answer: "Yes! Sign up for a free account and get instant access to our free tier. No credit card required. You can upgrade to Premium anytime for unlimited features.",
    },
    {
      icon: "🔗",
      question: "Does it work with Canvas LMS?",
      answer: "Yes! ExamAI integrates seamlessly with Canvas. Import your roster via CSV export, and export grades directly back to Canvas gradebook. Works with all major LMS platforms.",
    },
    {
      icon: "🎯",
      question: "How accurate is the AI grading?",
      answer: "Our AI follows your custom rubrics exactly and provides consistent, unbiased grading. You maintain full control - review and adjust any grade before releasing to students. Most educators report 95%+ satisfaction with AI accuracy.",
    },
    {
      icon: "✍️",
      question: "Can it grade handwritten exams?",
      answer: "Absolutely! Upload scanned paper exams (up to 12,000 pages) and our AI reads handwriting accurately. Use QR codes for automatic student identification. Same quality feedback as online exams.",
    },
  ];

  return (
    <section className="py-24 relative" id="faq">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Common Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about ExamAI
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="glass-card rounded-xl border-none px-6"
              >
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-xl">{faq.icon}</span>
                    <span className="text-foreground font-medium">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center mt-8">
            <button className="text-primary hover:text-primary/80 font-medium transition-colors">
              View All 40+ FAQs
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
