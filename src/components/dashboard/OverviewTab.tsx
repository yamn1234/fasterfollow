import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wallet, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  ArrowUpLeft,
  Plus,
  Loader2,
  Zap
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Order {
  id: string;
  quantity: number;
  status: string;
  created_at: string;
  service: {
    name: string;
    name_ar: string | null;
  } | null;
}

interface OrderStats {
  total: number;
  completed: number;
  inProgress: number;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: "في الانتظار", color: "bg-yellow-500" },
  processing: { label: "قيد المعالجة", color: "bg-blue-500" },
  in_progress: { label: "قيد التنفيذ", color: "bg-orange-500" },
  completed: { label: "مكتمل", color: "bg-green-500" },
  partial: { label: "جزئي", color: "bg-purple-500" },
  cancelled: { label: "ملغي", color: "bg-gray-500" },
  refunded: { label: "مسترد", color: "bg-blue-400" },
  failed: { label: "فشل", color: "bg-red-500" },
};

interface OverviewTabProps {
  onNavigate?: (tab: string) => void;
}

const OverviewTab = ({ onNavigate }: OverviewTabProps) => {
  const { profile, user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({ total: 0, completed: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch recent orders with service info
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select(`
          id,
          quantity,
          status,
          created_at,
          service:services(name, name_ar)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (ordersError) throw ordersError;

      // Fetch order stats
      const { data: allOrders, error: statsError } = await supabase
        .from("orders")
        .select("status")
        .eq("user_id", user?.id);

      if (statsError) throw statsError;

      const total = allOrders?.length || 0;
      const completed = allOrders?.filter(o => o.status === "completed").length || 0;
      const inProgress = allOrders?.filter(o => 
        ["pending", "processing", "in_progress"].includes(o.status || "")
      ).length || 0;

      setRecentOrders(ordersData || []);
      setStats({ total, completed, inProgress });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const firstName = profile?.full_name?.split(" ")[0] || "المستخدم";
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const statsData = [
    {
      title: "الرصيد الحالي",
      value: `$${profile?.balance?.toFixed(2) || "0.00"}`,
      icon: Wallet,
      trend: "رصيدك المتاح للشراء",
      trendUp: (profile?.balance || 0) > 0,
    },
    {
      title: "إجمالي الطلبات",
      value: stats.total.toString(),
      icon: ShoppingBag,
      trend: stats.total > 0 ? `${stats.total} طلب حتى الآن` : "ابدأ طلبك الأول",
      trendUp: stats.total > 0,
    },
    {
      title: "طلبات مكتملة",
      value: stats.completed.toString(),
      icon: CheckCircle,
      trend: `${completionRate}% نسبة الإكمال`,
      trendUp: completionRate > 50,
    },
    {
      title: "طلبات قيد التنفيذ",
      value: stats.inProgress.toString(),
      icon: Clock,
      trend: stats.inProgress > 0 ? `${stats.inProgress} طلب نشط` : "لا توجد طلبات نشطة",
      trendUp: false,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">مرحباً، {firstName}! 👋</h1>
          <p className="text-muted-foreground mt-1">
            إليك ملخص نشاطك في FasterFollow
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onNavigate?.("balance")}>
            <Plus className="h-4 w-4" />
            شحن الرصيد
          </Button>
          <Button variant="default" onClick={() => onNavigate?.("new-order")}>
            <Zap className="h-4 w-4" />
            طلب جديد
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat) => (
          <Card key={stat.title} variant="elevated">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${
                    stat.trendUp ? "text-green-600" : "text-muted-foreground"
                  }`}>
                    {stat.trendUp && <TrendingUp className="h-3 w-3" />}
                    {stat.trend}
                  </p>
                </div>
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
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
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => onNavigate?.("orders")}>
            عرض الكل
            <ArrowUpLeft className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => {
                const statusInfo = statusLabels[order.status || "pending"];
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 md:p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="h-9 w-9 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm md:text-base">
                          {order.service?.name_ar || order.service?.name || "خدمة محذوفة"}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          #{order.id.slice(0, 8)} • {order.quantity.toLocaleString()} وحدة
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${statusInfo.color}`} />
                        <span className="text-xs md:text-sm font-medium">{statusInfo.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ar })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">لا توجد طلبات بعد</p>
              <Button variant="default" className="mt-4" onClick={() => onNavigate?.("new-order")}>
                <Zap className="h-4 w-4" />
                ابدأ طلبك الأول
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewTab;
