import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Download, FileSpreadsheet } from "lucide-react";
import { downloadElementAsPdf } from "@/lib/generatePdf";

type Franchise = {
  id: string;
  name: string;
  city: string;
  franqueado_percentage: number;
  franqueadora_percentage: number;
  equilibrio_inicial: number;
};

type MonthlyData = {
  month: string;
  monthIndex: number;
  dateStart: string;
  dateEnd: string;
  vendas: number;
  realizado: number;
  refMesAnt: number;
  monitoria: number;
  frete: number;
  despFinanceira: number;
  lucroLiquido: number;
  recFranqueado: number;
  recFranqueadora: number;
  franqueadoRecebeu: number;
  franqueadoraRecebeu: number;
  equilibrio: number;
  repasse: number;
};

const FranchiseReport = () => {
  const { isFranqueadora } = useAuth();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const months = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
  // Gera anos: 3 anos para frente + ano atual + 5 anos para trás
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 9 }, (_, i) => currentYear + 3 - i);

  useEffect(() => {
    if (!isFranqueadora) {
      toast.error("Acesso negado.");
      return;
    }
    
    fetchFranchises();
  }, [isFranqueadora]);

  useEffect(() => {
    if (selectedFranchiseId) {
      fetchMonthlyData();
    }
  }, [selectedFranchiseId, selectedYear]);

  const fetchFranchises = async () => {
    try {
      const { data, error } = await supabase
        .from("franchises")
        .select("id, name, city, franqueado_percentage, franqueadora_percentage, equilibrio_inicial")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setFranchises(data || []);
      if (data && data.length > 0) {
        setSelectedFranchiseId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching franchises:", error);
      toast.error("Erro ao carregar unidades");
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const franchise = franchises.find(f => f.id === selectedFranchiseId);
      if (!franchise) return;

      const startDate = `${selectedYear}-01-01`;
      const endDate = `${selectedYear}-12-31`;

      // Buscar vendas (incluindo rental_start_date para calcular "Realizado")
      const { data: sales, error: salesError } = await supabase
        .from("sales")
        .select("id, sale_date, rental_start_date, total_value, monitoring_value, freight_value, status")
        .eq("franchise_id", selectedFranchiseId)
        .neq("status", "cancelled");

      if (salesError) throw salesError;

      // Buscar pagamentos (filtrado por franquia via join)
      const { data: payments, error: paymentsError } = await supabase
        .from("sale_payments")
        .select("sale_id, amount, card_fee, status, payment_date, received_by, sales!inner(franchise_id)")
        .eq("status", "paid")
        .eq("sales.franchise_id", selectedFranchiseId)
        .gte("payment_date", startDate)
        .lte("payment_date", endDate);

      if (paymentsError) throw paymentsError;

      // Organizar dados por mês
      const monthlyResults: MonthlyData[] = [];
      let previousRealizado = 0;
      let runningEquilibrio = franchise.equilibrio_inicial || 0;

      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(selectedYear, i, 1);
        const monthEnd = new Date(selectedYear, i + 1, 0);
        
        const monthStartStr = monthStart.toISOString().split('T')[0];
        const monthEndStr = monthEnd.toISOString().split('T')[0];

        // Vendas do mês
        const monthSales = sales?.filter(s => {
          const saleDate = new Date(s.sale_date);
          return saleDate >= monthStart && saleDate <= monthEnd;
        }) || [];

        const vendas = monthSales.reduce((sum, s) => sum + Number(s.total_value), 0);
        const monitoria = monthSales.reduce((sum, s) => sum + Number(s.monitoring_value || 0), 0);
        const frete = monthSales.reduce((sum, s) => sum + Number(s.freight_value || 0), 0);

        // Pagamentos realizados no mês (para cálculos financeiros)
        const monthPayments = payments?.filter(p => {
          const paymentDate = new Date(p.payment_date || '');
          return paymentDate >= monthStart && paymentDate <= monthEnd;
        }) || [];

        // Realizado = vendas cuja data da festa (rental_start_date) está no mês
        const monthRealized = sales?.filter(s => {
          const rentalDate = s.rental_start_date ? new Date(s.rental_start_date) : null;
          return rentalDate && rentalDate >= monthStart && rentalDate <= monthEnd;
        }) || [];

        const realizado = monthRealized.reduce((sum, s) => sum + Number(s.total_value), 0);
        const despFinanceira = monthPayments.reduce((sum, p) => sum + Number(p.card_fee || 0), 0);

        // Valores realmente recebidos por cada parte
        const franqueadoRecebeu = monthPayments
          .filter(p => p.received_by === 'franqueado')
          .reduce((sum, p) => sum + Number(p.amount), 0);
        
        const franqueadoraRecebeu = monthPayments
          .filter(p => p.received_by === 'franqueadora')
          .reduce((sum, p) => sum + Number(p.amount), 0);

        // Cálculos
        const refMesAnt = previousRealizado > 0 
          ? ((realizado - previousRealizado) / previousRealizado) * 100 
          : 0;

        const lucroLiquido = realizado - frete - monitoria - despFinanceira;
        
        // Franqueado recebe (teórico): sua % do lucro líquido + frete + monitoria
        const recFranqueado = (lucroLiquido * (franchise.franqueado_percentage / 100)) + frete + monitoria;
        
        // Franqueadora recebe (teórico): sua % do lucro líquido
        const recFranqueadora = lucroLiquido * (franchise.franqueadora_percentage / 100);

        // Repasse: diferença entre o que a franqueadora recebeu vs deveria receber
        // Positivo: franqueadora repassa ao franqueado
        // Negativo: franqueado repassa à franqueadora
        const repasse = franqueadoraRecebeu - recFranqueadora;
        
        // Equilíbrio: saldo acumulado
        runningEquilibrio = runningEquilibrio + recFranqueado - repasse;

        monthlyResults.push({
          month: months[i],
          monthIndex: i,
          dateStart: monthStartStr,
          dateEnd: monthEndStr,
          vendas,
          realizado,
          refMesAnt,
          monitoria,
          frete,
          despFinanceira,
          lucroLiquido,
          recFranqueado,
          recFranqueadora,
          franqueadoRecebeu,
          franqueadoraRecebeu,
          equilibrio: runningEquilibrio,
          repasse,
        });

        previousRealizado = realizado;
      }

      setMonthlyData(monthlyResults);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
      toast.error("Erro ao carregar dados mensais");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handleExportPDF = async () => {
    try {
      const franchise = franchises.find(f => f.id === selectedFranchiseId);
      await downloadElementAsPdf(
        'franchise-report-table',
        `relatorio-${franchise?.name || 'franquia'}-${selectedYear}.pdf`
      );
      toast.success("PDF gerado com sucesso!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const totals = monthlyData.reduce((acc, month) => ({
    vendas: acc.vendas + month.vendas,
    realizado: acc.realizado + month.realizado,
    monitoria: acc.monitoria + month.monitoria,
    frete: acc.frete + month.frete,
    despFinanceira: acc.despFinanceira + month.despFinanceira,
    lucroLiquido: acc.lucroLiquido + month.lucroLiquido,
    recFranqueado: acc.recFranqueado + month.recFranqueado,
    recFranqueadora: acc.recFranqueadora + month.recFranqueadora,
    franqueadoRecebeu: acc.franqueadoRecebeu + month.franqueadoRecebeu,
    franqueadoraRecebeu: acc.franqueadoraRecebeu + month.franqueadoraRecebeu,
    repasse: acc.repasse + month.repasse,
  }), {
    vendas: 0,
    realizado: 0,
    monitoria: 0,
    frete: 0,
    despFinanceira: 0,
    lucroLiquido: 0,
    recFranqueado: 0,
    recFranqueadora: 0,
    franqueadoRecebeu: 0,
    franqueadoraRecebeu: 0,
    repasse: 0,
  });

  if (!isFranqueadora) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-muted-foreground">Acesso Negado</h2>
        <p className="text-muted-foreground mt-2">
          Você não tem permissão para acessar esta página
        </p>
      </div>
    );
  }

  if (loading && franchises.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedFranchise = franchises.find(f => f.id === selectedFranchiseId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatório Financeiro</h2>
          <p className="text-muted-foreground">
            Análise mensal de vendas e repasses por franquia
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Seletor de unidade - somente visível para franqueadora */}
          {isFranqueadora && (
            <div>
              <Label>Unidade</Label>
              <Select value={selectedFranchiseId} onValueChange={setSelectedFranchiseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a unidade" />
                </SelectTrigger>
                <SelectContent>
                  {franchises.map((franchise) => (
                    <SelectItem key={franchise.id} value={franchise.id}>
                      {franchise.name} - {franchise.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label>Ano</Label>
            <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button onClick={handleExportPDF} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {selectedFranchise && (
          <div className="mb-4 p-4 bg-muted/50 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold">Franqueado:</span> {selectedFranchise.franqueado_percentage}%
              </div>
              <div>
                <span className="font-semibold">Franqueadora:</span> {selectedFranchise.franqueadora_percentage}%
              </div>
              <div>
                <span className="font-semibold">Equilíbrio Inicial:</span> {formatCurrency(selectedFranchise.equilibrio_inicial)}
              </div>
            </div>
          </div>
        )}
      </Card>

      <div id="franchise-report-table" className="bg-card p-6 rounded-lg border">
        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold">
            {selectedFranchise?.name} - {selectedFranchise?.city}
          </h3>
          <p className="text-muted-foreground">Relatório Financeiro {selectedYear}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-green-600 text-white">
                <th className="p-2 text-left font-semibold border border-green-700">MÊS</th>
                <th className="p-2 text-right font-semibold border border-green-700">VENDAS</th>
                <th className="p-2 text-right font-semibold border border-green-700">REALIZADO</th>
                <th className="p-2 text-right font-semibold border border-green-700">REF. MÊS ANT.</th>
                <th className="p-2 text-right font-semibold border border-green-700">MONITORIA</th>
                <th className="p-2 text-right font-semibold border border-green-700">FRETE</th>
                <th className="p-2 text-right font-semibold border border-green-700">DESP. FINANCEIRA</th>
                <th className="p-2 text-right font-semibold border border-green-700">LUCRO LÍQUIDO</th>
                <th className="p-2 text-right font-semibold border border-green-700">REC. FRANQUEADO</th>
                <th className="p-2 text-right font-semibold border border-green-700">REC. FRANQUEADORA</th>
                <th className="p-2 text-right font-semibold border border-green-700 bg-blue-500">FRANQUEADO RECEBEU</th>
                <th className="p-2 text-right font-semibold border border-green-700 bg-blue-500">FRANQUEADORA RECEBEU</th>
                <th className="p-2 text-right font-semibold border border-green-700">EQUILÍBRIO</th>
                <th className="p-2 text-right font-semibold border border-green-700 bg-orange-500">REPASSE</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {monthlyData.map((month) => (
                    <tr key={month.month} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium border">{month.month}</td>
                      <td className="p-2 text-right border">{formatCurrency(month.vendas)}</td>
                      <td className="p-2 text-right border">{formatCurrency(month.realizado)}</td>
                      <td className="p-2 text-right border">{formatPercent(month.refMesAnt)}</td>
                      <td className="p-2 text-right border">{formatCurrency(month.monitoria)}</td>
                      <td className="p-2 text-right border">{formatCurrency(month.frete)}</td>
                      <td className="p-2 text-right border">{formatCurrency(month.despFinanceira)}</td>
                      <td className="p-2 text-right border font-semibold">{formatCurrency(month.lucroLiquido)}</td>
                      <td className="p-2 text-right border">{formatCurrency(month.recFranqueado)}</td>
                      <td className="p-2 text-right border">{formatCurrency(month.recFranqueadora)}</td>
                      <td className="p-2 text-right border bg-blue-100 font-semibold">{formatCurrency(month.franqueadoRecebeu)}</td>
                      <td className="p-2 text-right border bg-blue-100 font-semibold">{formatCurrency(month.franqueadoraRecebeu)}</td>
                      <td className="p-2 text-right border">{formatCurrency(month.equilibrio)}</td>
                      <td className={`p-2 text-right border font-semibold ${month.repasse > 0 ? 'bg-green-100' : month.repasse < 0 ? 'bg-red-100' : 'bg-orange-100'}`}>
                        {formatCurrency(month.repasse)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-green-50 font-bold">
                    <td className="p-2 border">TOTAL</td>
                    <td className="p-2 text-right border">{formatCurrency(totals.vendas)}</td>
                    <td className="p-2 text-right border">{formatCurrency(totals.realizado)}</td>
                    <td className="p-2 text-right border">-</td>
                    <td className="p-2 text-right border">{formatCurrency(totals.monitoria)}</td>
                    <td className="p-2 text-right border">{formatCurrency(totals.frete)}</td>
                    <td className="p-2 text-right border">{formatCurrency(totals.despFinanceira)}</td>
                    <td className="p-2 text-right border">{formatCurrency(totals.lucroLiquido)}</td>
                    <td className="p-2 text-right border">{formatCurrency(totals.recFranqueado)}</td>
                    <td className="p-2 text-right border">{formatCurrency(totals.recFranqueadora)}</td>
                    <td className="p-2 text-right border bg-blue-200">{formatCurrency(totals.franqueadoRecebeu)}</td>
                    <td className="p-2 text-right border bg-blue-200">{formatCurrency(totals.franqueadoraRecebeu)}</td>
                    <td className="p-2 text-right border">-</td>
                    <td className={`p-2 text-right border font-bold ${totals.repasse > 0 ? 'bg-green-200' : totals.repasse < 0 ? 'bg-red-200' : 'bg-orange-200'}`}>
                      {formatCurrency(totals.repasse)}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FranchiseReport;
