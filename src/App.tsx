import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";
import ThemeInitializer from "@/components/ThemeInitializer";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminServices from "./pages/admin/AdminServices";
import AdminProviders from "./pages/admin/AdminProviders";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminContent from "./pages/admin/AdminContent";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminTickets from "./pages/admin/AdminTickets";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ThemeInitializer>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<Services />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin/login" element={<AdminAuth />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminProtectedRoute>
                    <AdminLayout />
                  </AdminProtectedRoute>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="users/*" element={<AdminUsers />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/*" element={<AdminOrders />} />
                <Route path="tickets" element={<AdminTickets />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="services/*" element={<AdminServices />} />
                <Route path="providers" element={<AdminProviders />} />
                <Route path="providers/*" element={<AdminProviders />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="payments/*" element={<AdminPayments />} />
                <Route path="content/*" element={<AdminContent />} />
                <Route path="blog/*" element={<AdminBlog />} />
                <Route path="marketing/*" element={<AdminMarketing />} />
                <Route path="reports/*" element={<AdminReports />} />
                <Route path="settings/*" element={<AdminSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ThemeInitializer>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
