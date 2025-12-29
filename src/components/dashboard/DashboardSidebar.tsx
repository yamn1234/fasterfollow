import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  Wallet, 
  Home,
  Settings,
  HelpCircle,
  LogOut,
  ShoppingCart
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { TabType } from "@/pages/Dashboard";

interface DashboardSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const mainMenuItems = [
  { id: "overview" as TabType, title: "نظرة عامة", icon: LayoutDashboard },
  { id: "orders" as TabType, title: "طلباتي", icon: ShoppingBag },
  { id: "transactions" as TabType, title: "سجل العمليات", icon: Receipt },
  { id: "balance" as TabType, title: "شحن الرصيد", icon: Wallet },
];

const secondaryMenuItems = [
  { title: "الإعدادات", icon: Settings, href: "#" },
  { title: "المساعدة", icon: HelpCircle, href: "#" },
];

const DashboardSidebar = ({ activeTab, setActiveTab }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar className="border-l border-border" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shrink-0">
            <ShoppingCart className="h-5 w-5 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold text-gradient">متجر المتابعين</span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2 mb-2">
            {!isCollapsed && "القائمة الرئيسية"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs text-muted-foreground px-2 mb-2">
            {!isCollapsed && "أخرى"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="w-full justify-start gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary"
                  >
                    <a href={item.href}>
                      <item.icon className="h-5 w-5 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <Link to="/">
          <Button variant="ghost" className="w-full justify-start gap-3">
            <Home className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>الصفحة الرئيسية</span>}
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>تسجيل الخروج</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
