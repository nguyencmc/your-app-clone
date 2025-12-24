import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { GraduationCap, ChevronDown, Home, Newspaper, DollarSign, Globe, FileText, HelpCircle, BookOpen } from "lucide-react";

const Navbar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">ExamAi</span>
          </Link>

          {/* Navigation Links */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="/" className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <Home className="w-4 h-4" />
                    Home
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground bg-transparent">
                  <FileText className="w-4 h-4" />
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-card border border-border rounded-xl p-4 min-w-[300px]">
                  <div className="grid gap-3">
                    <Link to="#" className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Create Exams</div>
                        <div className="text-sm text-muted-foreground">AI-powered exam generation</div>
                      </div>
                    </Link>
                    <Link to="#" className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Grade Exams</div>
                        <div className="text-sm text-muted-foreground">Automatic AI grading</div>
                      </div>
                    </Link>
                    <Link to="#" className="flex items-center gap-3 p-2 hover:bg-secondary rounded-lg transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">Lesson Planning</div>
                        <div className="text-sm text-muted-foreground">Plan your curriculum</div>
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground bg-transparent">
                  <Newspaper className="w-4 h-4" />
                  Blogs
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-card border border-border rounded-xl p-4 min-w-[200px]">
                  <div className="grid gap-2">
                    <Link to="#" className="p-2 hover:bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Latest Posts
                    </Link>
                    <Link to="#" className="p-2 hover:bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Tutorials
                    </Link>
                    <Link to="#" className="p-2 hover:bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Case Studies
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link to="#pricing" className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <DollarSign className="w-4 h-4" />
                    Pricing
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground bg-transparent">
                  <HelpCircle className="w-4 h-4" />
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-card border border-border rounded-xl p-4 min-w-[200px]">
                  <div className="grid gap-2">
                    <Link to="#" className="p-2 hover:bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Documentation
                    </Link>
                    <Link to="#" className="p-2 hover:bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Help Center
                    </Link>
                    <Link to="#" className="p-2 hover:bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Community
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground bg-transparent">
                  <Globe className="w-4 h-4" />
                  English
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-card border border-border rounded-xl p-4 min-w-[150px]">
                  <div className="grid gap-2">
                    <button className="p-2 hover:bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                      English
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                      Tiếng Việt
                    </button>
                    <button className="p-2 hover:bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors text-left">
                      Español
                    </button>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="hidden md:inline-flex text-muted-foreground hover:text-foreground">
              Log in
            </Button>
            <Button variant="navCta" size="sm">
              Sign up
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
