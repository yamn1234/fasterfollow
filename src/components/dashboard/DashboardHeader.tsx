import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const DashboardHeader = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const firstName = profile?.full_name?.split(" ")[0] || "المستخدم";
  const initials = profile?.full_name?.charAt(0) || "م";

  return (
    <header className="h-14 md:h-16 border-b border-border/50 bg-card/50 backdrop-blur-sm px-3 md:px-6 flex items-center justify-between gap-2 md:gap-4 sticky top-0 z-10">
      <div className="flex items-center gap-2 md:gap-4">
        <SidebarTrigger className="h-9 w-9" />
        
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
        {/* Balance - Compact on mobile */}
        <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-secondary/50 rounded-lg md:rounded-xl">
          <span className="text-xs md:text-sm text-muted-foreground hidden sm:inline">رصيدك:</span>
          <span className="text-sm md:text-base font-bold text-primary">
            ${profile?.balance?.toFixed(2) || "0.00"}
          </span>
        </div>

        {/* Notifications */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
              <Bell className="h-4 w-4 md:h-5 md:w-5" />
              <span className="absolute -top-0.5 -left-0.5 md:-top-1 md:-left-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                3
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[350px]">
            <SheetHeader>
              <SheetTitle>الإشعارات</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                <p className="font-medium">تم إكمال طلبك #1234</p>
                <p className="text-xs text-muted-foreground mt-1">منذ 5 دقائق</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                <p className="font-medium">تم شحن رصيدك بنجاح</p>
                <p className="text-xs text-muted-foreground mt-1">منذ ساعة</p>
              </div>
              <div className="p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                <p className="font-medium">خدمة جديدة متاحة الآن</p>
                <p className="text-xs text-muted-foreground mt-1">منذ يوم</p>
              </div>
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
