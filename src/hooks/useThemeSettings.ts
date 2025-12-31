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

// Validate that a color is in HSL format (H S% L%)
const isValidHSL = (color: string): boolean => {
  if (!color || typeof color !== 'string') return false;
  const parts = color.trim().split(/\s+/);
  if (parts.length !== 3) return false;
  const h = parseFloat(parts[0]);
  const s = parts[1];
  const l = parts[2];
  return !isNaN(h) && s.endsWith('%') && l.endsWith('%');
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
        .maybeSingle();

      if (data?.value) {
        const parsed = typeof data.value === 'string' 
          ? JSON.parse(data.value) 
          : data.value;
        setThemeSettings({ ...defaultTheme, ...parsed });
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
    
    // Get colors with validation - use defaults if invalid
    const primaryColor = settings.custom_primary && isValidHSL(settings.custom_primary) 
      ? settings.custom_primary 
      : (isValidHSL(settings.primary_color) ? settings.primary_color : defaultTheme.primary_color);
    
    const secondaryColor = settings.custom_secondary && isValidHSL(settings.custom_secondary)
      ? settings.custom_secondary
      : (isValidHSL(settings.secondary_color) ? settings.secondary_color : defaultTheme.secondary_color);
    
    // Only apply if we have valid HSL colors
    if (isValidHSL(primaryColor)) {
      root.style.setProperty('--primary', primaryColor);
      root.style.setProperty('--ring', primaryColor);
      root.style.setProperty('--accent', primaryColor);
      
      // Update gradients with proper HSL values
      root.style.setProperty(
        '--gradient-primary',
        `linear-gradient(135deg, hsl(${primaryColor}) 0%, hsl(${secondaryColor}) 100%)`
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
    
    if (isValidHSL(secondaryColor)) {
      root.style.setProperty('--primary-glow', secondaryColor);
    }
  };

  return { themeSettings, loading, refreshTheme: loadThemeSettings };
};
