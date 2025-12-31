import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OverviewTab from "@/components/dashboard/OverviewTab";
import NewOrderTab from "@/components/dashboard/NewOrderTab";
import OrdersTab from "@/components/dashboard/OrdersTab";
import TransactionsTab from "@/components/dashboard/TransactionsTab";
import BalanceTab from "@/components/dashboard/BalanceTab";
import SupportTab from "@/components/dashboard/SupportTab";
import { SidebarProvider } from "@/components/ui/sidebar";

export type TabType = "overview" | "new-order" | "orders" | "transactions" | "balance" | "support";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab onNavigate={(tab) => setActiveTab(tab as TabType)} />;
      case "new-order":
        return <NewOrderTab />;
      case "orders":
        return <OrdersTab />;
      case "transactions":
        return <TransactionsTab />;
      case "balance":
        return <BalanceTab />;
      case "support":
        return <SupportTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader onGoHome={() => setActiveTab("overview")} />
          <main className="flex-1 p-3 md:p-6 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
