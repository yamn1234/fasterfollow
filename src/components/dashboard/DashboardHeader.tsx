import { useState, useEffect } from "react";
import { Bell, Search, Home, ChevronDown, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/hooks/useCurrency";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface DashboardHeaderProps {
  onGoHome?: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string | null;
  type: string;
  is_read: boolean;
  link: string | null;
  created_at: string;
}

const DashboardHeader = ({ onGoHome }: DashboardHeaderProps) => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { selectedCurrency, setSelectedCurrency, currencies, format } = useCurrency();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fetch notifications
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (data) setNotifications(data);
    };

    fetchNotifications();

    // Realtime subscription
    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setNotifications(prev => [payload.new as Notification, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => prev.map(n => 
              n.id === payload.new.id ? payload.new as Notification : n
            ));
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
  };

  const deleteNotification = async (id: string) => {
    await supabase
      .from("notifications")
      .delete()
      .eq("id", id);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const firstName = profile?.full_name?.split(" ")[0] || "المستخدم";
  const initials = profile?.full_name?.charAt(0) || "م";
  
  // Convert balance to selected currency
  const convertedBalance = format(profile?.balance || 0);

  return (
    <header className="h-14 md:h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4 sticky top-0 z-10">
      <div className="flex items-center gap-2 md:gap-4">
        <SidebarTrigger className="h-9 w-9" />
        
        {/* Home Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9"
              onClick={onGoHome}
            >
              <Home className="h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>الصفحة الرئيسية</TooltipContent>
        </Tooltip>
        
        {/* Search - Hidden on mobile */}
        <div className="relative hidden md:block">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            className="w-48 lg:w-64 pr-10 bg-secondary/50 border-0 h-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Currency Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 h-9 px-2 md:px-3">
              <span className="font-medium">{selectedCurrency.code}</span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
            <DropdownMenuLabel>اختر العملة</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {currencies.map((currency) => (
              <DropdownMenuItem
                key={currency.code}
                className={`cursor-pointer flex justify-between ${
                  selectedCurrency.code === currency.code ? "bg-primary/10 text-primary" : ""
                }`}
                onClick={() => setSelectedCurrency(currency)}
              >
                <span>{currency.name}</span>
                <span className="text-muted-foreground">{currency.symbol}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Balance - Compact on mobile */}
        <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-secondary/50 rounded-lg md:rounded-xl">
          <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">رصيدك:</span>
          <span className="text-sm md:text-base font-bold text-primary">
            {convertedBalance}
          </span>
        </div>

        {/* Notifications */}
        <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 md:-top-1 md:-left-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[380px]">
            <SheetHeader className="flex flex-row items-center justify-between">
              <SheetTitle>الإشعارات</SheetTitle>
              {unreadCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs"
                  onClick={markAllAsRead}
                >
                  <Check className="h-3 w-3 ml-1" />
                  تحديد الكل كمقروء
                </Button>
              )}
            </SheetHeader>
            <div className="mt-6 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground text-sm">لا توجد إشعارات</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 rounded-xl transition-colors cursor-pointer group relative ${
                      notification.is_read 
                        ? "bg-secondary/30 hover:bg-secondary/50" 
                        : "bg-primary/10 hover:bg-primary/15 border-r-2 border-primary"
                    }`}
                    onClick={() => {
                      if (!notification.is_read) markAsRead(notification.id);
                      if (notification.link) {
                        setNotificationsOpen(false);
                        navigate(notification.link);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {notification.message && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDistanceToNow(new Date(notification.created_at), { 
                            addSuffix: true, 
                            locale: ar 
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2 md:px-3 h-9 md:h-10">
              <Avatar className="h-7 w-7 md:h-8 md:w-8 border border-border">
                <AvatarImage src={profile?.avatar_url || ""} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block font-medium text-sm">
                {firstName}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{profile?.full_name || "المستخدم"}</span>
                <span className="text-xs text-muted-foreground font-normal">
                  رصيدك: ${profile?.balance?.toFixed(2) || "0.00"}
                </span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">الملف الشخصي</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">الإعدادات</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive cursor-pointer"
              onClick={handleSignOut}
            >
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
