import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface AssetCategory {
  id: string;
  name: string;
  icon: string;
  franchise_id: string | null;
}

export function AssetCategoryManager() {
  const { userFranchise } = useAuth();
  const franchiseId = userFranchise?.id;
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AssetCategory | null>(null);
  const [formData, setFormData] = useState({ name: "", icon: "🏢" });

  useEffect(() => {
    fetchCategories();
  }, [franchiseId]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("asset_categories")
        .select("*")
        .order("name");

      if (franchiseId) {
        query = query.or(`franchise_id.eq.${franchiseId},franchise_id.is.null`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching asset categories:", error);
      toast.error("Erro ao carregar subcategorias de patrimônio");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error("Informe o nome da subcategoria");
      return;
    }

    try {
      if (editingCategory) {
        // Only allow editing custom categories (not global)
        if (editingCategory.franchise_id === null) {
          toast.error("Não é possível editar subcategorias globais");
          return;
        }

        const { error } = await supabase
          .from("asset_categories")
          .update({ name: formData.name, icon: formData.icon })
          .eq("id", editingCategory.id);

        if (error) throw error;
        toast.success("Subcategoria atualizada!");
      } else {
        const { error } = await supabase.from("asset_categories").insert({
          name: formData.name,
          icon: formData.icon,
          franchise_id: franchiseId || null,
        });

        if (error) throw error;
        toast.success("Subcategoria criada!");
      }

      resetForm();
      setDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Error saving asset category:", error);
      toast.error("Erro ao salvar subcategoria");
    }
  };

  const handleEdit = (category: AssetCategory) => {
    if (category.franchise_id === null) {
      toast.error("Não é possível editar subcategorias globais");
      return;
    }
    setEditingCategory(category);
    setFormData({ name: category.name, icon: category.icon });
    setDialogOpen(true);
  };

  const handleDelete = async (category: AssetCategory) => {
    if (category.franchise_id === null) {
      toast.error("Não é possível excluir subcategorias globais");
      return;
    }

    if (!confirm(`Tem certeza que deseja excluir "${category.name}"?`)) return;

    try {
      const { error } = await supabase
        .from("asset_categories")
        .delete()
        .eq("id", category.id);

      if (error) throw error;
      toast.success("Subcategoria excluída!");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting asset category:", error);
      toast.error("Erro ao excluir subcategoria");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", icon: "🏢" });
    setEditingCategory(null);
  };

  const ICON_OPTIONS = ["🏠", "🚗", "🔧", "🪑", "💻", "📦", "🏢", "🏭", "🚚", "📱", "🖥️", "🎸"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Subcategorias de Patrimônio</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nova Subcategoria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Editar Subcategoria" : "Nova Subcategoria"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Imóvel, Veículo..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Ícone</Label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={formData.icon === icon ? "default" : "outline"}
                      size="sm"
                      className="text-lg w-10 h-10"
                      onClick={() => setFormData({ ...formData, icon })}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCategory ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ícone</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhuma subcategoria cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="text-2xl">{category.icon}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      {category.franchise_id === null ? (
                        <span className="text-xs text-muted-foreground">Global</span>
                      ) : (
                        <span className="text-xs text-blue-600">Personalizada</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {category.franchise_id !== null && (
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(category)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
