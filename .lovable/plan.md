

## Problema: Monitores aparecendo para contas novas

A query de monitores na linha 91-97 de `Monitors.tsx` busca **todos** os monitores sem filtro de `franchise_id`. Combinado com a política RLS "Usuarios autenticados podem ver monitores" que permite SELECT com `true`, qualquer conta autenticada vê monitores de **todos** os tenants — incluindo o monitor "Gui - 11111111111" que pertence a outra franquia.

O mesmo ocorre no dropdown de monitor em `Sales.tsx`, onde monitores são carregados sem filtro de tenant.

### Correções

**1. `src/pages/admin/Monitors.tsx` — Filtrar monitors por tenant**

Na função `fetchData`, após obter o `rootFranchiseId` do usuário, buscar os IDs das franquias do tenant e filtrar os monitores:

```typescript
// Buscar monitors filtrados pelas franquias do tenant
const franchiseIds = franchisesData?.map(f => f.id) || [];
const { data: monitorsData } = await supabase
  .from("monitors")
  .select("*, franchises(name, city)")
  .in("franchise_id", franchiseIds)
  .order("name");
```

Reorganizar o fluxo para buscar franquias primeiro, depois usar os IDs para filtrar monitores.

**2. `src/pages/admin/Sales.tsx` — Filtrar dropdown de monitores por tenant**

Localizar onde os monitores são carregados para o select de "Monitor (Opcional)" e aplicar o mesmo filtro por `franchise_id` do tenant.

**3. RLS — Remover política genérica (opcional mas recomendado)**

Remover a política "Usuarios autenticados podem ver monitores" que permite SELECT com `true` para todos, pois as outras políticas já cobrem os acessos necessários por role.

