import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ArrowUpLeft,
  Plus
} from "lucide-react";

const stats = [
  {
    title: "الرصيد الحالي",
    value: "$25.50",
    icon: Wallet,
    trend: "+$10.00 هذا الشهر",
    trendUp: true,
  },
  {
    title: "إجمالي الطلبات",
    value: "47",
    icon: ShoppingBag,
    trend: "+12 هذا الشهر",
    trendUp: true,
  },
  {
    title: "طلبات مكتملة",
    value: "42",
    icon: CheckCircle,
    trend: "89% نسبة الإكمال",
    trendUp: true,
  },
  {
    title: "طلبات قيد التنفيذ",
    value: "5",
    icon: Clock,
    trend: "متوقع الانتهاء خلال ساعة",
    trendUp: false,
  },
];

const recentOrders = [
  {
    id: "#1234",
    service: "متابعين انستجرام",
    quantity: 1000,
    status: "مكتمل",
    statusColor: "bg-green-500",
    date: "منذ ساعة",
  },
  {
    id: "#1233",
    service: "مشاهدات تيك توك",
    quantity: 5000,
    status: "قيد التنفيذ",
    statusColor: "bg-yellow-500",
    date: "منذ 3 ساعات",
  },
  {
    id: "#1232",
    service: "لايكات انستجرام",
    quantity: 500,
    status: "مكتمل",
    statusColor: "bg-green-500",
    date: "أمس",
  },
  {
    id: "#1231",
    service: "متابعين تيك توك",
    quantity: 2000,
    status: "مكتمل",
    statusColor: "bg-green-500",
    date: "منذ يومين",
  },
];

const quickActions = [
  { label: "شحن الرصيد", icon: Plus },
  { label: "طلب جديد", icon: ShoppingBag },
];

const OverviewTab = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">مرحباً، أحمد! 👋</h1>
          <p className="text-muted-foreground mt-1">
            إليك ملخص نشاطك في متجر المتابعين
          </p>
        </div>
        <div className="flex gap-3">
          {quickActions.map((action) => (
            <Button key={action.label} variant="hero">
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} variant="elevated">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1">{stat.value}</p>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${
                    stat.trendUp ? "text-green-600" : "text-muted-foreground"
                  }`}>
                    {stat.trendUp && <TrendingUp className="h-3 w-3" />}
                    {stat.trend}
                  </p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card variant="elevated">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>آخر الطلبات</CardTitle>
          <Button variant="ghost" size="sm" className="gap-1">
            عرض الكل
            <ArrowUpLeft className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{order.service}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.id} • {order.quantity.toLocaleString()} وحدة
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${order.statusColor}`} />
                    <span className="text-sm font-medium">{order.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
