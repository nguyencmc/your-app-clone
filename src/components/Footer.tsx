import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ExamAi</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Support</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2024 ExamAi. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
