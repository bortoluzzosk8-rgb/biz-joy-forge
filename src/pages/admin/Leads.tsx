import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, MessageCircle, Mail, MapPin, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type SaasLead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type ClientLead = {
  id: string;
  name: string;
  phone: string;
  created_at: string;
  last_access: string;
  is_client: boolean;
  cart_created: boolean;
  whatsapp_sent: boolean;
};

const Leads = () => {
  const { isSuperAdmin } = useAuth();
  const [saasLeads, setSaasLeads] = useState<SaasLead[]>([]);
  const [clientLeads, setClientLeads] = useState<ClientLead[]>([]);
  const [filteredSaasLeads, setFilteredSaasLeads] = useState<SaasLead[]>([]);
  const [filteredClientLeads, setFilteredClientLeads] = useState<ClientLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [temperatureFilter, setTemperatureFilter] = useState<"all" | "cold" | "warm" | "hot">("all");

  const formatPhoneDisplay = (phone: string | null) => {
    if (!phone) return "Não informado";
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return phone;
  };

  const getLeadTemperature = (lead: ClientLead): "cold" | "warm" | "hot" => {
    if (lead.whatsapp_sent) return "hot";
    if (lead.cart_created) return "warm";
    return "cold";
  };

  const getTemperatureIcon = (temp: "cold" | "warm" | "hot") => {
    switch (temp) {
      case "hot": return "🔥";
      case "warm": return "🌡️";
      case "cold": return "🧊";
    }
  };

  const getTemperatureLabel = (temp: "cold" | "warm" | "hot") => {
    switch (temp) {
      case "hot": return "Quente";
      case "warm": return "Morno";
      case "cold": return "Frio";
    }
  };

  const getTemperatureColor = (temp: "cold" | "warm" | "hot") => {
    switch (temp) {
      case "hot": return "bg-red-100 text-red-700 border-red-300";
      case "warm": return "bg-orange-100 text-orange-700 border-orange-300";
      case "cold": return "bg-blue-100 text-blue-700 border-blue-300";
    }
  };

  const openWhatsApp = (phone: string | null, name: string) => {
    if (!phone) {
      toast.error("Telefone não informado");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const message = `Olá ${name}! Tudo bem?`;
    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const openEmail = (email: string | null, name: string) => {
    if (!email) {
      toast.error("Email não informado");
      return;
    }
    const subject = `Contato - ${name}`;
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}`, '_blank');
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchSaasLeads();
    } else {
      fetchClientLeads();
    }
  }, [isSuperAdmin]);

  // Filter effect for SaaS leads (Super Admin)
  useEffect(() => {
    if (!isSuperAdmin) return;
    
    if (searchTerm.trim() === "" && statusFilter === "all") {
      setFilteredSaasLeads(saasLeads);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredSaasLeads(
        saasLeads.filter((lead) => {
          const matchesSearch = 
            lead.name.toLowerCase().includes(term) ||
            (lead.email?.toLowerCase().includes(term) || false) ||
            (lead.phone?.toLowerCase().includes(term) || false) ||
            lead.city.toLowerCase().includes(term);
          
          const matchesStatus = 
            statusFilter === "all" || 
            (statusFilter === "active" && lead.status === "active") ||
            (statusFilter === "inactive" && lead.status !== "active");
          
          return matchesSearch && matchesStatus;
        })
      );
    }
  }, [searchTerm, statusFilter, saasLeads, isSuperAdmin]);

  // Filter effect for client leads (Franqueadora)
  useEffect(() => {
    if (isSuperAdmin) return;
    
    if (searchTerm.trim() === "" && temperatureFilter === "all") {
      setFilteredClientLeads(clientLeads);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredClientLeads(
        clientLeads.filter((lead) => {
          const matchesSearch = 
            lead.name.toLowerCase().includes(term) ||
            lead.phone.toLowerCase().includes(term);
          
          const matchesTemperature = 
            temperatureFilter === "all" || 
            getLeadTemperature(lead) === temperatureFilter;
          
          return matchesSearch && matchesTemperature;
        })
      );
    }
  }, [searchTerm, temperatureFilter, clientLeads, isSuperAdmin]);

  const fetchSaasLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("franchises")
        .select("id, name, email, phone, city, status, created_at, updated_at")
        .is("parent_franchise_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSaasLeads(data || []);
      setFilteredSaasLeads(data || []);
    } catch (error) {
      console.error("Error fetching SaaS leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  const fetchClientLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("last_access", { ascending: false });

      if (error) throw error;
      setClientLeads(data || []);
      setFilteredClientLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  // Super Admin view - SaaS customers (franchises)
  if (isSuperAdmin) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">Leads SaaS - Clientes Potenciais</h2>
            <p className="text-sm text-muted-foreground">
              Total: {saasLeads.length} franqueadora{saasLeads.length !== 1 ? "s" : ""} cadastrada{saasLeads.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Status Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              Todos ({saasLeads.length})
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("active")}
              className="border-green-300"
            >
              ✅ Ativos ({saasLeads.filter(l => l.status === "active").length})
            </Button>
            <Button
              variant={statusFilter === "inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("inactive")}
              className="border-gray-300"
            >
              ⏸️ Inativos ({saasLeads.filter(l => l.status !== "active").length})
            </Button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, telefone ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {filteredSaasLeads.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              {searchTerm || statusFilter !== "all"
                ? "Nenhum lead encontrado com esses filtros."
                : "Nenhum lead cadastrado ainda."}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredSaasLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <h3 className="font-semibold text-foreground">{lead.name}</h3>
                      
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        lead.status === "active" 
                          ? "bg-green-100 text-green-700 border-green-300" 
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }`}>
                        {lead.status === "active" ? "✅ Ativo" : "⏸️ Inativo"}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{lead.email || "Email não informado"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{formatPhoneDisplay(lead.phone)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{lead.city}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Cadastro: {new Date(lead.created_at).toLocaleDateString("pt-BR")}</p>
                      <p>Atualizado: {new Date(lead.updated_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      {lead.phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openWhatsApp(lead.phone, lead.name)}
                          className="gap-2 hover:bg-green-50"
                          title="Abrir WhatsApp"
                        >
                          <MessageCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      
                      {lead.email && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEmail(lead.email, lead.name)}
                          className="gap-2 hover:bg-blue-50"
                          title="Enviar Email"
                        >
                          <Mail className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Franqueadora view - Client leads
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Leads - Histórico de Acessos</h2>
          <p className="text-sm text-muted-foreground">
            Total: {clientLeads.length} lead{clientLeads.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Temperature Filters */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={temperatureFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTemperatureFilter("all")}
          >
            Todos ({clientLeads.length})
          </Button>
          <Button
            variant={temperatureFilter === "cold" ? "default" : "outline"}
            size="sm"
            onClick={() => setTemperatureFilter("cold")}
            className="border-blue-300"
          >
            🧊 Frios ({clientLeads.filter(l => getLeadTemperature(l) === "cold").length})
          </Button>
          <Button
            variant={temperatureFilter === "warm" ? "default" : "outline"}
            size="sm"
            onClick={() => setTemperatureFilter("warm")}
            className="border-orange-300"
          >
            🌡️ Mornos ({clientLeads.filter(l => getLeadTemperature(l) === "warm").length})
          </Button>
          <Button
            variant={temperatureFilter === "hot" ? "default" : "outline"}
            size="sm"
            onClick={() => setTemperatureFilter("hot")}
            className="border-red-300"
          >
            🔥 Quentes ({clientLeads.filter(l => getLeadTemperature(l) === "hot").length})
          </Button>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredClientLeads.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {searchTerm || temperatureFilter !== "all"
              ? "Nenhum lead encontrado com esses filtros."
              : "Nenhum lead cadastrado ainda."}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredClientLeads.map((lead) => {
              const temperature = getLeadTemperature(lead);
              return (
                <div
                  key={lead.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground">{lead.name}</h3>
                      
                      <span className={`text-xs px-2 py-1 rounded-full border ${getTemperatureColor(temperature)}`}>
                        {getTemperatureIcon(temperature)} {getTemperatureLabel(temperature)}
                      </span>
                      
                      {lead.is_client && (
                        <span className="text-xs px-2 py-1 rounded-full border bg-green-100 text-green-700 border-green-300">
                          ✅ Cliente
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Telefone: {formatPhoneDisplay(lead.phone)}
                    </p>
                    
                    <div className="flex gap-4 text-xs text-muted-foreground mt-2">
                      {lead.cart_created && <span>🛒 Criou carrinho</span>}
                      {lead.whatsapp_sent && <span>📱 Enviou WhatsApp</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>Cadastro: {new Date(lead.created_at).toLocaleDateString("pt-BR")}</p>
                      <p>Último acesso: {new Date(lead.last_access).toLocaleDateString("pt-BR")}</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openWhatsApp(lead.phone, lead.name)}
                        className="gap-2 hover:bg-green-50"
                      >
                        <MessageCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Leads;
