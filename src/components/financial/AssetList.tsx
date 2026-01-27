import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Search, Building2 } from "lucide-react";

interface Asset {
  id: string;
  name: string;
  category_id: string | null;
  purchase_value: number;
  purchase_date: string;
  current_value: number | null;
  status: string;
  description: string | null;
  notes: string | null;
  expense_id: string | null;
  franchise_id: string | null;
}

interface AssetCategory {
  id: string;
  name: string;
  icon: string;
}

export function AssetList() {
  const { userFranchise } = useAuth();
  const franchiseId = userFranchise?.id;
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: "",
    category_id: "",
    purchase_value: "",
    purchase_date: format(new Date(), "yyyy-MM-dd"),
    current_value: "",
    status: "active",
    description: "",
    notes: "",
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
  };

  useEffect(() => {
    fetchData();
  }, [franchiseId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      let categoriesQuery = supabase
        .from("asset_categories")
        .select("id, name, icon")
        .order("name");

      if (franchiseId) {
        categoriesQuery = categoriesQuery.or(`franchise_id.eq.${franchiseId},franchise_id.is.null`);
      }

      // Fetch assets
      let assetsQuery = supabase
        .from("assets")
        .select("*")
        .order("purchase_date", { ascending: false });

      if (franchiseId) {
        assetsQuery = assetsQuery.eq("franchise_id", franchiseId);
      }

      const [categoriesResult, assetsResult] = await Promise.all([
        categoriesQuery,
        assetsQuery,
      ]);

      setCategories(categoriesResult.data || []);
      setAssets(assetsResult.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar patrimônios");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.purchase_value || !formData.purchase_date) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      const assetData = {
        name: formData.name,
        category_id: formData.category_id || null,
        purchase_value: parseFloat(formData.purchase_value),
        purchase_date: formData.purchase_date,
        current_value: formData.current_value ? parseFloat(formData.current_value) : null,
        status: formData.status,
        description: formData.description || null,
        notes: formData.notes || null,
        franchise_id: franchiseId || null,
      };

      if (editingAsset) {
        const { error } = await supabase
          .from("assets")
          .update(assetData)
          .eq("id", editingAsset.id);

        if (error) throw error;
        toast.success("Patrimônio atualizado!");
      } else {
        const { error } = await supabase.from("assets").insert(assetData);
        if (error) throw error;
        toast.success("Patrimônio cadastrado!");
      }

      resetForm();
      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving asset:", error);
      toast.error("Erro ao salvar patrimônio");
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      category_id: asset.category_id || "",
      purchase_value: asset.purchase_value.toString(),
      purchase_date: asset.purchase_date,
      current_value: asset.current_value?.toString() || "",
      status: asset.status,
      description: asset.description || "",
      notes: asset.notes || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (asset: Asset) => {
    if (!confirm(`Tem certeza que deseja excluir "${asset.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("assets")
        .delete()
        .eq("id", asset.id);

      if (error) throw error;
      toast.success("Patrimônio excluído!");
      fetchData();
    } catch (error) {
      console.error("Error deleting asset:", error);
      toast.error("Erro ao excluir patrimônio");
    }
  };

  const handleStatusChange = async (asset: Asset, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("assets")
        .update({ status: newStatus })
        .eq("id", asset.id);

      if (error) throw error;
      toast.success("Status atualizado!");
      fetchData();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category_id: "",
      purchase_value: "",
      purchase_date: format(new Date(), "yyyy-MM-dd"),
      current_value: "",
      status: "active",
      description: "",
      notes: "",
    });
    setEditingAsset(null);
  };

  const getCategoryInfo = (categoryId: string | null) => {
    if (!categoryId) return { name: "Sem categoria", icon: "📦" };
    const category = categories.find((c) => c.id === categoryId);
    return category || { name: "Desconhecida", icon: "❓" };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Ativo</Badge>;
      case "sold":
        return <Badge variant="secondary">Vendido</Badge>;
      case "written_off":
        return <Badge variant="destructive">Baixado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter assets
  let filteredAssets = assets;

  if (categoryFilter !== "all") {
    filteredAssets = filteredAssets.filter((a) => a.category_id === categoryFilter);
  }

  if (statusFilter !== "all") {
    filteredAssets = filteredAssets.filter((a) => a.status === statusFilter);
  }

  if (searchTerm.trim()) {
    const search = searchTerm.toLowerCase();
    filteredAssets = filteredAssets.filter(
      (a) =>
        a.name.toLowerCase().includes(search) ||
        a.description?.toLowerCase().includes(search)
    );
  }

  // Calculate totals
  const totals = {
    totalPurchaseValue: assets.filter(a => a.status === "active").reduce((sum, a) => sum + a.purchase_value, 0),
    totalCurrentValue: assets.filter(a => a.status === "active").reduce((sum, a) => sum + (a.current_value || a.purchase_value), 0),
    activeCount: assets.filter((a) => a.status === "active").length,
    soldCount: assets.filter((a) => a.status === "sold").length,
    writtenOffCount: assets.filter((a) => a.status === "written_off").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Patrimônios Ativos</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-2xl font-bold">{totals.activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Valor de Aquisição</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-xl font-bold text-primary">
              {formatCurrency(totals.totalPurchaseValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Valor Atual Estimado</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-xl font-bold text-green-600">
              {formatCurrency(totals.totalCurrentValue)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium">Vendidos / Baixados</CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="text-xl font-bold text-muted-foreground">
              {totals.soldCount} / {totals.writtenOffCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header with Filters */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-4 items-center">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Building2 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="sold">Vendidos</SelectItem>
              <SelectItem value="written_off">Baixados</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pesquisar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Patrimônio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAsset ? "Editar Patrimônio" : "Novo Patrimônio"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Bem *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Fiat Uno ABC-1234"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Tipo</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Data da Compra *</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) =>
                      setFormData({ ...formData, purchase_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_value">Valor de Aquisição (R$) *</Label>
                  <Input
                    id="purchase_value"
                    type="number"
                    step="0.01"
                    value={formData.purchase_value}
                    onChange={(e) =>
                      setFormData({ ...formData, purchase_value: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current_value">Valor Atual (R$)</Label>
                  <Input
                    id="current_value"
                    type="number"
                    step="0.01"
                    value={formData.current_value}
                    onChange={(e) =>
                      setFormData({ ...formData, current_value: e.target.value })
                    }
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="sold">Vendido</SelectItem>
                    <SelectItem value="written_off">Baixado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detalhes do bem..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">{editingAsset ? "Salvar" : "Cadastrar"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Data Compra</TableHead>
              <TableHead>Valor Aquisição</TableHead>
              <TableHead>Valor Atual</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum patrimônio encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredAssets.map((asset) => {
                const categoryInfo = getCategoryInfo(asset.category_id);
                return (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <span className="text-lg mr-1">{categoryInfo.icon}</span>
                      <span className="text-sm text-muted-foreground">{categoryInfo.name}</span>
                    </TableCell>
                    <TableCell className="font-medium">{asset.name}</TableCell>
                    <TableCell>{formatDate(asset.purchase_date)}</TableCell>
                    <TableCell>{formatCurrency(asset.purchase_value)}</TableCell>
                    <TableCell>
                      {asset.current_value
                        ? formatCurrency(asset.current_value)
                        : <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>{getStatusBadge(asset.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(asset)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(asset)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
