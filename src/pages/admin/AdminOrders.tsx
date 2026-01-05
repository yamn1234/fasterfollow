import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  MoreVertical,
  Download,
  RefreshCw,
  Eye,
  Pencil,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

type OrderStatus = 'pending' | 'processing' | 'in_progress' | 'completed' | 'partial' | 'cancelled' | 'refunded' | 'failed';

interface Order {
  id: string;
  user_id: string;
  service_id: string;
  quantity: number;
  price: number;
  link: string;
  status: OrderStatus;
  start_count: number | null;
  remains: number | null;
  external_order_id: string | null;
  created_at: string;
  updated_at: string;
  service?: { name: string };
  profile?: { full_name: string };
}

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [placingOrder, setPlacingOrder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [startCount, setStartCount] = useState('');
  const [remains, setRemains] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Fetch orders first
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch services and profiles separately to avoid RLS issues
      const ordersWithDetails = await Promise.all(
        (ordersData || []).map(async (order) => {
          // Get service name
          const { data: serviceData } = await supabase
            .from('services')
            .select('name')
            .eq('id', order.service_id)
            .maybeSingle();

          // Get profile name
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', order.user_id)
            .maybeSingle();

          return {
            ...order,
            services: serviceData,
            profiles: profileData,
          };
        })
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في جلب الطلبات',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;

    try {
      const updateData: any = { status: newStatus };
      if (startCount) updateData.start_count = parseInt(startCount);
      if (remains) updateData.remains = parseInt(remains);
      if (newStatus === 'completed') updateData.completed_at = new Date().toISOString();

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث حالة الطلب',
      });

      setUpdateDialogOpen(false);
      fetchOrders();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في تحديث الطلب',
        variant: 'destructive',
      });
    }
  };

  const handleRefund = async (order: Order) => {
    try {
      await supabase
        .from('orders')
        .update({ status: 'refunded' })
        .eq('id', order.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', order.user_id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ balance: profile.balance + order.price })
          .eq('user_id', order.user_id);

        await supabase.from('transactions').insert({
          user_id: order.user_id,
          order_id: order.id,
          type: 'refund',
          amount: order.price,
          balance_before: profile.balance,
          balance_after: profile.balance + order.price,
          description: `استرداد طلب #${order.id.slice(0, 8)}`,
        });
      }

      toast({
        title: 'تم بنجاح',
        description: 'تم استرداد الطلب وإضافة الرصيد',
      });

      fetchOrders();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في استرداد الطلب',
        variant: 'destructive',
      });
    }
  };

  const handlePlaceOrder = async (order: Order) => {
    setPlacingOrder(order.id);
    try {
      const response = await supabase.functions.invoke('smm-place-order', {
        body: { orderId: order.id },
      });

      if (response.error) throw response.error;

      const result = response.data;
      if (result.success) {
        toast({
          title: 'تم بنجاح',
          description: result.message,
        });
        fetchOrders();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ في إرسال الطلب',
        variant: 'destructive',
      });
    } finally {
      setPlacingOrder(null);
    }
  };

  const handleSyncAllStatuses = async () => {
    setSyncing(true);
    try {
      const response = await supabase.functions.invoke('smm-check-order-status', {
        body: { checkAll: true },
      });

      if (response.error) throw response.error;

      const result = response.data;
      if (result.success) {
        toast({
          title: 'تم بنجاح',
          description: result.message,
        });
        fetchOrders();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ في مزامنة الحالات',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.link.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'معلق', color: 'bg-yellow-500/10 text-yellow-500', icon: Clock },
    processing: { label: 'قيد المعالجة', color: 'bg-blue-500/10 text-blue-500', icon: Loader2 },
    in_progress: { label: 'قيد التنفيذ', color: 'bg-purple-500/10 text-purple-500', icon: RefreshCw },
    completed: { label: 'مكتمل', color: 'bg-green-500/10 text-green-500', icon: CheckCircle },
    partial: { label: 'جزئي', color: 'bg-orange-500/10 text-orange-500', icon: AlertCircle },
    cancelled: { label: 'ملغي', color: 'bg-gray-500/10 text-gray-500', icon: XCircle },
    refunded: { label: 'مسترد', color: 'bg-cyan-500/10 text-cyan-500', icon: RotateCcw },
    failed: { label: 'فشل', color: 'bg-destructive/10 text-destructive', icon: XCircle },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">إدارة الطلبات</h1>
          <p className="text-muted-foreground">إدارة وتتبع جميع الطلبات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchOrders}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تحديث
          </Button>
          <Button 
            variant="outline" 
            onClick={handleSyncAllStatuses}
            disabled={syncing}
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 ml-2" />
            )}
            مزامنة الحالات
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'إجمالي الطلبات', value: orders.length, color: 'primary' },
          { label: 'معلقة', value: orders.filter(o => o.status === 'pending').length, color: 'warning' },
          { label: 'قيد التنفيذ', value: orders.filter(o => ['processing', 'in_progress'].includes(o.status)).length, color: 'info' },
          { label: 'مكتملة', value: orders.filter(o => o.status === 'completed').length, color: 'success' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="بحث برقم الطلب أو الرابط..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="تصفية حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الطلب</TableHead>
                  <TableHead>رقم الطلب الخارجي</TableHead>
                  <TableHead>الخدمة</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>البداية / المتبقي</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead className="text-left">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      لا توجد طلبات
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const status = statusConfig[order.status];
                    const StatusIcon = status.icon;
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="font-mono text-sm">#{order.id.slice(0, 8)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm text-muted-foreground">
                            {order.external_order_id || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium truncate max-w-[200px]">
                              {(order as any).services?.name || 'غير محدد'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {order.link}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{order.quantity.toLocaleString()}</TableCell>
                        <TableCell>${order.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={`${status.color} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {order.start_count || '-'} / {order.remains || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), 'dd MMM HH:mm', { locale: ar })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>إجراءات</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 ml-2" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setNewStatus(order.status);
                                  setStartCount(order.start_count?.toString() || '');
                                  setRemains(order.remains?.toString() || '');
                                  setUpdateDialogOpen(true);
                                }}
                              >
                                <Pencil className="w-4 h-4 ml-2" />
                                تحديث الحالة
                              </DropdownMenuItem>
                              {order.status === 'pending' && !order.external_order_id && (
                                <DropdownMenuItem
                                  onClick={() => handlePlaceOrder(order)}
                                  disabled={placingOrder === order.id}
                                >
                                  {placingOrder === order.id ? (
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-4 h-4 ml-2" />
                                  )}
                                  إرسال للمزود
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <RefreshCw className="w-4 h-4 ml-2" />
                                إعادة التعبئة
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleRefund(order)}
                              >
                                <RotateCcw className="w-4 h-4 ml-2" />
                                استرداد
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              عرض {filteredOrders.length} من {orders.length} طلب
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" disabled>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="icon" disabled>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحديث حالة الطلب</DialogTitle>
            <DialogDescription>
              طلب #{selectedOrder?.id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الحالة الجديدة</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>العدد الأولي</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={startCount}
                  onChange={(e) => setStartCount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>المتبقي</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={remains}
                  onChange={(e) => setRemains(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleStatusUpdate}>
              تحديث
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
