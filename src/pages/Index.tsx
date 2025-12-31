import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PlatformsSection from "@/components/PlatformsSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { sections, heroSettings, siteSettings, featuresSettings, ctaSettings, loading } = useHomepageSettings();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return <HeroSection key="hero" settings={heroSettings} siteSettings={siteSettings} />;
      case 'features':
        return <FeaturesSection key="features" settings={featuresSettings} />;
      case 'services':
        return <ServicesSection key="services" />;
      case 'platforms':
        return <PlatformsSection key="platforms" />;
      case 'cta':
        return <CTASection key="cta" settings={ctaSettings} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {sections.map((section) => renderSection(section.id))}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
