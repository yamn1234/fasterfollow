import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HomepageSection {
  id: string;
  name: string;
  name_ar: string;
  enabled: boolean;
  order: number;
}

export interface HeroSettings {
  title: string;
  subtitle: string;
  button_text: string;
  button_link: string;
  show_stats: boolean;
}

export interface SiteSettings {
  site_name: string;
  site_name_ar: string;
  site_description: string;
}

export interface FeaturesSettings {
  title: string;
  subtitle: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

export interface CTASettings {
  badge_text: string;
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  button_link: string;
}

const defaultSections: HomepageSection[] = [
  { id: 'hero', name: 'Hero Section', name_ar: 'القسم الرئيسي', enabled: true, order: 1 },
  { id: 'features', name: 'Features', name_ar: 'المميزات', enabled: true, order: 2 },
  { id: 'services', name: 'Services', name_ar: 'الخدمات', enabled: true, order: 3 },
  { id: 'platforms', name: 'Platforms', name_ar: 'المنصات', enabled: true, order: 4 },
  { id: 'cta', name: 'Call to Action', name_ar: 'دعوة للعمل', enabled: true, order: 5 },
];

const defaultHeroSettings: HeroSettings = {
  title: 'زيادة متابعينك بسهولة',
  subtitle: 'أفضل منصة لخدمات التواصل الاجتماعي',
  button_text: 'ابدأ الآن',
  button_link: '/auth',
  show_stats: true,
};

const defaultSiteSettings: SiteSettings = {
  site_name: 'SMM Panel',
  site_name_ar: 'متجر المتابعين',
  site_description: 'نقدم لك أسهل وأبسط وأسرع خدمة لزيادة المتابعين والتفاعل على منصات التواصل الاجتماعي.',
};

const defaultFeaturesSettings: FeaturesSettings = {
  title: 'لماذا متجر المتابعين؟',
  subtitle: 'نقدم لك تجربة فريدة ومميزة تجعلنا الخيار الأول لآلاف العملاء',
  features: [
    { icon: 'Zap', title: 'سرعة فائقة', description: 'تبدأ الخدمة خلال دقائق من الطلب مع تسليم تدريجي طبيعي' },
    { icon: 'Shield', title: 'ضمان كامل', description: 'نضمن جميع خدماتنا مع تعويض فوري في حالة النقص' },
    { icon: 'DollarSign', title: 'أسعار تنافسية', description: 'أفضل الأسعار في السوق مع جودة عالية لا مثيل لها' },
    { icon: 'Headphones', title: 'دعم فني 24/7', description: 'فريق دعم متخصص جاهز لمساعدتك في أي وقت' },
    { icon: 'Gift', title: 'هدايا مجانية', description: 'احصل على رصيد مجاني عند كل شحن وخدمات مجانية' },
    { icon: 'Clock', title: 'تشغيل آلي', description: 'نظام آلي متطور لبدء الخدمة فوراً بدون تأخير' },
  ],
};

const defaultCTASettings: CTASettings = {
  badge_text: 'احصل على رصيد مجاني للتجربة',
  title: 'ابدأ رحلتك نحو النجاح',
  subtitle: 'على السوشيال ميديا',
  description: 'سجل الآن واحصل على رصيد مجاني لتجربة جميع خدماتنا. لا يوجد حد أدنى للشحن!',
  button_text: 'سجل الآن مجاناً',
  button_link: '/auth',
};

export const useHomepageSettings = () => {
  const [sections, setSections] = useState<HomepageSection[]>(defaultSections);
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(defaultHeroSettings);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [featuresSettings, setFeaturesSettings] = useState<FeaturesSettings>(defaultFeaturesSettings);
  const [ctaSettings, setCtaSettings] = useState<CTASettings>(defaultCTASettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['homepage_sections', 'hero_settings', 'site_name', 'site_name_ar', 'site_description', 'features_settings', 'cta_settings']);

      if (data) {
        data.forEach(item => {
          try {
            let value = item.value;
            if (typeof value === 'string') {
              try {
                value = JSON.parse(value);
              } catch {
                // استخدم القيمة كما هي
              }
            }

            if (item.key === 'homepage_sections' && Array.isArray(value)) {
              setSections(value as unknown as HomepageSection[]);
            } else if (item.key === 'hero_settings' && value && typeof value === 'object' && !Array.isArray(value)) {
              setHeroSettings(prev => ({ ...prev, ...(value as unknown as Partial<HeroSettings>) }));
            } else if (item.key === 'features_settings' && value && typeof value === 'object' && !Array.isArray(value)) {
              setFeaturesSettings(prev => ({ ...prev, ...(value as unknown as Partial<FeaturesSettings>) }));
            } else if (item.key === 'cta_settings' && value && typeof value === 'object' && !Array.isArray(value)) {
              setCtaSettings(prev => ({ ...prev, ...(value as unknown as Partial<CTASettings>) }));
            } else if (item.key === 'site_name' && value) {
              const siteName = typeof value === 'string' ? value : String(value);
              setSiteSettings(prev => ({ ...prev, site_name: siteName }));
            } else if (item.key === 'site_name_ar' && value) {
              const siteNameAr = typeof value === 'string' ? value : String(value);
              setSiteSettings(prev => ({ ...prev, site_name_ar: siteNameAr }));
            } else if (item.key === 'site_description' && value) {
              const desc = typeof value === 'string' ? value : String(value);
              setSiteSettings(prev => ({ ...prev, site_description: desc }));
            }
          } catch (e) {
            console.warn('Error parsing setting:', item.key, e);
          }
        });
      }
    } catch (error) {
      console.error('Error loading homepage settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedSections = useMemo(() => {
    return [...sections]
      .filter(s => s.enabled)
      .sort((a, b) => a.order - b.order);
  }, [sections]);

  const isSectionEnabled = (id: string) => {
    const section = sections.find(s => s.id === id);
    return section?.enabled ?? true;
  };

  return {
    sections: sortedSections,
    heroSettings,
    siteSettings,
    featuresSettings,
    ctaSettings,
    loading,
    isSectionEnabled,
    refresh: loadSettings,
  };
};
