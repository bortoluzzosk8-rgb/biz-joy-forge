

## Plano: Excluir Aba "Relatório" Completamente

### Objetivo

Remover completamente a funcionalidade de **Relatório Financeiro** (`franchise-report`) do sistema, incluindo:
- Item do menu de navegação
- Rota no roteador
- Arquivo da página

---

### Arquivos a Modificar/Excluir

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/AdminLayout.tsx` | Remover item do menu |
| `src/App.tsx` | Remover import e rota |
| `src/pages/admin/FranchiseReport.tsx` | **EXCLUIR** arquivo |

---

### 1. Remover do Menu (AdminLayout.tsx)

**Linha 62** - Remover este item do array `clientMenuItems`:

```typescript
// REMOVER esta linha
{ value: "franchise-report", label: "Relatório", icon: FileSpreadsheet, roles: ["franqueadora"] },
```

**Linha 5** - Remover o import não utilizado `FileSpreadsheet`:

```typescript
// ANTES
import { Package, DollarSign, Calendar, Users, UserPlus, LogOut, Settings, Tag, Warehouse, BarChart3, Store, FileSpreadsheet, UserCheck, Truck, User, Building2, Clock, CreditCard, Megaphone, ShoppingBag } from "lucide-react";

// DEPOIS
import { Package, DollarSign, Calendar, Users, UserPlus, LogOut, Settings, Tag, Warehouse, BarChart3, Store, UserCheck, Truck, User, Building2, Clock, CreditCard, Megaphone, ShoppingBag } from "lucide-react";
```

---

### 2. Remover Rota (App.tsx)

**Linha 30** - Remover import:

```typescript
// REMOVER
import FranchiseReport from "./pages/admin/FranchiseReport";
```

**Linha 104** - Remover rota:

```typescript
// REMOVER
<Route path="franchise-report" element={<FranchiseReport />} />
```

---

### 3. Excluir Arquivo

Excluir completamente o arquivo:
- `src/pages/admin/FranchiseReport.tsx`

---

### Resultado Final

O menu do painel administrativo ficará sem a aba "Relatório", e qualquer tentativa de acessar `/admin/franchise-report` resultará na página 404.

