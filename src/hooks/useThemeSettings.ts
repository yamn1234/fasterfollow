import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ThemeSettings {
  theme_mode: 'light' | 'dark';
  primary_color: string;
  secondary_color: string;
  custom_primary: string;
  custom_secondary: string;
}

const defaultTheme: ThemeSettings = {
  theme_mode: 'dark',
  primary_color: '28 100% 55%',
  secondary_color: '35 100% 60%',
  custom_primary: '',
  custom_secondary: '',
};

export const useThemeSettings = () => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(defaultTheme);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadThemeSettings();
  }, []);

  useEffect(() => {
    applyTheme(themeSettings);
  }, [themeSettings]);

  const loadThemeSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'theme_settings')
        .single();

      if (data?.value) {
        const parsed = typeof data.value === 'string' 
          ? JSON.parse(data.value) 
          : data.value;
        setThemeSettings(parsed);
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (settings: ThemeSettings) => {
    const root = document.documentElement;
    
    // Apply theme mode
    if (settings.theme_mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply custom colors
    const primaryColor = settings.custom_primary || settings.primary_color;
    const secondaryColor = settings.custom_secondary || settings.secondary_color;
    
    if (primaryColor) {
      root.style.setProperty('--primary', primaryColor);
      root.style.setProperty('--ring', primaryColor);
      root.style.setProperty('--accent', primaryColor);
      
      // Update gradients
      root.style.setProperty(
        '--gradient-primary',
        `linear-gradient(135deg, hsl(${primaryColor}) 0%, hsl(${secondaryColor || primaryColor}) 100%)`
      );
      
      // Update shadows
      root.style.setProperty(
        '--shadow-sm',
        `0 2px 8px -2px hsl(${primaryColor} / 0.1)`
      );
      root.style.setProperty(
        '--shadow-md',
        `0 8px 24px -8px hsl(${primaryColor} / 0.15)`
      );
      root.style.setProperty(
        '--shadow-lg',
        `0 16px 48px -12px hsl(${primaryColor} / 0.2)`
      );
      root.style.setProperty(
        '--shadow-glow',
        `0 0 40px hsl(${primaryColor} / 0.3)`
      );
    }
    
    if (secondaryColor) {
      root.style.setProperty('--primary-glow', secondaryColor);
    }
  };

  return { themeSettings, loading, refreshTheme: loadThemeSettings };
};
