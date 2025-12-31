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

export const useHomepageSettings = () => {
  const [sections, setSections] = useState<HomepageSection[]>(defaultSections);
  const [heroSettings, setHeroSettings] = useState<HeroSettings>(defaultHeroSettings);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value')
        .in('key', ['homepage_sections', 'hero_settings', 'site_name', 'site_name_ar', 'site_description']);

      if (data) {
        data.forEach(item => {
          try {
            // القيمة قد تكون JSONB مباشرة أو نص JSON
            let value = item.value;
            if (typeof value === 'string') {
              try {
                value = JSON.parse(value);
              } catch {
                // إذا لم يكن JSON صالح، استخدم القيمة كما هي
              }
            }

            if (item.key === 'homepage_sections' && Array.isArray(value)) {
              setSections(value as unknown as HomepageSection[]);
            } else if (item.key === 'hero_settings' && value && typeof value === 'object' && !Array.isArray(value)) {
              setHeroSettings(prev => ({ ...prev, ...(value as unknown as Partial<HeroSettings>) }));
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
    loading,
    isSectionEnabled,
    refresh: loadSettings,
  };
};
