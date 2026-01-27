import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Search, UserPlus, MessageCircle, Trash2 } from "lucide-react";

type Lead = {
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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [temperatureFilter, setTemperatureFilter] = useState<"all" | "cold" | "warm" | "hot">("all");

  // Função para formatar o telefone na exibição
  const formatPhoneDisplay = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else if (numbers.length === 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    }
    return phone;
  };

  const getLeadTemperature = (lead: Lead): "cold" | "warm" | "hot" => {
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

  const openWhatsApp = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const phoneWithCountry = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    const message = `Olá ${name}! Tudo bem?`;
    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "" && temperatureFilter === "all") {
      setFilteredLeads(leads);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredLeads(
        leads.filter((lead) => {
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
  }, [searchTerm, temperatureFilter, leads]);

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("last_access", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
      setFilteredLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToClient = async (leadId: string, leadName: string) => {
    if (!confirm(`Converter "${leadName}" em cliente?`)) return;
    
    try {
      const { error } = await supabase
        .from("clients")
        .update({ is_client: true })
        .eq("id", leadId);
      
      if (error) throw error;
      toast.success("Lead convertido em cliente com sucesso!");
      fetchLeads();
    } catch (error) {
      console.error("Erro ao converter lead:", error);
      toast.error("Erro ao converter lead em cliente");
    }
  };

  const handleDeleteLead = async (leadId: string, leadName: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${leadName}" permanentemente?`)) return;
    
    try {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", leadId);
      
      if (error) throw error;
      toast.success("Lead excluído com sucesso!");
      fetchLeads();
    } catch (error) {
      console.error("Erro ao excluir lead:", error);
      toast.error("Erro ao excluir lead");
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground mb-2">Leads - Histórico de Acessos</h2>
          <p className="text-sm text-muted-foreground">
            Total: {leads.length} lead{leads.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filtros de Temperatura */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={temperatureFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTemperatureFilter("all")}
          >
            Todos ({leads.length})
          </Button>
          <Button
            variant={temperatureFilter === "cold" ? "default" : "outline"}
            size="sm"
            onClick={() => setTemperatureFilter("cold")}
            className="border-blue-300"
          >
            🧊 Frios ({leads.filter(l => getLeadTemperature(l) === "cold").length})
          </Button>
          <Button
            variant={temperatureFilter === "warm" ? "default" : "outline"}
            size="sm"
            onClick={() => setTemperatureFilter("warm")}
            className="border-orange-300"
          >
            🌡️ Mornos ({leads.filter(l => getLeadTemperature(l) === "warm").length})
          </Button>
          <Button
            variant={temperatureFilter === "hot" ? "default" : "outline"}
            size="sm"
            onClick={() => setTemperatureFilter("hot")}
            className="border-red-300"
          >
            🔥 Quentes ({leads.filter(l => getLeadTemperature(l) === "hot").length})
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

        {filteredLeads.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            {searchTerm || temperatureFilter !== "all"
              ? "Nenhum lead encontrado com esses filtros."
              : "Nenhum lead cadastrado ainda."}
          </p>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead) => {
              const temperature = getLeadTemperature(lead);
              return (
                <div
                  key={lead.id}
                  className="flex items-center justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-foreground">{lead.name}</h3>
                      
                      {/* Badge de temperatura */}
                      <span className={`text-xs px-2 py-1 rounded-full border ${getTemperatureColor(temperature)}`}>
                        {getTemperatureIcon(temperature)} {getTemperatureLabel(temperature)}
                      </span>
                      
                      {/* Badge se é cliente */}
                      {lead.is_client && (
                        <span className="text-xs px-2 py-1 rounded-full border bg-green-100 text-green-700 border-green-300">
                          ✅ Cliente
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      Telefone: {formatPhoneDisplay(lead.phone)}
                    </p>
                    
                    {/* Informações de interação */}
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
                      
                      {/* Botão converter (só se NÃO for cliente) */}
                      {!lead.is_client && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleConvertToClient(lead.id, lead.name)}
                          className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          Converter
                        </Button>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteLead(lead.id, lead.name)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
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
