import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import OverviewTab from "@/components/dashboard/OverviewTab";
import NewOrderTab from "@/components/dashboard/NewOrderTab";
import OrdersTab from "@/components/dashboard/OrdersTab";
import TransactionsTab from "@/components/dashboard/TransactionsTab";
import BalanceTab from "@/components/dashboard/BalanceTab";
import SupportTab from "@/components/dashboard/SupportTab";
import DashboardNavigation from "@/components/dashboard/DashboardNavigation";

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
    <div className="min-h-screen flex flex-col w-full bg-background">
      <DashboardHeader onGoHome={() => setActiveTab("overview")} />
      <DashboardNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-3 md:p-6 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Dashboard;
