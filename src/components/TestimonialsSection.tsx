import { useRef, useEffect } from "react";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  initial: string;
}

const TestimonialsSection = () => {
  const testimonials: Testimonial[] = [
    { name: "Sarah J.", role: "Physics Professor", quote: "ExamAi cut my grading time by 80%. It's magic.", initial: "S" },
    { name: "David M.", role: "Math Teacher", quote: "The AI understands complex calculus steps perfectly.", initial: "D" },
    { name: "Elena R.", role: "History Dept Head", quote: "Finally, a tool that respects academic integrity.", initial: "E" },
    { name: "James T.", role: "Chemistry Lecturer", quote: "My students love the instant feedback.", initial: "J" },
    { name: "Maria G.", role: "Biology Professor", quote: "Creating exams used to take days, now it's minutes.", initial: "M" },
    { name: "Robert L.", role: "Computer Science", quote: "The code grading capabilities are outstanding.", initial: "R" },
    { name: "Lisa K.", role: "English Teacher", quote: "Essay grading is nuanced and fair. Impressive.", initial: "L" },
    { name: "Michael B.", role: "Economics", quote: "Analytics help me spot learning gaps instantly.", initial: "M" },
  ];

  // Duplicate for infinite scroll effect
  const allTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
          🚀 Join the Revolution
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Trusted by 100,000+ Educators
        </h2>
        <p className="text-xl text-muted-foreground">
          From Ivy League universities to local high schools, teachers are reclaiming their time with ExamAi.
        </p>
      </div>

      {/* Scrolling testimonials */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        <div className="flex gap-4 testimonial-scroll">
          {allTestimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="flex-shrink-0 w-80 glass-card p-6 rounded-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {testimonial.initial}
                </div>
                <div>
                  <div className="font-medium text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-foreground italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
