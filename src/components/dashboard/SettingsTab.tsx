import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, RefreshCw, Settings, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ApiProvider {
  id: string;
  name: string;
  api_url: string;
  api_key: string;
  is_active: boolean;
  balance: number;
  currency: string;
  last_sync_at: string | null;
}

const SettingsTab = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: "",
    api_url: "",
    api_key: "",
  });

  const fetchProviders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("api_providers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching providers:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل المزودين",
        variant: "destructive",
      });
    } else {
      setProviders(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProviders();
  }, [user]);

  const handleAddProvider = async () => {
    if (!user) return;

    if (!newProvider.name || !newProvider.api_url || !newProvider.api_key) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("api_providers").insert({
      user_id: user.id,
      name: newProvider.name,
      api_url: newProvider.api_url,
      api_key: newProvider.api_key,
    });

    if (error) {
      console.error("Error adding provider:", error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة المزود",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم",
        description: "تم إضافة المزود بنجاح",
      });
      setNewProvider({ name: "", api_url: "", api_key: "" });
      setIsDialogOpen(false);
      fetchProviders();
    }
  };

  const handleDeleteProvider = async (id: string) => {
    const { error } = await supabase.from("api_providers").delete().eq("id", id);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في حذف المزود",
        variant: "destructive",
      });
    } else {
      toast({
        title: "تم",
        description: "تم حذف المزود بنجاح",
      });
      fetchProviders();
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from("api_providers")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث حالة المزود",
        variant: "destructive",
      });
    } else {
      fetchProviders();
    }
  };

  const handleSyncBalance = async (providerId: string) => {
    setSyncingId(providerId);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No session");
      }

      const { data, error } = await supabase.functions.invoke("sync-api-balance", {
        body: { providerId },
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "تم المزامنة",
          description: `الرصيد: ${data.balance} ${data.currency}`,
        });
        fetchProviders();
      } else {
        throw new Error(data.error || "Sync failed");
      }
    } catch (error: any) {
      console.error("Sync error:", error);
      toast({
        title: "خطأ في المزامنة",
        description: error.message || "فشل في مزامنة الرصيد",
        variant: "destructive",
      });
    } finally {
      setSyncingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إعدادات API</h2>
          <p className="text-muted-foreground">إدارة مزودي الخدمات الخارجية</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مزود
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>إضافة مزود API جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات SMM Panel API لربط الخدمات
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">اسم المزود</Label>
                <Input
                  id="name"
                  placeholder="مثال: SMM Panel"
                  value={newProvider.name}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api_url">رابط API</Label>
                <Input
                  id="api_url"
                  placeholder="https://example.com/api/v2"
                  value={newProvider.api_url}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, api_url: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="api_key">مفتاح API</Label>
                <Input
                  id="api_key"
                  type="password"
                  placeholder="أدخل مفتاح API"
                  value={newProvider.api_key}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, api_key: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddProvider}>إضافة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {providers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Settings className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">لا يوجد مزودين</h3>
            <p className="text-muted-foreground text-center mb-4">
              قم بإضافة مزود API لبدء تنفيذ الخدمات تلقائياً
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 ml-2" />
              إضافة مزود
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {providers.map((provider) => (
            <Card key={provider.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        provider.is_active ? "bg-green-500" : "bg-muted"
                      }`}
                    />
                    <CardTitle className="text-lg">{provider.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={provider.is_active}
                      onCheckedChange={(checked) =>
                        handleToggleActive(provider.id, checked)
                      }
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>حذف المزود</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف هذا المزود؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteProvider(provider.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardDescription className="mt-1">
                  {provider.api_url}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">الرصيد</p>
                      <p className="text-xl font-bold">
                        {provider.balance.toFixed(2)} {provider.currency}
                      </p>
                    </div>
                    {provider.last_sync_at && (
                      <div>
                        <p className="text-sm text-muted-foreground">آخر مزامنة</p>
                        <p className="text-sm">
                          {new Date(provider.last_sync_at).toLocaleString("ar-SA")}
                        </p>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleSyncBalance(provider.id)}
                    disabled={syncingId === provider.id}
                  >
                    {syncingId === provider.id ? (
                      <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 ml-2" />
                    )}
                    مزامنة الرصيد
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
