import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CustomerLanguageProvider } from "@/contexts/CustomerLanguageContext";
import { ThemeProvider } from "next-themes";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/admin/AdminProtectedRoute";
import ThemeInitializer from "@/components/ThemeInitializer";

// Critical path - load immediately
import Index from "./pages/Index";

// Lazy load non-critical routes
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminAuth = lazy(() => import("./pages/AdminAuth"));
const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminServices = lazy(() => import("./pages/admin/AdminServices"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminProviders = lazy(() => import("./pages/admin/AdminProviders"));
const AdminPayments = lazy(() => import("./pages/admin/AdminPayments"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons"));
const AdminContent = lazy(() => import("./pages/admin/AdminContent"));
const AdminBlog = lazy(() => import("./pages/admin/AdminBlog"));
const AdminMarketing = lazy(() => import("./pages/admin/AdminMarketing"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const AdminTickets = lazy(() => import("./pages/admin/AdminTickets"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews"));
const Services = lazy(() => import("./pages/Services"));
const ServiceDetail = lazy(() => import("./pages/ServiceDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const PageView = lazy(() => import("./pages/Page"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <CustomerLanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <ThemeInitializer>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/:slug" element={<ServiceDetail />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/page/:slug" element={<PageView />} />
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
                      <Route path="reviews" element={<AdminReviews />} />
                      <Route path="services" element={<AdminServices />} />
                      <Route path="services/*" element={<AdminServices />} />
                      <Route path="categories" element={<AdminCategories />} />
                      <Route path="providers" element={<AdminProviders />} />
                      <Route path="providers/*" element={<AdminProviders />} />
                      <Route path="payments" element={<AdminPayments />} />
                      <Route path="payments/coupons" element={<AdminCoupons />} />
                      <Route path="payments/*" element={<AdminPayments />} />
                      <Route path="content/*" element={<AdminContent />} />
                      <Route path="blog/*" element={<AdminBlog />} />
                      <Route path="marketing/*" element={<AdminMarketing />} />
                      <Route path="reports/*" element={<AdminReports />} />
                      <Route path="settings/*" element={<AdminSettings />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ThemeInitializer>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </CustomerLanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
