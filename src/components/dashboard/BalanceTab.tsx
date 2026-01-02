import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Wallet, 
  CreditCard, 
  Gift, 
  Sparkles,
  CheckCircle,
  Info,
  ExternalLink,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentGateway {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  fee_percentage: number;
  fee_fixed: number;
  min_amount: number;
  max_amount: number;
  redirect_url: string | null;
  instructions: string | null;
  instructions_ar: string | null;
  gateway_type: string | null;
}

const presetAmounts = [5, 10, 25, 50, 100];

const bonusRates = [
  { min: 10, bonus: 5 },
  { min: 25, bonus: 10 },
  { min: 50, bonus: 15 },
  { min: 100, bonus: 20 },
];

const BalanceTab = () => {
  const { user, refreshProfile } = useAuth();
  const [amount, setAmount] = useState<string>("10");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    fetchGateways();
  }, []);

  const fetchGateways = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      
      setGateways(data || []);
      if (data && data.length > 0) {
        setPaymentMethod(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching gateways:', error);
      toast.error('حدث خطأ في جلب طرق الدفع');
    } finally {
      setLoading(false);
    }
  };

  const numericAmount = parseFloat(amount) || 0;
  const bonusRate = bonusRates.find((r) => numericAmount >= r.min)?.bonus || 0;
  const bonusAmount = (numericAmount * bonusRate) / 100;
  const totalAmount = numericAmount + bonusAmount;

  const selectedGateway = gateways.find(g => g.id === paymentMethod);

  const handlePayPalPayment = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }

    setProcessingPayment(true);
    
    try {
      const returnUrl = `${window.location.origin}/dashboard?tab=balance&paypal=success`;
      const cancelUrl = `${window.location.origin}/dashboard?tab=balance&paypal=cancel`;

      const { data, error } = await supabase.functions.invoke('paypal-create-order', {
        body: {
          amount: numericAmount,
          userId: user.id,
          returnUrl,
          cancelUrl,
        },
      });

      if (error) throw error;

      if (data?.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("لم يتم الحصول على رابط الدفع");
      }
    } catch (error) {
      console.error("PayPal error:", error);
      toast.error("حدث خطأ في إنشاء طلب الدفع");
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedGateway) {
      toast.error("يرجى اختيار طريقة الدفع");
      return;
    }
    
    if (numericAmount < selectedGateway.min_amount) {
      toast.error(`الحد الأدنى للشحن هو $${selectedGateway.min_amount}`);
      return;
    }

    if (numericAmount > selectedGateway.max_amount) {
      toast.error(`الحد الأقصى للشحن هو $${selectedGateway.max_amount}`);
      return;
    }

    // PayPal payment
    if (selectedGateway.slug === 'paypal') {
      await handlePayPalPayment();
      return;
    }

    // إذا كانت طريقة دفع يدوية مع رابط توجيه
    if (selectedGateway.gateway_type === 'manual' && selectedGateway.redirect_url) {
      window.open(selectedGateway.redirect_url, '_blank');
      toast.success('تم فتح صفحة الدفع في نافذة جديدة');
      return;
    }

    toast.success(`تم إرسال طلب شحن بقيمة $${numericAmount.toFixed(2)}`);
  };

  // Handle PayPal return
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paypalStatus = urlParams.get('paypal');
    const token = urlParams.get('token');

    if (paypalStatus === 'success' && token && user) {
      // Capture the payment
      const capturePayment = async () => {
        setProcessingPayment(true);
        try {
          const { data, error } = await supabase.functions.invoke('paypal-capture-order', {
            body: {
              orderId: token,
              userId: user.id,
            },
          });

          if (error) throw error;

          if (data?.success) {
            toast.success(`تم شحن رصيدك بنجاح! المبلغ: $${data.capturedAmount}`);
            refreshProfile();
          } else {
            throw new Error("فشل في إتمام الدفع");
          }
        } catch (error) {
          console.error("Capture error:", error);
          toast.error("حدث خطأ في إتمام الدفع");
        } finally {
          setProcessingPayment(false);
          // Clean URL
          window.history.replaceState({}, '', '/dashboard?tab=balance');
        }
      };

      capturePayment();
    } else if (paypalStatus === 'cancel') {
      toast.error("تم إلغاء عملية الدفع");
      window.history.replaceState({}, '', '/dashboard?tab=balance');
    }
  }, [user, refreshProfile]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">شحن الرصيد</h1>
        <p className="text-muted-foreground mt-1">
          اشحن رصيدك واحصل على مكافآت إضافية
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Amount Selection */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                اختر المبلغ
              </CardTitle>
              <CardDescription>
                {selectedGateway 
                  ? `الحد الأدنى $${selectedGateway.min_amount} - الحد الأقصى $${selectedGateway.max_amount}`
                  : 'اختر طريقة الدفع أولاً'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant={amount === String(preset) ? "default" : "outline"}
                    onClick={() => setAmount(String(preset))}
                    className="h-12"
                  >
                    ${preset}
                  </Button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pr-8 text-lg font-bold h-12"
                  placeholder="أدخل المبلغ"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                طريقة الدفع
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : gateways.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد طرق دفع متاحة حالياً
                </div>
              ) : (
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  {gateways.map((gateway) => (
                    <Label
                      key={gateway.id}
                      htmlFor={gateway.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        paymentMethod === gateway.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <RadioGroupItem value={gateway.id} id={gateway.id} />
                      <span className="text-2xl">
                        {gateway.gateway_type === 'manual' ? '🔗' : '💳'}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium">{gateway.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {gateway.gateway_type === 'manual' ? 'دفع يدوي' : 'دفع تلقائي'}
                          {gateway.fee_percentage > 0 && ` • رسوم ${gateway.fee_percentage}%`}
                          {gateway.fee_fixed > 0 && ` + $${gateway.fee_fixed}`}
                        </p>
                        {gateway.instructions_ar && paymentMethod === gateway.id && (
                          <p className="text-sm text-primary mt-2 bg-primary/10 p-2 rounded">
                            {gateway.instructions_ar}
                          </p>
                        )}
                      </div>
                      {paymentMethod === gateway.id && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          {/* Bonus Info */}
          <Card className="gradient-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Gift className="h-8 w-8" />
                <div>
                  <p className="font-bold text-lg">مكافآت الشحن</p>
                  <p className="text-sm opacity-80">اشحن أكثر واحصل على المزيد</p>
                </div>
              </div>
              <div className="space-y-2">
                {bonusRates.map((rate) => (
                  <div
                    key={rate.min}
                    className={`flex justify-between text-sm p-2 rounded ${
                      numericAmount >= rate.min ? "bg-primary-foreground/20" : "opacity-60"
                    }`}
                  >
                    <span>${rate.min}+</span>
                    <span className="font-bold">+{rate.bonus}% مكافأة</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المبلغ</span>
                <span className="font-medium">${numericAmount.toFixed(2)}</span>
              </div>
              {selectedGateway && (selectedGateway.fee_percentage > 0 || selectedGateway.fee_fixed > 0) && (
                <div className="flex justify-between text-muted-foreground">
                  <span>رسوم الدفع</span>
                  <span>
                    ${((numericAmount * selectedGateway.fee_percentage / 100) + selectedGateway.fee_fixed).toFixed(2)}
                  </span>
                </div>
              )}
              {bonusAmount > 0 && (
                <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4" />
                    مكافأة {bonusRate}%
                  </span>
                  <span className="font-medium">+${bonusAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border pt-4 flex justify-between">
                <span className="font-bold">الإجمالي</span>
                <span className="font-bold text-xl text-gradient">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full mt-4"
                onClick={handleSubmit}
                disabled={numericAmount < 1 || !selectedGateway || loading || processingPayment}
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري المعالجة...
                  </>
                ) : selectedGateway?.slug === 'paypal' ? (
                  <>
                    <CreditCard className="h-5 w-5" />
                    الدفع عبر PayPal
                  </>
                ) : selectedGateway?.gateway_type === 'manual' && selectedGateway?.redirect_url ? (
                  <>
                    <ExternalLink className="h-5 w-5" />
                    الذهاب للدفع
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    شحن الآن
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
                <Info className="h-3 w-3" />
                جميع المعاملات آمنة ومشفرة
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BalanceTab;
