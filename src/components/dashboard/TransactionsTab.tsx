import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Wallet, ShoppingBag, Gift } from "lucide-react";

type TransactionType = "deposit" | "purchase" | "bonus" | "refund";

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  balanceAfter: number;
  date: string;
  details?: string;
}

const transactions: Transaction[] = [
  {
    id: "TRX-5001",
    type: "deposit",
    amount: 10.00,
    description: "شحن رصيد - PayPal",
    balanceAfter: 25.50,
    date: "2024-01-15 14:30",
    details: "PayPal Transaction ID: ABC123",
  },
  {
    id: "TRX-5000",
    type: "purchase",
    amount: -0.99,
    description: "شراء متابعين انستجرام",
    balanceAfter: 15.50,
    date: "2024-01-15 14:00",
    details: "طلب #1234",
  },
  {
    id: "TRX-4999",
    type: "bonus",
    amount: 1.00,
    description: "مكافأة الشحن",
    balanceAfter: 16.49,
    date: "2024-01-14 10:00",
    details: "مكافأة 10% على شحن $10",
  },
  {
    id: "TRX-4998",
    type: "purchase",
    amount: -2.49,
    description: "شراء مشاهدات تيك توك",
    balanceAfter: 15.49,
    date: "2024-01-14 09:30",
    details: "طلب #1233",
  },
  {
    id: "TRX-4997",
    type: "refund",
    amount: 0.49,
    description: "استرداد - خدمة غير مكتملة",
    balanceAfter: 17.98,
    date: "2024-01-13 16:00",
    details: "طلب #1228",
  },
  {
    id: "TRX-4996",
    type: "deposit",
    amount: 5.00,
    description: "شحن رصيد - بطاقة ائتمان",
    balanceAfter: 17.49,
    date: "2024-01-13 12:00",
  },
  {
    id: "TRX-4995",
    type: "purchase",
    amount: -1.50,
    description: "شراء لايكات فيسبوك",
    balanceAfter: 12.49,
    date: "2024-01-12 18:45",
    details: "طلب #1225",
  },
];

const typeConfig: Record<TransactionType, { 
  label: string; 
  icon: typeof ArrowUpRight; 
  colorClass: string;
  bgClass: string;
}> = {
  deposit: { 
    label: "إيداع", 
    icon: ArrowDownLeft, 
    colorClass: "text-green-600",
    bgClass: "bg-green-100",
  },
  purchase: { 
    label: "شراء", 
    icon: ShoppingBag, 
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  bonus: { 
    label: "مكافأة", 
    icon: Gift, 
    colorClass: "text-purple-600",
    bgClass: "bg-purple-100",
  },
  refund: { 
    label: "استرداد", 
    icon: Wallet, 
    colorClass: "text-blue-600",
    bgClass: "bg-blue-100",
  },
};

const TransactionsTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.includes(searchQuery);
    const matchesType = typeFilter === "all" || tx.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate totals
  const totalDeposits = transactions
    .filter((tx) => tx.type === "deposit" || tx.type === "bonus" || tx.type === "refund")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalPurchases = transactions
    .filter((tx) => tx.type === "purchase")
    .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">سجل العمليات</h1>
        <p className="text-muted-foreground mt-1">
          جميع عمليات الشحن والشراء والاسترداد
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
              <ArrowDownLeft className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي الإيداعات</p>
              <p className="text-xl font-bold text-green-600">+${totalDeposits.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
              <p className="text-xl font-bold text-primary">-${totalPurchases.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center">
              <Wallet className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
              <p className="text-xl font-bold">$25.50</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>جميع العمليات</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 pr-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 ml-2" />
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="deposit">إيداع</SelectItem>
                  <SelectItem value="purchase">شراء</SelectItem>
                  <SelectItem value="bonus">مكافأة</SelectItem>
                  <SelectItem value="refund">استرداد</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTransactions.map((tx) => {
              const config = typeConfig[tx.type];
              const Icon = config.icon;
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg ${config.bgClass} flex items-center justify-center`}>
                      <Icon className={`h-5 w-5 ${config.colorClass}`} />
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{tx.id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className={`font-bold ${tx.amount >= 0 ? "text-green-600" : ""}`}>
                      {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{tx.date}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">لا توجد عمليات مطابقة للبحث</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsTab;
