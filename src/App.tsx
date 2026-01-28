import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import ProtectedRoute from "@/components/ProtectedRoute";

import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import UserLogin from "./pages/UserLogin";
import UserRegister from "./pages/UserRegister";
import VerifyEmail from "./pages/VerifyEmail";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Financial from "./pages/admin/Financial";
import Sales from "./pages/admin/Sales";
import Stock from "./pages/admin/Stock";
import Leads from "./pages/admin/Leads";
import Clients from "./pages/admin/Clients";
import Franchises from "./pages/admin/Franchises";

import FranchiseReport from "./pages/admin/FranchiseReport";
import Sellers from "./pages/admin/Sellers";
import Drivers from "./pages/admin/Drivers";
import Monitors from "./pages/admin/Monitors";
import Settings from "./pages/admin/Settings";
import Logistics from "./pages/admin/Logistics";
import SaasManagement from "./pages/admin/SaasManagement";
import SystemUpdates from "./pages/admin/SystemUpdates";
import NotFound from "./pages/NotFound";
import PublicContract from "./pages/PublicContract";
import ResetPassword from "./pages/ResetPassword";
import ChoosePlan from "./pages/ChoosePlan";
import Subscription from "./pages/Subscription";
import PublicCatalog from "./pages/PublicCatalog";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ThemeProvider>
          <CartProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                
                <Route path="/login" element={<UserLogin />} />
                <Route path="/cadastro" element={<UserRegister />} />
                <Route path="/verificar-email" element={<VerifyEmail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/escolher-plano" element={<ChoosePlan />} />
                <Route path="/assinatura" element={<Subscription />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/catalog" element={
                  <ProtectedRoute requireAuth>
                    <Catalog />
                  </ProtectedRoute>
                } />
                <Route path="/product/:productId" element={
                  <ProtectedRoute requireAuth>
                    <ProductDetail />
                  </ProtectedRoute>
                } />
                <Route path="/checkout" element={
                  <ProtectedRoute requireAuth>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/contrato/:saleId" element={<PublicContract />} />
                <Route path="/catalogo/:franchiseId" element={<PublicCatalog />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="products" element={<Products />} />
                  <Route path="categories" element={<Categories />} />
                  <Route path="financial" element={<Financial />} />
                  <Route path="sales" element={<Sales />} />
                  <Route path="rentals" element={<Sales />} />
                  <Route path="stock" element={<Stock />} />
                  <Route path="logistics" element={<Logistics />} />
                  <Route path="leads" element={<Leads />} />
                  <Route path="clients" element={<Clients />} />
                  <Route path="franchises" element={<Franchises />} />
                  
                  <Route path="franchise-report" element={<FranchiseReport />} />
                  <Route path="sellers" element={<Sellers />} />
                  <Route path="drivers" element={<Drivers />} />
                  <Route path="monitors" element={<Monitors />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="saas-management" element={<SaasManagement />} />
                  <Route path="updates" element={<SystemUpdates />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </ThemeProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
