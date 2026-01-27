import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, DollarSign, Calendar, CalendarIcon, X, Wallet, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { format, addMonths, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import FranchiseDashboard from "./FranchiseDashboard";
import SellerDashboard from "./SellerDashboard";
import SuperAdminDashboard from "./SuperAdminDashboard";

type SalePayment = {
  id: string;
  amount: number;
  payment_date: string | null;
  due_date: string | null;
  status: string;
};

type Expense = {
  id: string;
  amount: number;
  expense_date: string;
  due_date: string | null;
  status: string;
};

type LoanInstallment = {
  id: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: string;
};

type Purchase = {
  id: string;
  total_value: number;
  installments: number;
  installment_dates: string[];
  purchase_date: string;
};

type MonthlyData = {
  month: string;
  monthLabel: string;
  receitasRealizadas: number;
  receitasPrevistas: number;
  despesasRealizadas: number;
  despesasPrevistas: number;
  resultado: number;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { isFranqueado, isFranqueadora, isVendedor, isMotorista, isSuperAdmin } = useAuth();

  useEffect(() => {
    if (isMotorista && !isFranqueadora && !isFranqueado && !isVendedor && !isSuperAdmin) {
      navigate("/admin/logistics", { replace: true });
    }
  }, [isMotorista, isFranqueadora, isFranqueado, isVendedor, isSuperAdmin, navigate]);

  // Se for motorista, mostra loading enquanto redireciona
  if (isMotorista && !isFranqueadora && !isFranqueado && !isVendedor && !isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Super Admin vê o dashboard do SaaS
  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  if (isVendedor && !isFranqueadora && !isFranqueado) {
    return <SellerDashboard />;
  }

  if (isFranqueado && !isFranqueadora) {
    return <FranchiseDashboard />;
  }

  return <FinancialDashboard />;
};

const FinancialDashboard = () => {
  const [salePayments, setSalePayments] = useState<SalePayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loanInstallments, setLoanInstallments] = useState<LoanInstallment[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [salePaymentsResult, expensesResult, loanInstallmentsResult, purchasesResult] = await Promise.all([
        supabase.from("sale_payments").select("id, amount, payment_date, due_date, status"),
        supabase.from("expenses").select("id, amount, expense_date, due_date, status"),
        supabase.from("loan_installments").select("id, amount, due_date, payment_date, status"),
        supabase.from("purchases").select("id, total_value, installments, installment_dates, purchase_date"),
      ]);

      if (salePaymentsResult.error) throw salePaymentsResult.error;
      if (expensesResult.error) throw expensesResult.error;
      if (loanInstallmentsResult.error) throw loanInstallmentsResult.error;
      if (purchasesResult.error) throw purchasesResult.error;

      setSalePayments(salePaymentsResult.data || []);
      setExpenses(expensesResult.data || []);
      setLoanInstallments(loanInstallmentsResult.data || []);
      setPurchases((purchasesResult.data || []).map(p => ({
        ...p,
        installment_dates: Array.isArray(p.installment_dates) ? p.installment_dates as string[] : []
      })));
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Erro ao carregar dados do dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatMonthLabel = (month: string): string => {
    const [year, monthNum] = month.split("-");
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    return `${monthNames[parseInt(monthNum) - 1]}/${year.slice(2)}`;
  };

  const processFinancialData = (): MonthlyData[] => {
    const monthMap = new Map<string, {
      receitasRealizadas: number;
      receitasPrevistas: number;
      despesasRealizadas: number;
      despesasPrevistas: number;
    }>();

    const filterByDateRange = (dateStr: string): boolean => {
      if (!startDate && !endDate) return true;
      const date = new Date(dateStr);
      if (startDate && date < startDate) return false;
      if (endDate) {
        const endDateCopy = new Date(endDate);
        endDateCopy.setHours(23, 59, 59, 999);
        if (date > endDateCopy) return false;
      }
      return true;
    };

    const initMonth = (monthKey: string) => {
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          receitasRealizadas: 0,
          receitasPrevistas: 0,
          despesasRealizadas: 0,
          despesasPrevistas: 0,
        });
      }
    };

    // Processar RECEITAS (sale_payments)
    salePayments.forEach((payment) => {
      const isPaid = payment.status === "paid";
      const dateStr = isPaid ? payment.payment_date : payment.due_date;
      
      if (!dateStr || !filterByDateRange(dateStr)) return;
      
      const monthKey = dateStr.substring(0, 7);
      initMonth(monthKey);
      
      const current = monthMap.get(monthKey)!;
      if (isPaid) {
        current.receitasRealizadas += payment.amount;
      } else {
        current.receitasPrevistas += payment.amount;
      }
    });

    // Processar DESPESAS GERAIS (expenses)
    expenses.forEach((expense) => {
      const isPaid = expense.status === "paid";
      const dateStr = isPaid ? expense.expense_date : (expense.due_date || expense.expense_date);
      
      if (!dateStr || !filterByDateRange(dateStr)) return;
      
      const monthKey = dateStr.substring(0, 7);
      initMonth(monthKey);
      
      const current = monthMap.get(monthKey)!;
      if (isPaid) {
        current.despesasRealizadas += expense.amount;
      } else {
        current.despesasPrevistas += expense.amount;
      }
    });

    // Processar PARCELAS DE EMPRÉSTIMOS (loan_installments)
    loanInstallments.forEach((installment) => {
      const isPaid = installment.status === "paid";
      const dateStr = isPaid ? (installment.payment_date || installment.due_date) : installment.due_date;
      
      if (!dateStr || !filterByDateRange(dateStr)) return;
      
      const monthKey = dateStr.substring(0, 7);
      initMonth(monthKey);
      
      const current = monthMap.get(monthKey)!;
      if (isPaid) {
        current.despesasRealizadas += installment.amount;
      } else {
        current.despesasPrevistas += installment.amount;
      }
    });

    // Processar COMPRAS (purchases) - distribuir por installment_dates ou purchase_date
    purchases.forEach((purchase) => {
      const installmentValue = purchase.total_value / (purchase.installments || 1);
      const dates = purchase.installment_dates.length > 0 
        ? purchase.installment_dates 
        : [purchase.purchase_date];

      dates.forEach((dateStr) => {
        if (!dateStr || !filterByDateRange(dateStr)) return;
        
        const monthKey = dateStr.substring(0, 7);
        initMonth(monthKey);
        
        const current = monthMap.get(monthKey)!;
        // Compras são consideradas "realizadas" pois já foram feitas
        current.despesasRealizadas += installmentValue;
      });
    });

    // Garantir que temos pelo menos 12 meses (6 passados + mês atual + 5 futuros)
    const today = new Date();
    const startMonth = startOfMonth(addMonths(today, -6));
    const endMonth = endOfMonth(addMonths(today, 5));
    
    let current = startMonth;
    while (current <= endMonth) {
      const monthKey = format(current, "yyyy-MM");
      initMonth(monthKey);
      current = addMonths(current, 1);
    }

    return Array.from(monthMap.entries())
      .map(([month, data]) => ({
        month,
        monthLabel: formatMonthLabel(month),
        ...data,
        resultado: (data.receitasRealizadas + data.receitasPrevistas) - 
                   (data.despesasRealizadas + data.despesasPrevistas),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const monthlyData = processFinancialData();

  const totals = monthlyData.reduce(
    (acc, item) => ({
      receitasRealizadas: acc.receitasRealizadas + item.receitasRealizadas,
      receitasPrevistas: acc.receitasPrevistas + item.receitasPrevistas,
      despesasRealizadas: acc.despesasRealizadas + item.despesasRealizadas,
      despesasPrevistas: acc.despesasPrevistas + item.despesasPrevistas,
    }),
    { receitasRealizadas: 0, receitasPrevistas: 0, despesasRealizadas: 0, despesasPrevistas: 0 }
  );

  const saldoAtual = totals.receitasRealizadas - totals.despesasRealizadas;
  const saldoProjetado = (totals.receitasRealizadas + totals.receitasPrevistas) - 
                         (totals.despesasRealizadas + totals.despesasPrevistas);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const clearFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h2>
          <p className="text-muted-foreground">Visão completa de receitas e despesas - Realizado vs Previsto</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "dd/MM/yyyy") : "Data inicial"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[160px] justify-start text-left font-normal",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "dd/MM/yyyy") : "Data final"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>

          {(startDate || endDate) && (
            <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar filtros">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Realizadas</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totals.receitasRealizadas)}</div>
            <p className="text-xs text-muted-foreground">Já recebido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas Previstas</CardTitle>
            <Target className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-400">{formatCurrency(totals.receitasPrevistas)}</div>
            <p className="text-xs text-muted-foreground">A receber</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Realizadas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{formatCurrency(totals.despesasRealizadas)}</div>
            <p className="text-xs text-muted-foreground">Já pago</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Previstas</CardTitle>
            <Calendar className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-400">{formatCurrency(totals.despesasPrevistas)}</div>
            <p className="text-xs text-muted-foreground">A pagar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl font-bold", saldoAtual >= 0 ? "text-green-600" : "text-red-600")}>
              {formatCurrency(saldoAtual)}
            </div>
            <p className="text-xs text-muted-foreground">Realizado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Projetado</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-xl font-bold", saldoProjetado >= 0 ? "text-green-600" : "text-red-600")}>
              {formatCurrency(saldoProjetado)}
            </div>
            <p className="text-xs text-muted-foreground">Com previsões</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico Principal */}
      <Card>
        <CardHeader>
          <CardTitle>Fluxo de Caixa - Realizado vs Previsto</CardTitle>
          <p className="text-sm text-muted-foreground">
            Linhas sólidas = valores realizados | Linhas tracejadas = valores previstos
          </p>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">Nenhum dado financeiro encontrado</p>
                <p className="text-sm">Adicione receitas e despesas para visualizar o fluxo de caixa</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="monthLabel" className="text-xs" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} className="text-xs" width={100} />
                <Tooltip
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receitasRealizadas" 
                  stroke="#22c55e" 
                  name="Receitas Realizadas" 
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 0, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="receitasPrevistas" 
                  stroke="#86efac" 
                  name="Receitas Previstas" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#86efac", strokeWidth: 0, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="despesasRealizadas" 
                  stroke="#ef4444" 
                  name="Despesas Realizadas" 
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", strokeWidth: 0, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="despesasPrevistas" 
                  stroke="#fca5a5" 
                  name="Despesas Previstas" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#fca5a5", strokeWidth: 0, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="resultado" 
                  stroke="#3b82f6" 
                  name="Resultado" 
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
