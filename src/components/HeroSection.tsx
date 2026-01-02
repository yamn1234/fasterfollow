import { Button } from "@/components/ui/button";
import { ShoppingCart, Zap, Shield, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-rocket.png";

interface HeroStats {
  customers: string;
  customers_label: string;
  services: string;
  services_label: string;
  support: string;
  support_label: string;
}

interface HeroSettings {
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  show_stats: boolean;
  image_url?: string;
  stats?: HeroStats;
}

interface SiteSettings {
  site_name: string;
  site_name_ar: string;
  site_description: string;
}

interface HeroSectionProps {
  settings?: HeroSettings;
  siteSettings?: SiteSettings;
}

const HeroSection = ({ settings, siteSettings }: HeroSectionProps) => {
  const title = siteSettings?.site_name_ar || 'متجر المتابعين';
  const description = siteSettings?.site_description || 
    'نقدم لك أسهل وأبسط وأسرع خدمة لزيادة المتابعين والتفاعل على منصات التواصل الاجتماعي.';
  const buttonText = settings?.button_text || 'تصفح الخدمات';
  const buttonLink = settings?.button_link || '/services';
  const showStats = settings?.show_stats ?? true;
  const customImage = settings?.image_url;

  return (
    <section className="relative overflow-hidden gradient-hero py-12 sm:py-16 lg:py-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-slide-up">
              مرحباً بك في{" "}
              <span className="text-gradient">{title}</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
              {description}{" "}
              <strong className="text-foreground">تيك توك، إنستجرام، فيسبوك، تويتر، يوتيوب</strong>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button variant="hero" size="xl" className="w-full sm:w-auto" asChild>
                <Link to={buttonLink}>
                  <ShoppingCart className="h-5 w-5" />
                  {buttonText}
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="w-full sm:w-auto" asChild>
                <Link to="/auth">جرب مجاناً</Link>
              </Button>
            </div>

            {/* Stats */}
            {showStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mt-12 pt-8 border-t border-border/50 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                <div className="text-center lg:text-right">
                  <div className="text-xl md:text-3xl font-bold text-gradient">{settings?.stats?.customers || '+10K'}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{settings?.stats?.customers_label || 'عميل سعيد'}</div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-xl md:text-3xl font-bold text-gradient">{settings?.stats?.services || '+50'}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{settings?.stats?.services_label || 'خدمة متاحة'}</div>
                </div>
                <div className="text-center lg:text-right">
                  <div className="text-xl md:text-3xl font-bold text-gradient">{settings?.stats?.support || '24/7'}</div>
                  <div className="text-xs md:text-sm text-muted-foreground">{settings?.stats?.support_label || 'دعم فني'}</div>
                </div>
              </div>
            )}
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 flex justify-center">
            <img
              src={customImage || heroImage}
              alt={`${title} - زيادة متابعين السوشيال ميديا`}
              width={512}
              height={512}
              className="w-full max-w-xs sm:max-w-md lg:max-w-lg animate-float drop-shadow-2xl"
              fetchPriority="high"
            />
          </div>
        </div>

        {/* Features Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
          <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="font-bold">سرعة فائقة</div>
              <div className="text-sm text-muted-foreground">توصيل خلال دقائق</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="font-bold">ضمان كامل</div>
              <div className="text-sm text-muted-foreground">استرداد أو تعويض</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Headphones className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="font-bold">دعم متواصل</div>
              <div className="text-sm text-muted-foreground">24 ساعة / 7 أيام</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
