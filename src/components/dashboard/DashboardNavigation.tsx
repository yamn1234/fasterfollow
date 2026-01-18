import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  Wallet, 
  Zap,
  MessageSquare,
  Home,
  Ticket,
  User,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  { id: "coupon" as TabType, title: "كوبون", icon: Ticket },
  { id: "support" as TabType, title: "الدعم الفني", icon: MessageSquare },
  { id: "profile" as TabType, title: "الملف الشخصي", icon: User },
  { id: "settings" as TabType, title: "الإعدادات", icon: Settings },
];

const DashboardNavigation = ({ activeTab, setActiveTab }: DashboardNavigationProps) => {
  return (
    <div className="hidden md:block border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-14 md:top-16 z-40">
      <div className="px-3 md:px-6 py-2 md:py-3">
        <div className="flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {/* Home Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("overview")}
                className="shrink-0 rounded-xl hover:bg-secondary"
              >
                <Home className="h-4 w-4" />
                <span className="mr-2">الرئيسية</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              الرئيسية
            </TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-border/50 mx-1" />

          {menuItems.map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <Button
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
                  <span>{item.title}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {item.title}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;
