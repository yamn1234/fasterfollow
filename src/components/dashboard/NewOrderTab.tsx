import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useServices } from "@/hooks/useServices";
import { useCurrency } from "@/hooks/useCurrency";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  ShoppingCart, 
  Loader2, 
  Link as LinkIcon, 
  Package,
  Sparkles,
  Info,
  MessageSquare,
  Clock,
  Layers
} from "lucide-react";

// Platform icons mapping
const platformIcons: Record<string, string> = {
  'instagram': '📸',
  'انستقرام': '📸',
  'facebook': '👍',
  'فيسبوك': '👍',
  'twitter': '🐦',
  'تويتر': '🐦',
  'x': '✖️',
  'tiktok': '🎵',
  'تيك توك': '🎵',
  'youtube': '▶️',
  'يوتيوب': '▶️',
  'telegram': '✈️',
  'تيليجرام': '✈️',
  'snapchat': '👻',
  'سناب شات': '👻',
  'linkedin': '💼',
  'لينكد إن': '💼',
  'spotify': '🎧',
  'سبوتيفاي': '🎧',
  'twitch': '🎮',
  'تويتش': '🎮',
  'discord': '🎯',
  'ديسكورد': '🎯',
  'threads': '🧵',
  'ثريدز': '🧵',
};

const getCategoryIcon = (name: string, icon?: string | null): string => {
  if (icon) return icon;
  const lowerName = name.toLowerCase();
  for (const [key, emoji] of Object.entries(platformIcons)) {
    if (lowerName.includes(key)) return emoji;
  }
  return '📦';
};

// Helper to check if the icon is a URL (image)
const isImageUrl = (icon?: string | null): boolean => {
  if (!icon) return false;
  return icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:');
};

// Component to render category icon (image or emoji)
const CategoryIcon = ({ category, size = "md" }: { category: { name: string; icon?: string | null; image_url?: string | null }; size?: "sm" | "md" }) => {
  const imageUrl = category.image_url;
  const icon = category.icon;
  const sizeClasses = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  
  // Priority: image_url > icon (if URL) > icon (emoji) > fallback
  if (imageUrl && isImageUrl(imageUrl)) {
    return <img src={imageUrl} alt={category.name} className={`${sizeClasses} rounded-full object-cover`} />;
  }
  if (icon && isImageUrl(icon)) {
    return <img src={icon} alt={category.name} className={`${sizeClasses} rounded-full object-cover`} />;
  }
  return <span className={size === "sm" ? "text-base" : "text-lg"}>{getCategoryIcon(category.name, icon)}</span>;
};

