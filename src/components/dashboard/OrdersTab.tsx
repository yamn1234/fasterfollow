import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Filter, Eye, Loader2, ShoppingBag, ExternalLink } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ar } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Order {
  id: string;
  link: string;
  quantity: number;
  price: number;
  status: string;
  start_count: number | null;
  remains: number | null;
  created_at: string;
  completed_at: string | null;
  service: {
    name: string;
    name_ar: string | null;
  } | null;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "في الانتظار", variant: "outline" },
  processing: { label: "قيد المعالجة", variant: "secondary" },
  in_progress: { label: "قيد التنفيذ", variant: "secondary" },
  completed: { label: "مكتمل", variant: "default" },
  partial: { label: "جزئي", variant: "outline" },
  cancelled: { label: "ملغي", variant: "destructive" },
  refunded: { label: "مسترد", variant: "outline" },
  failed: { label: "فشل", variant: "destructive" },
};

const OrdersTab = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          link,
          quantity,
          price,
          status,
          start_count,
          remains,
          created_at,
          completed_at,
          service:services(name, name_ar)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.service?.name_ar || order.service?.name || "").includes(searchQuery) ||
      order.link.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getProgress = (order: Order) => {
    if (order.status === "completed") return 100;
    if (order.remains === null || order.start_count === null) return 0;
    const delivered = order.quantity - order.remains;
    return Math.min(Math.round((delivered / order.quantity) * 100), 100);
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
        <h1 className="text-2xl md:text-3xl font-bold">طلباتي</h1>
        <p className="text-muted-foreground mt-1">
          تتبع جميع طلباتك وحالتها
        </p>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>سجل الطلبات ({orders.length})</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث برقم الطلب أو الخدمة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="partial">جزئي</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mobile View */}
          <div className="md:hidden space-y-3">
            {filteredOrders.map((order) => {
              const progress = getProgress(order);
              const config = statusConfig[order.status || "pending"];
              return (
                <div 
                  key={order.id} 
                  className="p-4 rounded-lg bg-secondary/50 space-y-3"
                  onClick={() => setSelectedOrder(order)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">
                        {order.service?.name_ar || order.service?.name || "خدمة محذوفة"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">الكمية: {order.quantity.toLocaleString()}</span>
                    <span className="font-medium">${order.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs">{progress}%</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم الطلب</TableHead>
                  <TableHead className="text-right">الخدمة</TableHead>
                  <TableHead className="text-right">الكمية</TableHead>
                  <TableHead className="text-right">السعر</TableHead>
                  <TableHead className="text-right">التقدم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const progress = getProgress(order);
                  const config = statusConfig[order.status || "pending"];
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {order.service?.name_ar || order.service?.name || "خدمة محذوفة"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {order.link}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{order.quantity.toLocaleString()}</TableCell>
                      <TableCell>${order.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={config.variant}>{config.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ar })}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="عرض التفاصيل"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {orders.length === 0 ? "لا توجد طلبات بعد" : "لا توجد طلبات مطابقة للبحث"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تفاصيل الطلب</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">رقم الطلب</p>
                  <p className="font-medium">#{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  <Badge variant={statusConfig[selectedOrder.status || "pending"].variant}>
                    {statusConfig[selectedOrder.status || "pending"].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الكمية</p>
                  <p className="font-medium">{selectedOrder.quantity.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">السعر</p>
                  <p className="font-medium">${selectedOrder.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">البداية</p>
                  <p className="font-medium">{selectedOrder.start_count?.toLocaleString() || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">المتبقي</p>
                  <p className="font-medium">{selectedOrder.remains?.toLocaleString() || "-"}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الخدمة</p>
                <p className="font-medium">
                  {selectedOrder.service?.name_ar || selectedOrder.service?.name || "خدمة محذوفة"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الرابط</p>
                <a 
                  href={selectedOrder.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                >
                  {selectedOrder.link.length > 40 
                    ? selectedOrder.link.slice(0, 40) + "..." 
                    : selectedOrder.link}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                <p className="font-medium">
                  {format(new Date(selectedOrder.created_at), "yyyy/MM/dd - HH:mm", { locale: ar })}
                </p>
              </div>
              {selectedOrder.completed_at && (
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإكمال</p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.completed_at), "yyyy/MM/dd - HH:mm", { locale: ar })}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersTab;
