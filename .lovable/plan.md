

## Plano: Remover Completamente o Conceito de "Franqueado" do Sistema

### Contexto

O sistema está sendo transformado de um modelo de franquias (franqueadora -> franqueados) para um modelo SaaS simples onde:
- **Antes**: Franqueadora cria franqueados para gerenciar unidades
- **Depois**: Cada cliente SaaS é diretamente uma "franqueadora" (dono do sistema) - sem sub-franqueados

---

### Resumo das Alteracoes

O conceito de "franqueado" será **completamente removido** do sistema:

1. Remover menu "Franqueados" do painel
2. Remover a página `/admin/franchise-users`
3. Remover a role "franqueado" de todas as verificações
4. Excluir edge functions relacionadas a franqueados
5. Limpar referências no contexto de autenticação

---

### Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/admin/AdminLayout.tsx` | Remover "franqueado" dos roles e menu "Franqueados" |
| `src/App.tsx` | Remover rota `/admin/franchise-users` e import |
| `src/contexts/AuthContext.tsx` | Remover estado `isFranqueado` e verificações |
| `src/components/ProtectedRoute.tsx` | Sem alterações (já funciona sem franqueado) |

### Arquivos a Excluir

| Arquivo | Motivo |
|---------|--------|
| `src/pages/admin/FranchiseUsers.tsx` | Página de gestão de franqueados |
| `supabase/functions/create-franchisee/` | Edge function para criar franqueado |
| `supabase/functions/reset-franchisee-password/` | Edge function para resetar senha de franqueado |

---

### Secao Tecnica

#### 1. AdminLayout.tsx - Remover menu e role

```typescript
// ANTES (linha 13)
const { signOut, user, isFranqueadora, isFranqueado, isVendedor, isMotorista, isSuperAdmin, userFranchise } = useAuth();

// DEPOIS
const { signOut, user, isFranqueadora, isVendedor, isMotorista, isSuperAdmin, userFranchise } = useAuth();

// ANTES (linhas 40-54) - Remover "franqueado" dos arrays de roles
{ value: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["franqueadora", "franqueado", "vendedor"] },

// DEPOIS
{ value: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["franqueadora", "vendedor"] },

// Remover completamente a linha do menu Franqueados:
// { value: "franchise-users", label: "Franqueados", icon: UsersRound, roles: ["franqueadora"] },

// ANTES (linhas 66-72) - Remover verificação isFranqueado
return clientMenuItems.filter((item) => {
  if (isFranqueadora) return item.roles.includes("franqueadora");
  if (isFranqueado) return item.roles.includes("franqueado");
  // ...
});

// DEPOIS - Remover linha do isFranqueado
return clientMenuItems.filter((item) => {
  if (isFranqueadora) return item.roles.includes("franqueadora");
  // ... (sem isFranqueado)
});

// ANTES (linhas 76-83) - Remover título "Franqueado"
if (isFranqueado) return "🏪 Franqueado";

// DEPOIS - Remover essa linha
```

#### 2. AuthContext.tsx - Remover isFranqueado

```typescript
// Remover do tipo AuthContextType:
// isFranqueado: boolean;

// Remover estado:
// const [isFranqueado, setIsFranqueado] = useState(false);

// Remover verificação no checkAdminStatus:
// supabase.rpc('has_role', { _user_id: userId, _role: 'franqueado' }),
// setIsFranqueado(isFranqueadoRole);

// Atualizar isAdmin para não incluir franqueado:
// setIsAdmin(... || isFranqueadoRole || ...);

// Remover do context provider value:
// isFranqueado,
```

#### 3. App.tsx - Remover rota

```typescript
// Remover import:
// import FranchiseUsers from "./pages/admin/FranchiseUsers";

// Remover rota:
// <Route path="franchise-users" element={<FranchiseUsers />} />
```

#### 4. delete-user Edge Function - Remover menções a franqueado

A edge function `delete-user/index.ts` será atualizada para remover verificações relacionadas à role "franqueado", mantendo apenas:
- super_admin
- franqueadora
- vendedor

---

### Sobre os Percentuais nas Unidades

O formulário de unidades (Franchises.tsx) tem campos `franqueado_percentage` e `franqueadora_percentage`. **Esses campos permanecem** pois são usados para calcular divisão de receita entre a matriz e as filiais (unidades), independente de existir a role de franqueado.

Se preferir, posso renomear para algo mais genérico como `unidade_percentage` e `matriz_percentage`.

---

### Dados Existentes no Banco

Usuarios com role "franqueado" que já existem no banco:
- Continuarão existindo, mas **não terão mais acesso** ao painel (pois não serão reconhecidos como admin)
- Podem ser excluídos manualmente se necessário

---

### Resultado Esperado

1. Menu "Franqueados" não aparece mais
2. Rota `/admin/franchise-users` não existe mais
3. Login com role "franqueado" não dá acesso ao painel admin
4. Sistema simplificado: apenas franqueadora, vendedor, motorista e super_admin

