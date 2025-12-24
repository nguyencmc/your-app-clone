import { Mail, MessageCircle, Video, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ContactSection = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      subtitle: "hello@examai.ai",
      color: "from-red-500/20 to-red-500/5",
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
    },
    {
      icon: MessageCircle,
      title: "Chat With Us",
      subtitle: "Start a Chat",
      color: "from-green-500/20 to-green-500/5",
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
    },
    {
      icon: Video,
      title: "Book a Demo",
      subtitle: "Schedule Now",
      color: "from-blue-500/20 to-blue-500/5",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
    },
  ];

  return (
    <section className="py-24 relative" id="contact">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-xl text-muted-foreground">
            Have questions or need support? We're here to help!
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((method, index) => (
              <a
                key={index}
                href="#"
                className={`glass-card glow-card p-6 rounded-2xl bg-gradient-to-br ${method.color} group cursor-pointer`}
              >
                <div className={`w-12 h-12 rounded-xl ${method.iconBg} flex items-center justify-center mb-4`}>
                  <method.icon className={`w-6 h-6 ${method.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{method.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{method.subtitle}</span>
                  <span className="text-muted-foreground group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>
            ))}
          </div>

          {/* Contact Form */}
          <div className="glass-card glow-card p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-foreground mb-6">Send Us a Message</h3>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Your Name <span className="text-destructive">*</span>
                  </label>
                  <Input 
                    placeholder="John Doe" 
                    className="bg-secondary/50 border-border/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Your Email <span className="text-destructive">*</span>
                  </label>
                  <Input 
                    type="email" 
                    placeholder="john@school.edu" 
                    className="bg-secondary/50 border-border/50 focus:border-primary"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Institution (Optional)
                </label>
                <Input 
                  placeholder="University / School name" 
                  className="bg-secondary/50 border-border/50 focus:border-primary"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Your Message <span className="text-destructive">*</span>
                </label>
                <Textarea 
                  placeholder="How can we help you?" 
                  rows={4}
                  className="bg-secondary/50 border-border/50 focus:border-primary resize-none"
                />
              </div>
              
              <Button variant="hero" size="lg" className="w-full md:w-auto">
                Send Message
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
