import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  Wallet, 
  Home,
  HelpCircle,
  LogOut,
  Plus,
  User,
  ChevronRight
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardSidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const mainMenuItems = [
  { id: "overview" as TabType, title: "نظرة عامة", icon: LayoutDashboard },
  { id: "new-order" as TabType, title: "طلب جديد", icon: Plus, highlight: true },
  { id: "orders" as TabType, title: "طلباتي", icon: ShoppingBag },
  { id: "transactions" as TabType, title: "سجل العمليات", icon: Receipt },
  { id: "balance" as TabType, title: "شحن الرصيد", icon: Wallet },
];

const secondaryMenuItems = [
  { title: "المساعدة", icon: HelpCircle, href: "#" },
];

const DashboardSidebar = ({ activeTab, setActiveTab }: DashboardSidebarProps) => {
  const { state } = useSidebar();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const firstName = profile?.full_name?.split(" ")[0] || "المستخدم";
  const initials = profile?.full_name?.charAt(0) || "م";

  return (
    <Sidebar className="border-l border-border/50" collapsible="icon">
      {/* Header with Logo */}
      <SidebarHeader className="p-4 border-b border-border/50">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shrink-0 shadow-lg">
            <span className="text-lg font-bold text-primary-foreground">F</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gradient">FasterFollow</span>
              <span className="text-xs text-muted-foreground">لوحة التحكم</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      {/* User Profile Card */}
      {!isCollapsed && (
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <Avatar className="h-10 w-10 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{firstName}</p>
              <p className="text-xs text-muted-foreground">
                رصيدك: <span className="text-primary font-bold">${profile?.balance?.toFixed(2) || "0.00"}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <SidebarContent className="p-3">
        <SidebarGroup>
          {!isCollapsed && (
            <p className="text-xs text-muted-foreground px-3 mb-3 font-medium">القائمة الرئيسية</p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full justify-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : item.highlight
                        ? "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                        : "hover:bg-secondary"
                    }`}
                  >
                    <item.icon className={`h-5 w-5 shrink-0 ${item.highlight && activeTab !== item.id ? "text-primary" : ""}`} />
                    {!isCollapsed && (
                      <span className="font-medium">{item.title}</span>
                    )}
                    {!isCollapsed && activeTab === item.id && (
                      <ChevronRight className="h-4 w-4 mr-auto" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          {!isCollapsed && (
            <p className="text-xs text-muted-foreground px-3 mb-3 font-medium">أخرى</p>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {secondaryMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className="w-full justify-start gap-3 px-3 py-3 rounded-xl hover:bg-secondary transition-all duration-200"
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

      <SidebarFooter className="p-3 border-t border-border/50 space-y-1">
        <Link to="/">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 px-3 py-3 rounded-xl hover:bg-secondary"
          >
            <Home className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span>الصفحة الرئيسية</span>}
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 px-3 py-3 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
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
