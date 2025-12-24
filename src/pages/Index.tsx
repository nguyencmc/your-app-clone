import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import DashboardPreview from "@/components/DashboardPreview";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import ProToolsSection from "@/components/ProToolsSection";
import FAQSection from "@/components/FAQSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <DashboardPreview />
      <FeaturesSection />
      <TestimonialsSection />
      <ProToolsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
