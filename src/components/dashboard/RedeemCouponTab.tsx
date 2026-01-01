import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Gift, Ticket, CheckCircle2, Loader2 } from 'lucide-react';

const RedeemCouponTab = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [redeemed, setRedeemed] = useState(false);
  const [redeemedAmount, setRedeemedAmount] = useState(0);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!couponCode.trim()) {
      toast.error('يرجى إدخال كود الكوبون');
      return;
    }

    if (!user || !profile) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }

    setLoading(true);

    try {
      // Find the coupon
      const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('coupon_type', 'balance')
        .eq('is_active', true)
        .maybeSingle();

      if (couponError) throw couponError;

      if (!coupon) {
        toast.error('الكوبون غير صالح أو منتهي الصلاحية');
        return;
      }

      // Check expiration
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast.error('انتهت صلاحية هذا الكوبون');
        return;
      }

      // Check start date
      if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
        toast.error('هذا الكوبون غير متاح بعد');
        return;
      }

      // Check max uses
      if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
        toast.error('تم استنفاذ عدد استخدامات هذا الكوبون');
        return;
      }

      // Check if user already used this coupon
      const { data: existingUsage, error: usageError } = await supabase
        .from('coupon_usage')
        .select('id')
        .eq('coupon_id', coupon.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (usageError) throw usageError;

      if (existingUsage) {
        toast.error('لقد استخدمت هذا الكوبون من قبل');
        return;
      }

      const balanceAmount = coupon.balance_amount || 0;
      const newBalance = (profile.balance || 0) + balanceAmount;

      // Update user balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Record coupon usage
      const { error: recordError } = await supabase
        .from('coupon_usage')
        .insert({
          coupon_id: coupon.id,
          user_id: user.id,
          amount: balanceAmount,
        });

      if (recordError) throw recordError;

      // Increment uses_count on coupon
      const { error: incrementError } = await supabase
        .from('coupons')
        .update({ uses_count: coupon.uses_count + 1 })
        .eq('id', coupon.id);

      if (incrementError) throw incrementError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'bonus',
          amount: balanceAmount,
          balance_before: profile.balance || 0,
          balance_after: newBalance,
          description: `شحن رصيد بكوبون: ${coupon.code}`,
          payment_method: 'coupon',
          payment_reference: coupon.code,
        });

      if (transactionError) throw transactionError;

      // Success
      setRedeemed(true);
      setRedeemedAmount(balanceAmount);
      setCouponCode('');
      refreshProfile();
      toast.success(`تم شحن رصيدك بمبلغ $${balanceAmount}`);

      // Reset success state after 5 seconds
      setTimeout(() => {
        setRedeemed(false);
        setRedeemedAmount(0);
      }, 5000);

    } catch (error) {
      console.error('Error redeeming coupon:', error);
      toast.error('حدث خطأ أثناء استخدام الكوبون');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">استخدام كوبون</h2>
        <p className="text-muted-foreground">أدخل كود الكوبون لشحن رصيدك</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Redeem Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5" />
              كوبون الشحن
            </CardTitle>
            <CardDescription>
              أدخل كود الكوبون الخاص بك لإضافة رصيد إلى حسابك
            </CardDescription>
          </CardHeader>
          <CardContent>
            {redeemed ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">تم الشحن بنجاح!</h3>
                <p className="text-muted-foreground mb-4">
                  تمت إضافة <span className="text-green-500 font-bold">${redeemedAmount}</span> إلى رصيدك
                </p>
                <Button variant="outline" onClick={() => setRedeemed(false)}>
                  استخدام كوبون آخر
                </Button>
              </div>
            ) : (
              <form onSubmit={handleRedeem} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="أدخل كود الكوبون"
                    className="text-center text-lg font-mono tracking-wider"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading || !couponCode.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري التحقق...
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4 ml-2" />
                      استخدام الكوبون
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5" />
              معلومات مهمة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <p>الكوبونات صالحة للاستخدام مرة واحدة فقط لكل حساب</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <p>تحقق من تاريخ صلاحية الكوبون قبل الاستخدام</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <p>الرصيد المضاف سيظهر فوراً في حسابك</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                <p>في حال وجود مشكلة، تواصل مع الدعم الفني</p>
              </div>
            </div>

            {/* Current Balance */}
            <div className="mt-6 p-4 rounded-xl bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">رصيدك الحالي</p>
              <p className="text-3xl font-bold text-primary">
                ${(profile?.balance || 0).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RedeemCouponTab;
