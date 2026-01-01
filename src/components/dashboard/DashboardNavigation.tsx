import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  Wallet, 
  Zap,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TabType } from "@/pages/Dashboard";

interface DashboardNavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const menuItems = [
  { id: "overview" as TabType, title: "نظرة عامة", icon: LayoutDashboard },
  { id: "new-order" as TabType, title: "طلب جديد", icon: Zap, highlight: true },
  { id: "orders" as TabType, title: "طلباتي", icon: ShoppingBag },
  { id: "transactions" as TabType, title: "سجل العمليات", icon: Receipt },
  { id: "balance" as TabType, title: "شحن الرصيد", icon: Wallet },
  { id: "support" as TabType, title: "الدعم الفني", icon: MessageSquare },
];

const DashboardNavigation = ({ activeTab, setActiveTab }: DashboardNavigationProps) => {
  return (
    <div className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="px-3 md:px-6 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : item.highlight ? "outline" : "ghost"}
              size="sm"
              onClick={() => setActiveTab(item.id)}
              className={`shrink-0 gap-2 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? "shadow-lg shadow-primary/25"
                  : item.highlight
                  ? "border-primary/30 text-primary hover:bg-primary/10"
                  : "hover:bg-secondary"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.title}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;
