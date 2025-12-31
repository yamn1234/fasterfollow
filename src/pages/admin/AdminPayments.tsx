import { useState, useEffect } from 'react';
import {
  Search,
  Download,
  CreditCard,
  DollarSign,
  TrendingUp,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  payment_method: string | null;
  created_at: string;
}

interface PaymentGateway {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  fee_percentage: number;
  fee_fixed: number;
  min_amount: number;
  max_amount: number;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  uses_count: number;
  max_uses: number | null;
  expires_at: string | null;
}

const AdminPayments = () => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, gatewaysRes, couponsRes] = await Promise.all([
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('payment_gateways').select('*').order('sort_order'),
        supabase.from('coupons').select('*').order('created_at', { ascending: false }),
      ]);

      setTransactions(transRes.data || []);
      setGateways(gatewaysRes.data || []);
      setCoupons(couponsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في جلب البيانات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const typeConfig: Record<string, { label: string; color: string }> = {
    deposit: { label: 'إيداع', color: 'bg-green-500/10 text-green-500' },
    purchase: { label: 'شراء', color: 'bg-blue-500/10 text-blue-500' },
    refund: { label: 'استرداد', color: 'bg-cyan-500/10 text-cyan-500' },
    bonus: { label: 'مكافأة', color: 'bg-purple-500/10 text-purple-500' },
    manual: { label: 'يدوي', color: 'bg-yellow-500/10 text-yellow-500' },
    referral: { label: 'إحالة', color: 'bg-pink-500/10 text-pink-500' },
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch = t.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalDeposits = transactions
    .filter((t) => t.type === 'deposit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPurchases = transactions
    .filter((t) => t.type === 'purchase')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">المدفوعات</h1>
          <p className="text-muted-foreground">إدارة المعاملات وبوابات الدفع</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 ml-2" />
          تصدير التقرير
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-green-500/10">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الإيداعات</p>
                <p className="text-2xl font-bold">${totalDeposits.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <DollarSign className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
                <p className="text-2xl font-bold">${totalPurchases.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">بوابات نشطة</p>
                <p className="text-2xl font-bold">
                  {gateways.filter((g) => g.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <CheckCircle className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">كوبونات نشطة</p>
                <p className="text-2xl font-bold">
                  {coupons.filter((c) => c.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">المعاملات</TabsTrigger>
          <TabsTrigger value="gateways">بوابات الدفع</TabsTrigger>
          <TabsTrigger value="coupons">الكوبونات</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="نوع المعاملة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم المعاملة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الرصيد قبل</TableHead>
                    <TableHead>الرصيد بعد</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>التاريخ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        لا توجد معاملات
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((trans) => (
                      <TableRow key={trans.id}>
                        <TableCell className="font-mono text-sm">
                          #{trans.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <Badge className={typeConfig[trans.type]?.color || ''}>
                            {typeConfig[trans.type]?.label || trans.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span
                            className={
                              trans.amount >= 0 ? 'text-green-500' : 'text-destructive'
                            }
                          >
                            {trans.amount >= 0 ? '+' : ''}${trans.amount.toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>${trans.balance_before.toFixed(2)}</TableCell>
                        <TableCell>${trans.balance_after.toFixed(2)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {trans.description || '-'}
                        </TableCell>
                        <TableCell>
                          {format(new Date(trans.created_at), 'dd MMM HH:mm', {
                            locale: ar,
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gateways" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>البوابة</TableHead>
                    <TableHead>الرسوم</TableHead>
                    <TableHead>الحد الأدنى</TableHead>
                    <TableHead>الحد الأقصى</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gateways.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        لا توجد بوابات دفع
                      </TableCell>
                    </TableRow>
                  ) : (
                    gateways.map((gateway) => (
                      <TableRow key={gateway.id}>
                        <TableCell className="font-medium">{gateway.name}</TableCell>
                        <TableCell>
                          {gateway.fee_percentage}% + ${gateway.fee_fixed}
                        </TableCell>
                        <TableCell>${gateway.min_amount}</TableCell>
                        <TableCell>${gateway.max_amount}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              gateway.is_active
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-gray-500/10 text-gray-500'
                            }
                          >
                            {gateway.is_active ? 'نشط' : 'معطل'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الكود</TableHead>
                    <TableHead>الخصم</TableHead>
                    <TableHead>الاستخدام</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        لا توجد كوبونات
                      </TableCell>
                    </TableRow>
                  ) : (
                    coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell className="font-mono font-bold">
                          {coupon.code}
                        </TableCell>
                        <TableCell>
                          {coupon.discount_type === 'percentage'
                            ? `${coupon.discount_value}%`
                            : `$${coupon.discount_value}`}
                        </TableCell>
                        <TableCell>
                          {coupon.uses_count} / {coupon.max_uses || '∞'}
                        </TableCell>
                        <TableCell>
                          {coupon.expires_at
                            ? format(new Date(coupon.expires_at), 'dd MMM yyyy', {
                                locale: ar,
                              })
                            : 'غير محدد'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              coupon.is_active
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-gray-500/10 text-gray-500'
                            }
                          >
                            {coupon.is_active ? 'نشط' : 'معطل'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPayments;
