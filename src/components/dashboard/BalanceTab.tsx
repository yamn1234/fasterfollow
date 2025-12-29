import { useState } from "react";
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
  Info
} from "lucide-react";
import { toast } from "sonner";

const paymentMethods = [
  {
    id: "paypal",
    name: "PayPal",
    icon: "💳",
    description: "الدفع عبر حساب PayPal",
  },
  {
    id: "card",
    name: "بطاقة ائتمان",
    icon: "💎",
    description: "Visa, Mastercard, Amex",
  },
  {
    id: "vodafone",
    name: "فودافون كاش",
    icon: "📱",
    description: "الدفع عبر فودافون كاش",
  },
];

const presetAmounts = [5, 10, 25, 50, 100];

const bonusRates = [
  { min: 10, bonus: 5 },
  { min: 25, bonus: 10 },
  { min: 50, bonus: 15 },
  { min: 100, bonus: 20 },
];

const BalanceTab = () => {
  const [amount, setAmount] = useState<string>("10");
  const [paymentMethod, setPaymentMethod] = useState("paypal");

  const numericAmount = parseFloat(amount) || 0;
  const bonusRate = bonusRates.find((r) => numericAmount >= r.min)?.bonus || 0;
  const bonusAmount = (numericAmount * bonusRate) / 100;
  const totalAmount = numericAmount + bonusAmount;

  const handleSubmit = () => {
    if (numericAmount < 1) {
      toast.error("الحد الأدنى للشحن هو $1");
      return;
    }
    toast.success(`تم إرسال طلب شحن بقيمة $${numericAmount.toFixed(2)}`);
  };

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
                الحد الأدنى للشحن هو $1 فقط
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
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="space-y-3"
              >
                {paymentMethods.map((method) => (
                  <Label
                    key={method.id}
                    htmlFor={method.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    }`}
                  >
                    <RadioGroupItem value={method.id} id={method.id} />
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{method.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                    {paymentMethod === method.id && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </Label>
                ))}
              </RadioGroup>
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
                disabled={numericAmount < 1}
              >
                <CreditCard className="h-5 w-5" />
                شحن الآن
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
