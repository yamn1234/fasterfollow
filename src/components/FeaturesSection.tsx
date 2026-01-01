import { Card, CardContent } from "@/components/ui/card";
import { Zap, Shield, DollarSign, Headphones, Gift, Clock, LucideIcon } from "lucide-react";

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface FeaturesSettings {
  title: string;
  subtitle: string;
  features: Feature[];
}

interface FeaturesSectionProps {
  settings?: FeaturesSettings;
}

const iconMap: Record<string, LucideIcon> = {
  Zap,
  Shield,
  DollarSign,
  Headphones,
  Gift,
  Clock,
};

const defaultFeatures: Feature[] = [
  { icon: 'Zap', title: 'سرعة فائقة', description: 'تبدأ الخدمة خلال دقائق من الطلب مع تسليم تدريجي طبيعي' },
  { icon: 'Shield', title: 'ضمان كامل', description: 'نضمن جميع خدماتنا مع تعويض فوري في حالة النقص' },
  { icon: 'DollarSign', title: 'أسعار تنافسية', description: 'أفضل الأسعار في السوق مع جودة عالية لا مثيل لها' },
  { icon: 'Headphones', title: 'دعم فني 24/7', description: 'فريق دعم متخصص جاهز لمساعدتك في أي وقت' },
  { icon: 'Gift', title: 'هدايا مجانية', description: 'احصل على رصيد مجاني عند كل شحن وخدمات مجانية' },
  { icon: 'Clock', title: 'تشغيل آلي', description: 'نظام آلي متطور لبدء الخدمة فوراً بدون تأخير' },
];

const FeaturesSection = ({ settings }: FeaturesSectionProps) => {
  const title = settings?.title || 'لماذا متجر المتابعين؟';
  const subtitle = settings?.subtitle || 'نقدم لك تجربة فريدة ومميزة تجعلنا الخيار الأول لآلاف العملاء';
  const features = settings?.features || defaultFeatures;

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">{title}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Zap;
            return (
              <Card key={index} variant="feature" className="group">
                <CardContent className="p-6 sm:p-8 text-center">
                  <div className="mx-auto w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
