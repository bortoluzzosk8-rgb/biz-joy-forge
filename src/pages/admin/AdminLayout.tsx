import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, DollarSign, Calendar, Users, UserPlus, LogOut, Settings, Tag, Warehouse, BarChart3, Store, UsersRound, FileSpreadsheet, UserCheck, Truck, User, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user, isFranqueadora, isFranqueado, isVendedor, isMotorista, isSuperAdmin, userFranchise } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso");
    navigate("/");
  };

  const handleTabChange = (value: string) => {
    navigate(`/admin/${value}`);
  };

  const getCurrentTab = () => {
    const path = location.pathname.split("/admin/")[1] || "dashboard";
    return path;
  };

  // Menu items baseados no role do usuário
  const menuItems = [
    { value: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["franqueadora", "franqueado", "vendedor"] },
    { value: "rentals", label: "Locações", icon: Calendar, roles: ["franqueadora", "franqueado", "vendedor"] },
    { value: "stock", label: "Estoque", icon: Warehouse, roles: ["franqueadora", "franqueado", "vendedor"] },
    { value: "logistics", label: "Logística", icon: Truck, roles: ["franqueadora", "franqueado", "vendedor", "motorista"] },
    { value: "clients", label: "Clientes", icon: Users, roles: ["franqueadora", "franqueado", "vendedor"] },
    { value: "monitors", label: "Monitores", icon: User, roles: ["franqueadora", "franqueado", "vendedor"] },
    { value: "drivers", label: "Motoristas", icon: Truck, roles: ["franqueadora", "franqueado", "vendedor"] },
    { value: "products", label: "Produtos", icon: Package, roles: ["franqueadora"] },
    { value: "categories", label: "Categorias", icon: Tag, roles: ["franqueadora"] },
    { value: "financial", label: "Financeiro", icon: DollarSign, roles: ["franqueadora", "franqueado"] },
    { value: "leads", label: "Leads", icon: UserPlus, roles: ["franqueadora"] },
    { value: "franchises", label: "Unidades", icon: Store, roles: ["franqueadora"] },
    { value: "franchise-users", label: "Franqueados", icon: UsersRound, roles: ["franqueadora"] },
    { value: "sellers", label: "Vendedores", icon: UserCheck, roles: ["franqueadora"] },
    { value: "franchise-report", label: "Relatório", icon: FileSpreadsheet, roles: ["franqueadora", "franqueado"] },
    { value: "settings", label: "Config", icon: Settings, roles: ["franqueadora"] },
    { value: "saas-management", label: "Gestão SaaS", icon: Shield, roles: ["super_admin"] },
  ];

  // Filtrar menus baseado no role
  const visibleMenuItems = menuItems.filter((item) => {
    // Super admin vê tudo + menu especial
    if (isSuperAdmin && item.roles.includes("super_admin")) return true;
    if (isFranqueadora) return item.roles.includes("franqueadora");
    if (isFranqueado) return item.roles.includes("franqueado");
    if (isVendedor) return item.roles.includes("vendedor");
    if (isMotorista) return item.roles.includes("motorista");
    return false;
  });

  // Título do painel baseado no role
  const getPanelTitle = () => {
    if (isSuperAdmin) return "🛡️ Super Admin";
    if (isFranqueadora) return "🏢 Franqueadora";
    if (isFranqueado) return "🏪 Franqueado";
    if (isVendedor) return "👤 Vendedor";
    if (isMotorista) return "🚚 Motorista";
    return "Painel Administrativo";
  };

  return (
    <div className="min-h-screen bg-background">
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
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
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