const NewOrderTab = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { categories, services, loading } = useServices();
  const { selectedCurrency, format, convert } = useCurrency();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [filteredServices, setFilteredServices] = useState(services);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<string>("");
  const [comments, setComments] = useState("");

  const selectedServiceData = services.find(s => s.id === selectedService);
  const quantityNum = quantity === "" ? 0 : parseInt(quantity) || 0;
  const totalPriceUSD = selectedServiceData ? (selectedServiceData.price * quantityNum / 1000) : 0;
  const userBalanceUSD = profile?.balance || 0;
  const canAfford = userBalanceUSD >= totalPriceUSD;

  useEffect(() => {
    if (selectedCategory) {
      setFilteredServices(services.filter(s => s.category_id === selectedCategory));
      setSelectedService("");
    } else {
      setFilteredServices(services);
    }
  }, [selectedCategory, services]);

  useEffect(() => {
    if (selectedServiceData) {
      setQuantity(String(selectedServiceData.min_quantity || 100));
    }
  }, [selectedService]);

  const handleSubmit = async () => {
    if (!user || !selectedServiceData) return;

    if (!link.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الرابط",
        variant: "destructive",
      });
      return;
    }

    if (!canAfford) {
      toast({
        title: "رصيد غير كافٍ",
        description: "يرجى شحن رصيدك أولاً",
        variant: "destructive",
      });
      return;
    }

    // Check if comments are required
    if (selectedServiceData.requires_comments && !comments.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال التعليقات المطلوبة",
        variant: "destructive",
      });
      return;
    }

    const minQty = selectedServiceData.min_quantity || 1;
    const maxQty = selectedServiceData.max_quantity || 1000000;
    
    if (quantityNum < minQty || quantityNum > maxQty) {
      toast({
        title: "خطأ في الكمية",
        description: `الكمية يجب أن تكون بين ${minQty} و ${maxQty}`,
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create order in database
      const { data: orderData, error } = await supabase.from("orders").insert({
        user_id: user.id,
        service_id: selectedService,
        link: link.trim(),
        quantity: quantityNum,
        price: totalPriceUSD,
        status: "pending",
        comments: selectedServiceData.requires_comments ? comments.trim() : null
      }).select().single();

      if (error) throw error;

      // Update user balance
      await supabase
        .from("profiles")
        .update({ balance: userBalanceUSD - totalPriceUSD })
        .eq("user_id", user.id);

      // Send order to provider via edge function
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.access_token && orderData?.id) {
        const { data: placeResult, error: placeError } = await supabase.functions.invoke(
          'smm-place-order',
          {
            body: { orderId: orderData.id }
          }
        );

        if (placeError) {
          console.error("Error placing order with provider:", placeError);
          toast({
            title: "تم إنشاء الطلب",
            description: "الطلب في انتظار الإرسال للمزود",
          });
        } else if (placeResult?.success) {
          toast({
            title: "تم إرسال الطلب بنجاح! 🎉",
            description: "سيتم تنفيذ طلبك قريباً",
          });
        } else {
          toast({
            title: "تم إنشاء الطلب",
            description: placeResult?.error || "في انتظار المعالجة",
          });
        }
      } else {
        toast({
          title: "تم إنشاء الطلب بنجاح! 🎉",
          description: "سيتم تنفيذ طلبك قريباً",
        });
      }

      // Reset form
      setLink("");
      setQuantity("");
      setSelectedService("");
      setComments("");
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء الطلب",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
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
    <div className="space-y-4 md:space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl md:text-3xl font-bold flex items-center gap-2 md:gap-3">
          <Sparkles className="h-5 w-5 md:h-7 md:w-7 text-primary" />
          طلب خدمة جديدة
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">
          اختر الخدمة المطلوبة وأدخل تفاصيل الطلب
        </p>
      </div>

      {/* Quick Category Navigation - Mobile Optimized */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">تصفح سريع</span>
        </div>
        <ScrollArea className="w-full whitespace-nowrap" dir="rtl">
          <div ref={scrollRef} className="flex gap-2 pb-2">
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("")}
              className="shrink-0 h-10 w-10 md:w-auto md:px-3 rounded-full text-xs md:text-sm p-0 md:p-2 flex items-center justify-center"
              title="الكل"
            >
              <span className="text-lg md:text-base">📋</span>
              <span className="hidden md:inline md:ml-1.5">الكل</span>
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="shrink-0 h-10 w-10 md:w-auto md:px-3 rounded-full text-xs md:text-sm p-0 md:p-2 flex items-center justify-center"
                title={cat.name_ar || cat.name}
              >
                <CategoryIcon category={cat} size="sm" />
                <span className="hidden md:inline md:ml-1.5 max-w-[80px] truncate">{cat.name_ar || cat.name}</span>
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 md:gap-6">
        {/* Order Form */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <Card variant="elevated">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Package className="h-4 w-4 md:h-5 md:w-5" />
                تفاصيل الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              {/* Category Selection - Hidden on desktop since we have quick nav */}
              <div className="space-y-2 md:hidden">
                <Label className="text-sm">اختر المنصة</Label>
                <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}>
                  <SelectTrigger className="w-full h-11 text-sm">
                    <SelectValue placeholder="جميع المنصات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <span className="flex items-center gap-2">
                        <span>📋</span>
                        جميع المنصات
                      </span>
                    </SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <CategoryIcon category={cat} size="sm" />
                          {cat.name_ar || cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Selection - Desktop */}
              <div className="space-y-2 hidden md:block">
                <Label>اختر التصنيف</Label>
                <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="جميع التصنيفات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <CategoryIcon category={cat} size="sm" />
                          {cat.name_ar || cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label className="text-sm md:text-base">اختر الخدمة</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-full h-11 md:h-10 text-sm">
                    <SelectValue placeholder="اختر الخدمة المطلوبة" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {filteredServices.map((service) => (
                      <SelectItem key={service.id} value={service.id} className="py-3">
                        <div className="flex flex-col gap-1 w-full">
                          <span className="text-sm font-medium line-clamp-2">{service.name_ar || service.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="text-primary font-semibold">
                              {format(service.price)}/1K
                            </span>
                            {service.delivery_time && (
                              <span className="flex items-center gap-0.5">
                                <Clock className="h-3 w-3" />
                                {service.delivery_time}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedServiceData && (selectedServiceData.description_ar || selectedServiceData.description) && (
                  <div className="p-2.5 md:p-3 rounded-lg bg-secondary/50 border mt-2">
                    <p className="text-xs md:text-sm text-muted-foreground flex items-start gap-2">
                      <Info className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 mt-0.5 text-primary" />
                      <span className="line-clamp-3 md:line-clamp-none">{selectedServiceData.description_ar || selectedServiceData.description}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Link Input */}
              <div className="space-y-2">
                <Label className="text-sm md:text-base">الرابط</Label>
                <div className="relative">
                  <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://instagram.com/username"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="pr-10 h-11 md:h-10 text-sm"
                  />
                </div>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label className="text-sm md:text-base">الكمية</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min={selectedServiceData?.min_quantity || 1}
                  max={selectedServiceData?.max_quantity || 1000000}
                  placeholder="أدخل الكمية"
                  className="h-11 md:h-10 text-sm"
                />
                {selectedServiceData && (
                  <p className="text-xs text-muted-foreground">
                    الحد الأدنى: {selectedServiceData.min_quantity || 1} | 
                    الحد الأقصى: {selectedServiceData.max_quantity?.toLocaleString() || "غير محدود"}
                  </p>
                )}
              </div>

              {/* Comments Input (for services that require it) */}
              {selectedServiceData?.requires_comments && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm md:text-base">
                    <MessageSquare className="h-4 w-4" />
                    التعليقات (1 لكل سطر)
                  </Label>
                  <Textarea
                    placeholder="أدخل التعليقات هنا، كل تعليق في سطر منفصل..."
                    value={comments}
                    onChange={(e) => {
                      const newComments = e.target.value;
                      setComments(newComments);
                      // Auto-calculate quantity from number of comment lines
                      const lines = newComments.split('\n').filter(line => line.trim()).length;
                      if (lines > 0) {
                        setQuantity(String(lines));
                      }
                    }}
                    rows={5}
                    className="resize-none text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    عدد التعليقات: {comments.split('\n').filter(line => line.trim()).length} | الكمية ستحدد تلقائياً من عدد الأسطر
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 order-3 lg:order-2">
          <Card variant="elevated" className="lg:sticky lg:top-6">
            <CardHeader className="pb-3 md:pb-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                ملخص الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="space-y-2 md:space-y-3">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">الخدمة</span>
                  <span className="font-medium text-left max-w-[55%] md:max-w-[60%] truncate">
                    {selectedServiceData?.name_ar || selectedServiceData?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">الكمية</span>
                  <span className="font-medium">{quantityNum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">سعر الألف</span>
                  <span className="font-medium">
                    {format(selectedServiceData?.price || 0)}
                  </span>
                </div>
                {selectedServiceData?.delivery_time && (
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">وقت التنفيذ</span>
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedServiceData.delivery_time}
                    </span>
                  </div>
                )}
                <div className="border-t pt-2 md:pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm md:text-base">الإجمالي</span>
                    <span className="text-lg md:text-xl font-bold text-primary">
                      {format(totalPriceUSD)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-2.5 md:p-3">
                <div className="flex justify-between text-xs md:text-sm">
                  <span className="text-muted-foreground">رصيدك الحالي</span>
                  <span className={`font-bold ${canAfford ? "text-green-500" : "text-destructive"}`}>
                    {format(userBalanceUSD)}
                  </span>
                </div>
                {!canAfford && totalPriceUSD > 0 && (
                  <p className="text-xs text-destructive mt-1.5 md:mt-2">
                    رصيدك غير كافٍ. تحتاج {format(totalPriceUSD - userBalanceUSD)} إضافي
                  </p>
                )}
              </div>

              <Button 
                className="w-full h-11 md:h-12 text-sm md:text-base" 
                size="lg"
                onClick={handleSubmit}
                disabled={!selectedService || !link || submitting || !canAfford}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4 ml-2" />
                    إرسال الطلب
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NewOrderTab;
