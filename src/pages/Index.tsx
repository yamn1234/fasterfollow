import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import PlatformsSection from "@/components/PlatformsSection";
import ServicesSection from "@/components/ServicesSection";
import FeaturesSection from "@/components/FeaturesSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import { useHomepageSettings } from "@/hooks/useHomepageSettings";
import { Loader2 } from "lucide-react";

const sectionComponents: Record<string, React.ComponentType<any>> = {
  hero: HeroSection,
  features: FeaturesSection,
  services: ServicesSection,
  platforms: PlatformsSection,
  cta: CTASection,
};

const Index = () => {
  const { sections, heroSettings, siteSettings, loading } = useHomepageSettings();

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {sections.map((section) => {
          const Component = sectionComponents[section.id];
          if (!Component) return null;
          
          // Pass settings to Hero section
          if (section.id === 'hero') {
            return <Component key={section.id} settings={heroSettings} siteSettings={siteSettings} />;
          }
          
          return <Component key={section.id} />;
        })}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
