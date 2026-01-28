

## Plano: Excluir Aba "Dashboard" Completamente

### Objetivo

Remover completamente a funcionalidade de **Dashboard** do sistema, incluindo:
- Item do menu de navegação (para franqueadora e vendedor)
- Rotas no roteador (index e /dashboard)
- Arquivo da página

---

### Arquivos a Modificar/Excluir

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/AdminLayout.tsx` | Remover item do menu e ajustar tab padrão |
| `src/App.tsx` | Remover import e rotas |
| `src/pages/admin/Dashboard.tsx` | **EXCLUIR** arquivo |

---

### 1. Remover do Menu (AdminLayout.tsx)

**Linha 41** - Remover do array `superAdminMenuItems`:

```typescript
// REMOVER esta linha
{ value: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["super_admin"] },
```

**Linha 48** - Remover do array `clientMenuItems`:

```typescript
// REMOVER esta linha
{ value: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["franqueadora", "vendedor"] },
```

**Linha 35** - Ajustar a função `getCurrentTab` para retornar outra aba padrão:

```typescript
// ANTES
const path = location.pathname.split("/admin/")[1] || "dashboard";

// DEPOIS
const path = location.pathname.split("/admin/")[1] || "rentals";
```

**Linha 5** - Remover o import `BarChart3` não utilizado (se não for usado em outro lugar).

---

### 2. Remover Rotas (App.tsx)

**Linha 20** - Remover import:

```typescript
// REMOVER
import Dashboard from "./pages/admin/Dashboard";
```

**Linhas 91-92** - Remover as rotas:

```typescript
// REMOVER ambas
<Route index element={<Dashboard />} />
<Route path="dashboard" element={<Dashboard />} />
```

**Ajustar rota index** para redirecionar para "rentals" (Locações):

```typescript
// ADICIONAR redirecionamento
<Route index element={<Navigate to="rentals" replace />} />
```

---

### 3. Excluir Arquivo

Excluir completamente o arquivo:
- `src/pages/admin/Dashboard.tsx`

---

### Comportamento Após Alteração

1. Ao acessar `/admin`, o usuário será redirecionado para `/admin/rentals` (Locações)
2. O menu não mostrará mais a aba "Dashboard"
3. Super Admin será redirecionado para `/admin/leads` ou `/admin/saas-management`
4. Qualquer tentativa de acessar `/admin/dashboard` resultará em página 404

---

### Observação

Os componentes auxiliares (`FranchiseDashboard.tsx`, `SellerDashboard.tsx`, `SuperAdminDashboard.tsx`) que eram importados pelo Dashboard.tsx permanecerão no projeto, mas não serão mais utilizados. Se desejar, podem ser excluídos posteriormente para limpeza completa.

