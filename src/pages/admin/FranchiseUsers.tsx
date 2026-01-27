import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, UserPlus, Pencil, Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Franchise = {
  id: string;
  name: string;
  city: string;
};

type FranchiseUser = {
  id: string;
  user_id: string;
  franchise_id: string;
  name: string | null;
  email: string;
  franchise_name: string;
  created_at: string;
};

const FranchiseUsers = () => {
  const { isFranqueadora } = useAuth();
  const [users, setUsers] = useState<FranchiseUser[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    franchise_id: "",
  });

  const [editingUser, setEditingUser] = useState<FranchiseUser | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    franchise_id: "",
    newPassword: "",
  });
  const [updatingPassword, setUpdatingPassword] = useState(false);
  
  // Estados para validação de email
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Estados para mostrar/ocultar senha
  const [showPassword, setShowPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [emailValid, setEmailValid] = useState(false);

  useEffect(() => {
    if (!isFranqueadora) {
      toast.error("Acesso negado. Apenas franqueadoras podem gerenciar franqueados.");
      return;
    }
    fetchData();
  }, [isFranqueadora]);

  // Validação de email em tempo real com debounce
  useEffect(() => {
    if (!formData.email) {
      setEmailError(null);
      setEmailValid(false);
      return;
    }

    // Validação básica de formato
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setEmailError(null);
      setEmailValid(false);
      return;
    }

    setEmailChecking(true);
    
    const timer = setTimeout(() => {
      const emailExists = users.some(
        user => user.email.toLowerCase() === formData.email.toLowerCase()
      );
      
      if (emailExists) {
        setEmailError("Este email já está cadastrado");
        setEmailValid(false);
      } else {
        setEmailError(null);
        setEmailValid(true);
      }
      setEmailChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, users]);

  const fetchData = async () => {
    try {
      // Buscar franquias
      const { data: franchisesData, error: franchisesError } = await supabase
        .from("franchises")
        .select("id, name, city")
        .eq("status", "active")
        .order("name");

      if (franchisesError) throw franchisesError;
      setFranchises(franchisesData || []);

      // Buscar usuários franqueados
      const { data: usersData, error: usersError } = await supabase
        .from("user_franchises")
        .select(`
          id,
          user_id,
          franchise_id,
          name,
          created_at,
          franchises (
            name
          )
        `);

      if (usersError) throw usersError;

      // Buscar emails dos usuários
      if (usersData && usersData.length > 0) {
        const usersWithEmails = await Promise.all(
          usersData.map(async (userData) => {
            // Tentar buscar email via metadata
            const { data: authData } = await supabase.auth.admin.getUserById(userData.user_id);
            
            return {
              id: userData.id,
              user_id: userData.user_id,
              franchise_id: userData.franchise_id,
              name: userData.name,
              email: authData?.user?.email || "Email não disponível",
              franchise_name: (userData.franchises as any)?.name || "",
              created_at: userData.created_at,
            };
          })
        );

        setUsers(usersWithEmails);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.franchise_id) {
      toast.error("Preencha todos os campos");
      return;
    }

    if (emailError) {
      toast.error("Corrija o email antes de continuar");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      // Criar franqueado via edge function (mantém sessão da franqueadora)
      const response = await supabase.functions.invoke('create-franchisee', {
        body: {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          franchise_id: formData.franchise_id,
        },
      });

      if (response.error) {
        console.error("Error from edge function:", response.error);
        throw new Error(response.error.message || "Erro ao criar franqueado");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast.success("Franqueado criado com sucesso");
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error("Error creating franchise user:", error);
      
      if (error.message?.includes("já está cadastrado") || error.message?.includes("already registered")) {
        toast.error("Este email já está cadastrado");
      } else {
        toast.error(error.message || "Erro ao criar franqueado");
      }
    }
  };

  const handleEdit = (user: FranchiseUser) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || "",
      franchise_id: user.franchise_id,
      newPassword: "",
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;

    if (!editFormData.name || !editFormData.franchise_id) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (editFormData.newPassword && editFormData.newPassword.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres");
      return;
    }

    try {
      // Update user_franchises data
      const { error } = await supabase
        .from("user_franchises")
        .update({
          name: editFormData.name,
          franchise_id: editFormData.franchise_id,
        })
        .eq("id", editingUser.id);

      if (error) throw error;

      // If new password was provided, update it via edge function
      if (editFormData.newPassword) {
        setUpdatingPassword(true);
        
        const { data: sessionData } = await supabase.auth.getSession();
        const response = await supabase.functions.invoke('reset-franchisee-password', {
          body: {
            user_id: editingUser.user_id,
            new_password: editFormData.newPassword,
          },
        });

        if (response.error) {
          console.error("Error resetting password:", response.error);
          toast.error("Dados atualizados, mas erro ao redefinir senha");
          setUpdatingPassword(false);
          setEditingUser(null);
          fetchData();
          return;
        }

        setUpdatingPassword(false);
        toast.success("Franqueado e senha atualizados com sucesso");
      } else {
        toast.success("Franqueado atualizado com sucesso");
      }

      setEditingUser(null);
      fetchData();
    } catch (error) {
      console.error("Error updating franchise user:", error);
      toast.error("Erro ao atualizar franqueado");
      setUpdatingPassword(false);
    }
  };

  const handleDelete = async (userId: string, userFranchiseId: string) => {
    if (!confirm("Tem certeza que deseja remover este franqueado?")) return;

    try {
      // Remover vínculo franquia-usuário
      const { error: franchiseError } = await supabase
        .from("user_franchises")
        .delete()
        .eq("id", userFranchiseId);

      if (franchiseError) throw franchiseError;

      // Remover role
      const { error: roleError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId);

      if (roleError) throw roleError;

      // Delete from auth.users via edge function
      const { data: sessionData } = await supabase.auth.getSession();
      const { error: deleteUserError } = await supabase.functions.invoke('delete-user', {
        body: { user_id: userId },
        headers: {
          Authorization: `Bearer ${sessionData.session?.access_token}`,
        },
      });

      if (deleteUserError) {
        console.error("Error deleting auth user:", deleteUserError);
      }

      toast.success("Franqueado removido completamente");
      fetchData();
    } catch (error) {
      console.error("Error deleting franchise user:", error);
      toast.error("Erro ao remover franqueado");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      franchise_id: "",
    });
    setEmailError(null);
    setEmailValid(false);
  };

  if (!isFranqueadora) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-muted-foreground">
          Acesso Negado
        </h2>
        <p className="text-muted-foreground mt-2">
          Esta página é acessível apenas para franqueadoras
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestão de Franqueados</h2>
          <p className="text-muted-foreground">
            Crie e gerencie contas de acesso para franqueados
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Novo Franqueado</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome do franqueado"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">E-mail *</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="franqueado@email.com"
                  required
                  className={cn(
                    "pr-10",
                    emailError && "border-destructive focus-visible:ring-destructive",
                    emailValid && "border-green-500 focus-visible:ring-green-500"
                  )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {emailChecking && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!emailChecking && emailError && <AlertCircle className="h-4 w-4 text-destructive" />}
                  {!emailChecking && emailValid && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
              </div>
              {emailError && (
                <p className="text-sm text-destructive mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Senha *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="franchise">Unidade *</Label>
              <Select
                value={formData.franchise_id}
                onValueChange={(value) => setFormData({ ...formData, franchise_id: value })}
              >
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
          </div>

          <Button type="submit" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Criar Franqueado
          </Button>
        </form>
      </Card>

      {/* Lista de Franqueados */}
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <UserPlus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-semibold">{user.name || user.email}</h4>
                  {user.name && (
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Unidade: {user.franchise_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Criado em: {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleEdit(user)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(user.user_id, user.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhum franqueado cadastrado ainda
          </p>
        </div>
      )}

      {/* Modal de Edição */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Franqueado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="edit-email">E-mail (somente leitura)</Label>
              <Input
                id="edit-email"
                type="email"
                value={editingUser?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Nome do franqueado"
              />
            </div>

            <div>
              <Label htmlFor="edit-franchise">Unidade</Label>
              <Select
                value={editFormData.franchise_id}
                onValueChange={(value) => setEditFormData({ ...editFormData, franchise_id: value })}
              >
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

            <div>
              <Label htmlFor="edit-password">Nova Senha (opcional)</Label>
              <div className="relative">
                <Input
                  id="edit-password"
                  type={showEditPassword ? "text" : "password"}
                  value={editFormData.newPassword}
                  onChange={(e) => setEditFormData({ ...editFormData, newPassword: e.target.value })}
                  placeholder="Deixe vazio para manter a atual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowEditPassword(!showEditPassword)}
                >
                  {showEditPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Mínimo 6 caracteres. Deixe em branco para não alterar.
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingUser(null)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleUpdate} className="flex-1" disabled={updatingPassword}>
                {updatingPassword ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FranchiseUsers;
