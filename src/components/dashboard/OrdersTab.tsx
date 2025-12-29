import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Search, Filter, Eye, RotateCcw } from "lucide-react";

type OrderStatus = "completed" | "processing" | "pending" | "failed";

interface Order {
  id: string;
  service: string;
  platform: string;
  quantity: number;
  price: number;
  status: OrderStatus;
  link: string;
  startCount: number;
  currentCount: number;
  date: string;
}

const orders: Order[] = [
  {
    id: "1234",
    service: "متابعين انستجرام حقيقيين",
    platform: "انستجرام",
    quantity: 1000,
    price: 0.99,
    status: "completed",
    link: "instagram.com/user123",
    startCount: 5000,
    currentCount: 6000,
    date: "2024-01-15 14:30",
  },
  {
    id: "1233",
    service: "مشاهدات تيك توك سريعة",
    platform: "تيك توك",
    quantity: 5000,
    price: 2.49,
    status: "processing",
    link: "tiktok.com/@user/video/123",
    startCount: 1000,
    currentCount: 3500,
    date: "2024-01-15 12:00",
  },
  {
    id: "1232",
    service: "لايكات انستجرام",
    platform: "انستجرام",
    quantity: 500,
    price: 0.49,
    status: "completed",
    link: "instagram.com/p/abc123",
    startCount: 200,
    currentCount: 700,
    date: "2024-01-14 18:45",
  },
  {
    id: "1231",
    service: "متابعين تويتر",
    platform: "تويتر",
    quantity: 2000,
    price: 2.99,
    status: "pending",
    link: "twitter.com/user456",
    startCount: 1500,
    currentCount: 1500,
    date: "2024-01-14 10:20",
  },
  {
    id: "1230",
    service: "مشتركين يوتيوب",
    platform: "يوتيوب",
    quantity: 100,
    price: 2.99,
    status: "failed",
    link: "youtube.com/@channel",
    startCount: 500,
    currentCount: 500,
    date: "2024-01-13 09:00",
  },
];

const statusConfig: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  completed: { label: "مكتمل", variant: "default" },
  processing: { label: "قيد التنفيذ", variant: "secondary" },
  pending: { label: "في الانتظار", variant: "outline" },
  failed: { label: "فشل", variant: "destructive" },
};

const OrdersTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.includes(searchQuery) ||
      order.service.includes(searchQuery) ||
      order.link.includes(searchQuery);
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
            <CardTitle>سجل الطلبات</CardTitle>
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
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="processing">قيد التنفيذ</SelectItem>
                  <SelectItem value="pending">في الانتظار</SelectItem>
                  <SelectItem value="failed">فشل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                  const progress = Math.round(
                    ((order.currentCount - order.startCount) / order.quantity) * 100
                  );
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">#{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.service}</p>
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
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs">{progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[order.status].variant}>
                          {statusConfig[order.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.date}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" title="عرض التفاصيل">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {order.status === "failed" && (
                            <Button variant="ghost" size="icon" title="إعادة المحاولة">
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد طلبات مطابقة للبحث</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersTab;
