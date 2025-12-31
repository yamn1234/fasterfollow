import { Button } from "@/components/ui/button";
import { ArrowLeft, Gift, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface CTASettings {
  badge_text: string;
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  button_link: string;
}

interface CTASectionProps {
  settings?: CTASettings;
}

const CTASection = ({ settings }: CTASectionProps) => {
  const badgeText = settings?.badge_text || 'احصل على رصيد مجاني للتجربة';
  const title = settings?.title || 'ابدأ رحلتك نحو النجاح';
  const subtitle = settings?.subtitle || 'على السوشيال ميديا';
  const description = settings?.description || 'سجل الآن واحصل على رصيد مجاني لتجربة جميع خدماتنا. لا يوجد حد أدنى للشحن!';
  const buttonText = settings?.button_text || 'سجل الآن مجاناً';
  const buttonLink = settings?.button_link || '/auth';

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-primary opacity-95" />
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:60px_60px] opacity-30" />
      
      <div className="container relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm mb-6">
            <Gift className="h-4 w-4 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">
              {badgeText}
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
            {title}
            <br />
            <span className="opacity-90">{subtitle}</span>
          </h2>

          <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="xl"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-lg hover:shadow-xl"
              asChild
            >
              <Link to={buttonLink}>
                <Sparkles className="h-5 w-5" />
                {buttonText}
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="border-primary-foreground/30 text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20"
              asChild
            >
              <Link to="/dashboard">
                تواصل معنا
              </Link>
            </Button>
          </div>

          <div className="flex items-center justify-center gap-8 mt-12 pt-8 border-t border-primary-foreground/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">+10,000</div>
              <div className="text-sm text-primary-foreground/70">عميل نشط</div>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">+1M</div>
              <div className="text-sm text-primary-foreground/70">طلب مكتمل</div>
            </div>
            <div className="w-px h-12 bg-primary-foreground/20" />
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-foreground">99%</div>
              <div className="text-sm text-primary-foreground/70">رضا العملاء</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
