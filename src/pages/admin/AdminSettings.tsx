import { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  Palette,
  Shield,
  Database,
  Save,
  Loader2,
  Sun,
  Moon,
  Layout,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HomepageSection {
  id: string;
  name: string;
  name_ar: string;
  enabled: boolean;
  order: number;
}

const defaultSections: HomepageSection[] = [
  { id: 'hero', name: 'Hero Section', name_ar: 'القسم الرئيسي', enabled: true, order: 1 },
  { id: 'features', name: 'Features', name_ar: 'المميزات', enabled: true, order: 2 },
  { id: 'services', name: 'Services', name_ar: 'الخدمات', enabled: true, order: 3 },
  { id: 'platforms', name: 'Platforms', name_ar: 'المنصات', enabled: true, order: 4 },
  { id: 'cta', name: 'Call to Action', name_ar: 'دعوة للعمل', enabled: true, order: 5 },
];

const colorPresets = [
  { name: 'برتقالي (افتراضي)', primary: '25 95% 53%', secondary: '38 92% 50%' },
  { name: 'أزرق', primary: '221 83% 53%', secondary: '199 89% 48%' },
  { name: 'أخضر', primary: '142 71% 45%', secondary: '160 84% 39%' },
  { name: 'بنفسجي', primary: '262 83% 58%', secondary: '280 87% 65%' },
  { name: 'أحمر', primary: '0 84% 60%', secondary: '15 90% 55%' },
  { name: 'وردي', primary: '330 81% 60%', secondary: '340 82% 52%' },
];

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  
  const [settings, setSettings] = useState({
    site_name: 'SMM Panel',
    site_name_ar: 'لوحة SMM',
    site_description: '',
    site_email: '',
    default_currency: 'USD',
    default_language: 'ar',
    timezone: 'Asia/Riyadh',
    maintenance_mode: false,
    allow_registration: true,
    require_email_verification: false,
    min_deposit: 5,
    max_deposit: 1000,
    referral_enabled: true,
    referral_commission: 5,
  });

  const [themeSettings, setThemeSettings] = useState({
    theme_mode: 'dark',
    primary_color: '25 95% 53%',
    secondary_color: '38 92% 50%',
    custom_primary: '',
    custom_secondary: '',
  });

  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>(defaultSections);

  const [heroSettings, setHeroSettings] = useState({
    title: 'زيادة متابعينك بسهولة',
    subtitle: 'أفضل منصة لخدمات التواصل الاجتماعي',
    button_text: 'ابدأ الآن',
    button_link: '/auth',
    show_stats: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('*');

      if (data) {
        const settingsMap: Record<string, any> = {};
        data.forEach(item => {
          try {
            settingsMap[item.key] = JSON.parse(item.value as string);
          } catch {
            settingsMap[item.key] = item.value;
          }
        });

        if (settingsMap.homepage_sections) {
          setHomepageSections(settingsMap.homepage_sections);
        }
        if (settingsMap.theme_settings) {
          setThemeSettings(settingsMap.theme_settings);
        }
        if (settingsMap.hero_settings) {
          setHeroSettings(settingsMap.hero_settings);
        }
        
        setSettings(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(settingsMap).filter(([key]) => key in prev)
          )
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const allSettings = {
        ...settings,
        homepage_sections: homepageSections,
        theme_settings: themeSettings,
        hero_settings: heroSettings,
      };

      for (const [key, value] of Object.entries(allSettings)) {
        await supabase
          .from('site_settings')
          .upsert(
            { key, value: JSON.stringify(value), group_name: 'general' },
            { onConflict: 'key' }
          );
      }

      toast({
        title: 'تم الحفظ',
        description: 'تم حفظ الإعدادات بنجاح',
      });
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في حفظ الإعدادات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (id: string) => {
    setHomepageSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, enabled: !section.enabled } : section
      )
    );
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = homepageSections.findIndex(s => s.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === homepageSections.length - 1)
    ) {
      return;
    }

    const newSections = [...homepageSections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    
    setHomepageSections(newSections.map((s, i) => ({ ...s, order: i + 1 })));
  };

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    setThemeSettings({
      ...themeSettings,
      primary_color: preset.primary,
      secondary_color: preset.secondary,
    });
  };

  const resetToDefaults = () => {
    setHomepageSections(defaultSections);
    setThemeSettings({
      theme_mode: 'dark',
      primary_color: '25 95% 53%',
      secondary_color: '38 92% 50%',
      custom_primary: '',
      custom_secondary: '',
    });
    toast({
      title: 'تم الإعادة',
      description: 'تم إعادة الإعدادات للقيم الافتراضية',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground">إعدادات النظام والتكوين</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 ml-2" />
            استعادة الافتراضي
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 ml-2" />
            عام
          </TabsTrigger>
          <TabsTrigger value="homepage">
            <Layout className="w-4 h-4 ml-2" />
            الصفحة الرئيسية
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 ml-2" />
            الألوان والمظهر
          </TabsTrigger>
          <TabsTrigger value="localization">
            <Globe className="w-4 h-4 ml-2" />
            اللغة والمنطقة
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 ml-2" />
            الأمان
          </TabsTrigger>
          <TabsTrigger value="payments">
            <Database className="w-4 h-4 ml-2" />
            المدفوعات
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الموقع</CardTitle>
              <CardDescription>الإعدادات الأساسية للموقع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>اسم الموقع (English)</Label>
                  <Input
                    value={settings.site_name}
                    onChange={(e) =>
                      setSettings({ ...settings, site_name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>اسم الموقع (العربية)</Label>
                  <Input
                    value={settings.site_name_ar}
                    onChange={(e) =>
                      setSettings({ ...settings, site_name_ar: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>وصف الموقع</Label>
                <Textarea
                  value={settings.site_description}
                  onChange={(e) =>
                    setSettings({ ...settings, site_description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={settings.site_email}
                  onChange={(e) =>
                    setSettings({ ...settings, site_email: e.target.value })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>وضع الصيانة</CardTitle>
              <CardDescription>
                عند تفعيل وضع الصيانة، لن يتمكن المستخدمون من الوصول للموقع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">تفعيل وضع الصيانة</p>
                  <p className="text-sm text-muted-foreground">
                    سيظهر للمستخدمين رسالة صيانة
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenance_mode: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Homepage Tab */}
        <TabsContent value="homepage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أقسام الصفحة الرئيسية</CardTitle>
              <CardDescription>
                تحكم في ترتيب وإظهار أقسام الصفحة الرئيسية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {homepageSections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <div
                    key={section.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      section.enabled ? 'bg-card' : 'bg-muted/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveSection(section.id, 'up')}
                          disabled={index === 0}
                        >
                          <span className="text-xs">▲</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveSection(section.id, 'down')}
                          disabled={index === homepageSections.length - 1}
                        >
                          <span className="text-xs">▼</span>
                        </Button>
                      </div>
                      <div>
                        <p className="font-medium">{section.name_ar}</p>
                        <p className="text-sm text-muted-foreground">{section.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={section.enabled ? 'default' : 'secondary'}>
                        {section.enabled ? 'مفعّل' : 'معطّل'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleSection(section.id)}
                      >
                        {section.enabled ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات القسم الرئيسي (Hero)</CardTitle>
              <CardDescription>تخصيص النصوص والأزرار في القسم الرئيسي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>العنوان الرئيسي</Label>
                <Input
                  value={heroSettings.title}
                  onChange={(e) =>
                    setHeroSettings({ ...heroSettings, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>العنوان الفرعي</Label>
                <Input
                  value={heroSettings.subtitle}
                  onChange={(e) =>
                    setHeroSettings({ ...heroSettings, subtitle: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نص الزر</Label>
                  <Input
                    value={heroSettings.button_text}
                    onChange={(e) =>
                      setHeroSettings({ ...heroSettings, button_text: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>رابط الزر</Label>
                  <Input
                    value={heroSettings.button_link}
                    onChange={(e) =>
                      setHeroSettings({ ...heroSettings, button_link: e.target.value })
                    }
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">إظهار الإحصائيات</p>
                  <p className="text-sm text-muted-foreground">
                    عرض عدد العملاء والطلبات في القسم الرئيسي
                  </p>
                </div>
                <Switch
                  checked={heroSettings.show_stats}
                  onCheckedChange={(checked) =>
                    setHeroSettings({ ...heroSettings, show_stats: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>وضع السمة</CardTitle>
              <CardDescription>اختر بين الوضع الفاتح أو الداكن</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${
                    themeSettings.theme_mode === 'light'
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setThemeSettings({ ...themeSettings, theme_mode: 'light' })}
                >
                  <Sun className="w-8 h-8" />
                  <span className="font-medium">فاتح</span>
                </div>
                <div
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 bg-gray-900 text-white ${
                    themeSettings.theme_mode === 'dark'
                      ? 'border-primary'
                      : 'border-gray-700 hover:border-primary/50'
                  }`}
                  onClick={() => setThemeSettings({ ...themeSettings, theme_mode: 'dark' })}
                >
                  <Moon className="w-8 h-8" />
                  <span className="font-medium">داكن</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ألوان الموقع</CardTitle>
              <CardDescription>اختر نظام ألوان جاهز أو خصص الألوان يدوياً</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">أنظمة ألوان جاهزة</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {colorPresets.map((preset) => (
                    <div
                      key={preset.name}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        themeSettings.primary_color === preset.primary
                          ? 'border-primary'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => applyColorPreset(preset)}
                    >
                      <div className="flex gap-2 mb-2">
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: `hsl(${preset.primary})` }}
                        />
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{ backgroundColor: `hsl(${preset.secondary})` }}
                        />
                      </div>
                      <p className="text-sm font-medium">{preset.name}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <Label className="mb-3 block">ألوان مخصصة (HSL)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>اللون الأساسي</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-lg border"
                        style={{ backgroundColor: `hsl(${themeSettings.primary_color})` }}
                      />
                      <Input
                        value={themeSettings.primary_color}
                        onChange={(e) =>
                          setThemeSettings({ ...themeSettings, primary_color: e.target.value })
                        }
                        placeholder="25 95% 53%"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>اللون الثانوي</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-10 h-10 rounded-lg border"
                        style={{ backgroundColor: `hsl(${themeSettings.secondary_color})` }}
                      />
                      <Input
                        value={themeSettings.secondary_color}
                        onChange={(e) =>
                          setThemeSettings({ ...themeSettings, secondary_color: e.target.value })
                        }
                        placeholder="38 92% 50%"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  صيغة HSL: درجة اللون (0-360) نسبة التشبع% نسبة السطوع%
                </p>
              </div>

              <div className="border-t pt-6">
                <Label className="mb-3 block">معاينة الألوان</Label>
                <div className="p-4 rounded-lg border bg-card">
                  <div className="flex flex-wrap gap-3">
                    <Button
                      style={{ 
                        background: `linear-gradient(135deg, hsl(${themeSettings.primary_color}), hsl(${themeSettings.secondary_color}))` 
                      }}
                    >
                      زر أساسي
                    </Button>
                    <Button variant="outline" className="border-2" style={{ borderColor: `hsl(${themeSettings.primary_color})`, color: `hsl(${themeSettings.primary_color})` }}>
                      زر ثانوي
                    </Button>
                    <Badge style={{ backgroundColor: `hsl(${themeSettings.primary_color})` }}>
                      شارة
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Localization Tab */}
        <TabsContent value="localization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>اللغة والمنطقة</CardTitle>
              <CardDescription>إعدادات اللغة والعملة والمنطقة الزمنية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>اللغة الافتراضية</Label>
                  <Select
                    value={settings.default_language}
                    onValueChange={(v) =>
                      setSettings({ ...settings, default_language: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>العملة الافتراضية</Label>
                  <Select
                    value={settings.default_currency}
                    onValueChange={(v) =>
                      setSettings({ ...settings, default_currency: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - دولار أمريكي</SelectItem>
                      <SelectItem value="EUR">EUR - يورو</SelectItem>
                      <SelectItem value="SAR">SAR - ريال سعودي</SelectItem>
                      <SelectItem value="AED">AED - درهم إماراتي</SelectItem>
                      <SelectItem value="EGP">EGP - جنيه مصري</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>المنطقة الزمنية</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(v) => setSettings({ ...settings, timezone: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">الرياض (GMT+3)</SelectItem>
                      <SelectItem value="Asia/Dubai">دبي (GMT+4)</SelectItem>
                      <SelectItem value="Africa/Cairo">القاهرة (GMT+2)</SelectItem>
                      <SelectItem value="Europe/London">لندن (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">نيويورك (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات التسجيل</CardTitle>
              <CardDescription>التحكم في تسجيل المستخدمين الجدد</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">السماح بالتسجيل</p>
                  <p className="text-sm text-muted-foreground">
                    السماح للمستخدمين الجدد بإنشاء حسابات
                  </p>
                </div>
                <Switch
                  checked={settings.allow_registration}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allow_registration: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">التحقق من البريد الإلكتروني</p>
                  <p className="text-sm text-muted-foreground">
                    مطالبة المستخدمين بتأكيد بريدهم الإلكتروني
                  </p>
                </div>
                <Switch
                  checked={settings.require_email_verification}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, require_email_verification: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإيداع</CardTitle>
              <CardDescription>التحكم في حدود الإيداع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>الحد الأدنى للإيداع ($)</Label>
                  <Input
                    type="number"
                    value={settings.min_deposit}
                    onChange={(e) =>
                      setSettings({ ...settings, min_deposit: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>الحد الأقصى للإيداع ($)</Label>
                  <Input
                    type="number"
                    value={settings.max_deposit}
                    onChange={(e) =>
                      setSettings({ ...settings, max_deposit: Number(e.target.value) })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>برنامج الإحالة</CardTitle>
              <CardDescription>إعدادات نظام الإحالة والعمولات</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">تفعيل برنامج الإحالة</p>
                  <p className="text-sm text-muted-foreground">
                    السماح للمستخدمين بإحالة آخرين وكسب عمولة
                  </p>
                </div>
                <Switch
                  checked={settings.referral_enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, referral_enabled: checked })
                  }
                />
              </div>
              {settings.referral_enabled && (
                <div className="space-y-2">
                  <Label>نسبة عمولة الإحالة (%)</Label>
                  <Input
                    type="number"
                    value={settings.referral_commission}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        referral_commission: Number(e.target.value),
                      })
                    }
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
