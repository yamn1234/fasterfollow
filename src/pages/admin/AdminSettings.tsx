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
  Languages,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save each setting individually
      for (const [key, value] of Object.entries(settings)) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">الإعدادات</h1>
          <p className="text-muted-foreground">إعدادات النظام والتكوين</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 ml-2" />
          )}
          حفظ التغييرات
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general">
            <Settings className="w-4 h-4 ml-2" />
            عام
          </TabsTrigger>
          <TabsTrigger value="localization">
            <Globe className="w-4 h-4 ml-2" />
            اللغة والمنطقة
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="w-4 h-4 ml-2" />
            المظهر
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

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المظهر والسمة</CardTitle>
              <CardDescription>تخصيص مظهر الموقع</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary flex flex-col items-center gap-2 border-border"
                  onClick={() => {}}
                >
                  <Sun className="w-8 h-8" />
                  <span className="font-medium">فاتح</span>
                </div>
                <div
                  className="p-4 rounded-xl border-2 cursor-pointer transition-all hover:border-primary flex flex-col items-center gap-2 border-border bg-gray-900 text-white"
                  onClick={() => {}}
                >
                  <Moon className="w-8 h-8" />
                  <span className="font-medium">داكن</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
