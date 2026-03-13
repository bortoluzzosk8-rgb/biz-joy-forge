import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Download, Database, Loader2, Users, HardDrive } from "lucide-react";
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

const STORAGE_BUCKETS = ["payment-receipts", "logos", "inventory-images"];

function escSql(val: unknown): string {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
  return `'${String(val).replace(/'/g, "''")}'`;
}

function toSql(tableName: string, data: Record<string, unknown>[]): string {
  if (!data.length) return "";
  const headers = Object.keys(data[0]);
  const lines = data.map((row) => {
    const values = headers.map((h) => escSql(row[h])).join(", ");
    return `INSERT INTO public.${tableName} (${headers.join(", ")}) VALUES (${values});`;
  });
  return lines.join("\n");
}

function downloadSql(filename: string, content: string) {
  const blob = new Blob([content], { type: "application/sql;charset=utf-8;" });
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
  const [exportingUsers, setExportingUsers] = useState(false);
  const [exportingStorage, setExportingStorage] = useState(false);
  const [selectedBuckets, setSelectedBuckets] = useState<Set<string>>(new Set());

  const toggle = (key: TableKey) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleBucket = (bucket: string) => {
    setSelectedBuckets((prev) => {
      const next = new Set(prev);
      if (next.has(bucket)) next.delete(bucket);
      else next.add(bucket);
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
        const sql = toSql(key, data as Record<string, unknown>[]);
        downloadSql(`${key}_${new Date().toISOString().slice(0, 10)}.sql`, sql);
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

  const handleExportUsers = async () => {
    setExportingUsers(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
      }

      const { data, error } = await supabase.functions.invoke("export-users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (error) throw error;
      if (!data || !Array.isArray(data) || data.length === 0) {
        toast.info("Nenhum usuário encontrado.");
        return;
      }

      const csv = toCsv(data as Record<string, unknown>[]);
      downloadCsv(`users_${new Date().toISOString().slice(0, 10)}.csv`, csv);
      toast.success("Usuários exportados com sucesso!");
    } catch (err: any) {
      console.error("Erro ao exportar usuários:", err);
      toast.error("Erro ao exportar usuários");
    } finally {
      setExportingUsers(false);
    }
  };

  const handleExportStorage = async () => {
    if (selectedBuckets.size === 0) {
      toast.error("Selecione pelo menos um bucket");
      return;
    }
    setExportingStorage(true);
    let exported = 0;
    try {
      for (const bucket of selectedBuckets) {
        const { data, error } = await supabase.storage.from(bucket).list("", {
          limit: 1000,
          sortBy: { column: "created_at", order: "desc" },
        });
        if (error) {
          console.error(`Erro ao listar ${bucket}:`, error);
          toast.error(`Erro ao listar bucket "${bucket}"`);
          continue;
        }
        if (!data || data.length === 0) {
          toast.info(`Bucket "${bucket}" está vazio, pulando...`);
          continue;
        }
        const rows = data.map((file) => ({
          name: file.name,
          size_bytes: (file.metadata as any)?.size || "",
          mime_type: (file.metadata as any)?.mimetype || "",
          created_at: file.created_at,
          updated_at: file.updated_at,
          public_url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${file.name}`,
        }));
        const csv = toCsv(rows as Record<string, unknown>[]);
        downloadCsv(`storage_${bucket}_${new Date().toISOString().slice(0, 10)}.csv`, csv);
        exported++;
      }
      if (exported > 0) {
        toast.success(`${exported} bucket(s) exportado(s) com sucesso!`);
      }
    } catch (err) {
      console.error("Erro ao exportar storage:", err);
      toast.error("Erro ao exportar storage");
    } finally {
      setExportingStorage(false);
    }
  };

  const groups = [...new Set(EXPORTABLE_TABLES.map((t) => t.group))];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Database className="w-6 h-6 text-primary" />
          Exportar Dados
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Exporte dados do sistema em formato CSV.
        </p>
      </div>

      {/* USERS */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Users (Usuários Autenticados)
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Exporta ID, email, telefone, data de criação e último login de todos os usuários.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportUsers}
          disabled={exportingUsers}
        >
          {exportingUsers ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {exportingUsers ? "Exportando..." : "Exportar Usuários"}
        </Button>
      </Card>

      {/* STORAGE */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-primary" />
          Storage (Arquivos)
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Exporta a listagem de arquivos (nome, tamanho, tipo, URL pública) de cada bucket.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          {STORAGE_BUCKETS.map((bucket) => (
            <label
              key={bucket}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <Checkbox
                checked={selectedBuckets.has(bucket)}
                onCheckedChange={() => toggleBucket(bucket)}
              />
              <span className="text-sm">{bucket}</span>
            </label>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportStorage}
          disabled={exportingStorage || selectedBuckets.size === 0}
        >
          {exportingStorage ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {exportingStorage ? "Exportando..." : `Exportar ${selectedBuckets.size} bucket(s)`}
        </Button>
      </Card>

      {/* DATABASE TABLES */}
      <Card className="p-4">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          Database (Tabelas)
        </h3>
        <div className="flex items-center gap-3 mb-3">
          <Button variant="outline" size="sm" onClick={selectAll}>
            {selected.size === EXPORTABLE_TABLES.length ? "Desmarcar Tudo" : "Selecionar Tudo"}
          </Button>
          <span className="text-sm text-muted-foreground">
            {selected.size} de {EXPORTABLE_TABLES.length} selecionadas
          </span>
        </div>
      </Card>

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

      <Button
        onClick={handleExport}
        disabled={exporting || selected.size === 0}
        size="lg"
        className="w-full sm:w-auto"
      >
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
