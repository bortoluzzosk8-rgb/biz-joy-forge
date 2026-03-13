import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Download, Database, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TableKey =
  | "sales"
  | "sale_items"
  | "sale_payments"
  | "clients"
  | "products"
  | "categories"
  | "inventory_items"
  | "expenses"
  | "expense_categories"
  | "loans"
  | "loan_installments"
  | "credit_cards"
  | "assets"
  | "asset_categories"
  | "monitors"
  | "drivers"
  | "sellers"
  | "franchises"
  | "logistics_vehicles"
  | "logistics_assignments"
  | "settings"
  | "purchases"
  | "product_codes"
  | "equipment_status"
  | "equipment_archive"
  | "inventory_archive"
  | "subscription_payments"
  | "system_updates";

const EXPORTABLE_TABLES: { key: TableKey; label: string; group: string }[] = [
  { key: "sales", label: "Locações / Vendas", group: "Vendas" },
  { key: "sale_items", label: "Itens das Vendas", group: "Vendas" },
  { key: "sale_payments", label: "Pagamentos das Vendas", group: "Vendas" },
  { key: "clients", label: "Clientes", group: "Cadastros" },
  { key: "products", label: "Produtos", group: "Cadastros" },
  { key: "categories", label: "Categorias", group: "Cadastros" },
  { key: "monitors", label: "Monitores", group: "Cadastros" },
  { key: "drivers", label: "Motoristas", group: "Cadastros" },
  { key: "sellers", label: "Vendedores", group: "Cadastros" },
  { key: "franchises", label: "Franquias / Unidades", group: "Cadastros" },
  { key: "inventory_items", label: "Itens de Inventário", group: "Estoque" },
  { key: "purchases", label: "Compras", group: "Estoque" },
  { key: "product_codes", label: "Códigos de Produto", group: "Estoque" },
  { key: "equipment_status", label: "Status dos Equipamentos", group: "Estoque" },
  { key: "equipment_archive", label: "Equipamentos Arquivados", group: "Estoque" },
  { key: "inventory_archive", label: "Inventário Arquivado", group: "Estoque" },
  { key: "expenses", label: "Despesas", group: "Financeiro" },
  { key: "expense_categories", label: "Categorias de Despesa", group: "Financeiro" },
  { key: "loans", label: "Empréstimos", group: "Financeiro" },
  { key: "loan_installments", label: "Parcelas de Empréstimo", group: "Financeiro" },
  { key: "credit_cards", label: "Cartões de Crédito", group: "Financeiro" },
  { key: "assets", label: "Ativos / Patrimônio", group: "Financeiro" },
  { key: "asset_categories", label: "Categorias de Patrimônio", group: "Financeiro" },
  { key: "subscription_payments", label: "Pagamentos de Assinatura", group: "Financeiro" },
  { key: "logistics_vehicles", label: "Veículos", group: "Logística" },
  { key: "logistics_assignments", label: "Atribuições Logísticas", group: "Logística" },
  { key: "settings", label: "Configurações", group: "Sistema" },
  { key: "system_updates", label: "Atualizações do Sistema", group: "Sistema" },
];

function toCsv(data: Record<string, unknown>[]): string {
  if (!data.length) return "";
  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h];
        const str = val === null || val === undefined ? "" : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const bom = "\uFEFF";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const ExportData = () => {
  const [selected, setSelected] = useState<Set<TableKey>>(new Set());
  const [exporting, setExporting] = useState(false);

  const toggle = (key: TableKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === EXPORTABLE_TABLES.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(EXPORTABLE_TABLES.map((t) => t.key)));
    }
  };

  const handleExport = async () => {
    if (selected.size === 0) {
      toast.error("Selecione pelo menos uma tabela para exportar");
      return;
    }

    setExporting(true);
    let exported = 0;

    try {
      for (const key of selected) {
        const { data, error } = await supabase.from(key).select("*");
        if (error) {
          console.error(`Erro ao exportar ${key}:`, error);
          toast.error(`Erro ao exportar ${key}`);
          continue;
        }
        if (!data || data.length === 0) {
          toast.info(`Tabela "${key}" está vazia, pulando...`);
          continue;
        }
        const csv = toCsv(data as Record<string, unknown>[]);
        downloadCsv(`${key}_${new Date().toISOString().slice(0, 10)}.csv`, csv);
        exported++;
      }

      if (exported > 0) {
        toast.success(`${exported} tabela(s) exportada(s) com sucesso!`);
      }
    } catch (err) {
      console.error("Erro na exportação:", err);
      toast.error("Erro ao exportar dados");
    } finally {
      setExporting(false);
    }
  };

  const groups = [...new Set(EXPORTABLE_TABLES.map((t) => t.group))];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          Exportar Dados (CSV)
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selecione as tabelas que deseja exportar. Cada tabela será baixada como um arquivo CSV separado.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={selectAll}>
          {selected.size === EXPORTABLE_TABLES.length ? "Desmarcar Tudo" : "Selecionar Tudo"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {selected.size} de {EXPORTABLE_TABLES.length} selecionadas
        </span>
      </div>

      {groups.map((group) => (
        <Card key={group} className="p-4">
          <h3 className="font-semibold text-foreground mb-3">{group}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXPORTABLE_TABLES.filter((t) => t.group === group).map((table) => (
              <label
                key={table.key}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selected.has(table.key)}
                  onCheckedChange={() => toggle(table.key)}
                />
                <span className="text-sm">{table.label}</span>
              </label>
            ))}
          </div>
        </Card>
      ))}

      <Button onClick={handleExport} disabled={exporting || selected.size === 0} size="lg" className="w-full sm:w-auto">
        {exporting ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Download className="w-4 h-4 mr-2" />
        )}
        {exporting ? "Exportando..." : `Exportar ${selected.size} tabela(s)`}
      </Button>
    </div>
  );
};

export default ExportData;
