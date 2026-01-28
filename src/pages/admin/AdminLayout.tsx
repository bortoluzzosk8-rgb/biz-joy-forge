import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, DollarSign, Calendar, Users, UserPlus, LogOut, Settings, Tag, Warehouse, BarChart3, Store, UserCheck, Truck, User, Building2, Clock, CreditCard, Megaphone, ShoppingBag } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user, isFranqueadora, isVendedor, isMotorista, isSuperAdmin, userFranchise } = useAuth();
  const { subscriptionStatus } = useSubscriptionStatus(user?.id);
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };

  const handleTabChange = (value: string) => {
    if (value === "subscription") {
      navigate("/assinatura");
    } else if (value === "catalog") {
      navigate("/catalog");
    } else {
      navigate(`/admin/${value}`);
    }
  };

  const getCurrentTab = () => {
    const path = location.pathname.split("/admin/")[1] || "dashboard";
    return path;
  };

  // Menu items para Super Admin (gestão do SaaS)
  const superAdminMenuItems = [
    { value: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["super_admin"] },
    { value: "leads", label: "Leads SaaS", icon: UserPlus, roles: ["super_admin"] },
    { value: "saas-management", label: "Clientes", icon: Building2, roles: ["super_admin"] },
  ];

  // Menu items para clientes (franqueadoras, vendedores, motoristas)
  const clientMenuItems = [
    { value: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["franqueadora", "vendedor"] },
    { value: "rentals", label: "Locações", icon: Calendar, roles: ["franqueadora", "vendedor"] },
    { value: "stock", label: "Estoque", icon: Warehouse, roles: ["franqueadora", "vendedor"] },
    { value: "logistics", label: "Logística", icon: Truck, roles: ["franqueadora", "vendedor", "motorista"] },
    { value: "clients", label: "Clientes", icon: Users, roles: ["franqueadora", "vendedor"] },
    { value: "monitors", label: "Monitores", icon: User, roles: ["franqueadora", "vendedor"] },
    { value: "drivers", label: "Motoristas", icon: Truck, roles: ["franqueadora", "vendedor"] },
    { value: "catalog", label: "Catálogo", icon: ShoppingBag, roles: ["franqueadora", "vendedor"] },
    { value: "products", label: "Produtos", icon: Package, roles: ["franqueadora"] },
    { value: "categories", label: "Categorias", icon: Tag, roles: ["franqueadora"] },
    { value: "financial", label: "Financeiro", icon: DollarSign, roles: ["franqueadora"] },
    { value: "leads", label: "Leads", icon: UserPlus, roles: ["franqueadora"] },
    { value: "franchises", label: "Unidades", icon: Store, roles: ["franqueadora"] },
    { value: "sellers", label: "Vendedores", icon: UserCheck, roles: ["franqueadora"] },
    { value: "settings", label: "Config", icon: Settings, roles: ["franqueadora"] },
  ];

  // Filtrar menus baseado no role
  const visibleMenuItems = (() => {
    // Super Admin vê apenas menus do SaaS
    if (isSuperAdmin) {
      return superAdminMenuItems;
    }
    
    // Demais roles vêem menus de cliente
    return clientMenuItems.filter((item) => {
      if (isFranqueadora) return item.roles.includes("franqueadora");
      if (isVendedor) return item.roles.includes("vendedor");
      if (isMotorista) return item.roles.includes("motorista");
      return false;
    });
  })();

  // Título do painel baseado no role
  const getPanelTitle = () => {
    if (isSuperAdmin) return "🛡️ Super Admin";
    if (isFranqueadora) return "🏢 Painel Administrativo";
    if (isVendedor) return "👤 Vendedor";
    if (isMotorista) return "🚚 Motorista";
    return "Painel Administrativo";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Trial Banner */}
      {subscriptionStatus?.status === 'trial' && subscriptionStatus.trialDaysLeft !== null && !isSuperAdmin && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              ⏰ Você tem <strong>{subscriptionStatus.trialDaysLeft} {subscriptionStatus.trialDaysLeft === 1 ? 'dia' : 'dias'}</strong> restantes do período de teste.
            </span>
            <Button 
              variant="link" 
              size="sm" 
              className="text-amber-600 dark:text-amber-400 p-0 h-auto"
              onClick={() => navigate('/assinatura')}
            >
              Gerenciar assinatura
            </Button>
          </div>
        </div>
      )}

      {/* Past Due Banner */}
      {subscriptionStatus?.status === 'past_due' && !isSuperAdmin && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2">
          <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <Clock className="h-4 w-4" />
            <span>
              ⚠️ Identificamos um <strong>pagamento em aberto</strong>. Regularize para evitar bloqueio.
            </span>
            <Button 
              variant="link" 
              size="sm" 
              className="text-red-600 dark:text-red-400 p-0 h-auto"
              onClick={() => navigate('/assinatura')}
            >
              Ver cobrança
            </Button>
          </div>
        </div>
      )}

      <div className="border-b bg-card">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {getPanelTitle()}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {userFranchise && (
                <p className="text-sm font-medium text-primary">
                  📍 {userFranchise.name} - {userFranchise.city}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin/updates')}>
                <Megaphone className="w-4 h-4" />
                <span className="hidden sm:inline ml-1">Atualizações</span>
              </Button>
              
              {isFranqueadora && (
                <Button variant="ghost" size="sm" onClick={() => navigate('/assinatura')}>
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1">Assinaturas</span>
                </Button>
              )}
              
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>

          {isMobile ? (
            <Select value={getCurrentTab()} onValueChange={handleTabChange}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Selecione uma seção" />
              </SelectTrigger>
              <SelectContent>
                {visibleMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SelectItem key={item.value} value={item.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          ) : (
            <Tabs value={getCurrentTab()} className="w-full">
              <TabsList className="flex flex-wrap h-auto items-center justify-start rounded-md bg-muted p-1 gap-1">
                {visibleMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <TabsTrigger 
                      key={item.value} 
                      value={item.value} 
                      onClick={() => handleTabChange(item.value)}
                      className="shrink-0 whitespace-nowrap px-3"
                    >
                      <Icon className="w-4 h-4 mr-1.5" />
                      {item.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </Tabs>
          )}
        </div>
      </div>

      <div className="px-4 lg:px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;