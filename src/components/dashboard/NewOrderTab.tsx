import { useState, useEffect } from "react";
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
import { 
  ShoppingCart, 
  Loader2, 
  Link as LinkIcon, 
  Package,
  Sparkles,
  Info,
  MessageSquare,
  Clock
} from "lucide-react";

const NewOrderTab = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { categories, services, loading } = useServices();
  const { selectedCurrency, format, convert } = useCurrency();
  
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
            description: `رقم الطلب الخارجي: ${placeResult.externalOrderId}`,
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-primary" />
          طلب خدمة جديدة
        </h1>
        <p className="text-muted-foreground mt-1">
          اختر الخدمة المطلوبة وأدخل تفاصيل الطلب
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="lg:col-span-2">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                تفاصيل الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Category Selection */}
              <div className="space-y-2">
                <Label>اختر التصنيف</Label>
                <Select value={selectedCategory || "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? "" : val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="جميع التصنيفات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name_ar || cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label>اختر الخدمة</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="اختر الخدمة المطلوبة" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredServices.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex justify-between items-center w-full gap-4">
                          <span>{service.name_ar || service.name}</span>
                          <div className="flex items-center gap-3">
                            {service.delivery_time && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {service.delivery_time}
                              </span>
                            )}
                            <span className="text-primary font-medium">
                              {format(service.price)}/1000
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedServiceData && (selectedServiceData.description_ar || selectedServiceData.description) && (
                  <div className="p-3 rounded-lg bg-secondary/50 border mt-2">
                    <p className="text-sm text-muted-foreground flex items-start gap-2">
                      <Info className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                      <span>{selectedServiceData.description_ar || selectedServiceData.description}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Link Input */}
              <div className="space-y-2">
                <Label>الرابط</Label>
                <div className="relative">
                  <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://instagram.com/username"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label>الكمية</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  min={selectedServiceData?.min_quantity || 1}
                  max={selectedServiceData?.max_quantity || 1000000}
                  placeholder="أدخل الكمية"
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
                  <Label className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    التعليقات (1 لكل سطر)
                  </Label>
                  <Textarea
                    placeholder="أدخل التعليقات هنا، كل تعليق في سطر منفصل..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    أدخل تعليقاً واحداً في كل سطر. عدد التعليقات يجب أن يتناسب مع الكمية المطلوبة.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card variant="elevated" className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                ملخص الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الخدمة</span>
                  <span className="font-medium text-left max-w-[60%] truncate">
                    {selectedServiceData?.name_ar || selectedServiceData?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">الكمية</span>
                  <span className="font-medium">{quantityNum.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">سعر الألف</span>
                  <span className="font-medium">
                    {format(selectedServiceData?.price || 0)}
                  </span>
                </div>
                {selectedServiceData?.delivery_time && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">وقت التنفيذ</span>
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {selectedServiceData.delivery_time}
                    </span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-medium">الإجمالي</span>
                    <span className="text-xl font-bold text-primary">
                      {format(totalPriceUSD)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">رصيدك الحالي</span>
                  <span className={`font-bold ${canAfford ? "text-green-500" : "text-destructive"}`}>
                    {format(userBalanceUSD)}
                  </span>
                </div>
                {!canAfford && totalPriceUSD > 0 && (
                  <p className="text-xs text-destructive mt-2">
                    رصيدك غير كافٍ. تحتاج {format(totalPriceUSD - userBalanceUSD)} إضافي
                  </p>
                )}
              </div>

              <Button 
                className="w-full" 
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
