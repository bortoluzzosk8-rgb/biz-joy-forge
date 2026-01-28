

## Plano: Corrigir Dropdown de Unidades - Nome e Filtro

### Problema Identificado

1. **Nome incorreto**: As franquias aparecem com o prefixo "Franquia de..." (ex: "Franquia de gg - A definir") porque a edge function `assign-franqueadora-role` cria automaticamente com esse prefixo
2. **Sem isolamento multi-tenant**: O dropdown mostra TODAS as franquias do sistema, incluindo de outros clientes SaaS, ao inves de apenas as unidades do usuario logado

### Solucao Proposta

#### 1. Corrigir o Nome na Edge Function

Quando um novo usuario se cadastra, usar apenas o nome da empresa/unidade sem o prefixo "Franquia de":

```
Antes:  name: `Franquia de ${name}`
Depois: name: name  // Apenas o nome
```

#### 2. Filtrar Unidades por Cliente SaaS

Modificar todas as funcoes `fetchFranchises` para buscar apenas:
- A franquia raiz do usuario logado (onde `parent_franchise_id IS NULL`)
- As unidades filhas dessa franquia (onde `parent_franchise_id = id_da_franquia_raiz`)

Isso garante isolamento entre diferentes clientes SaaS.

---

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `supabase/functions/assign-franqueadora-role/index.ts` | Remover prefixo "Franquia de" no nome |
| `src/pages/admin/Sales.tsx` | Filtrar franquias pelo `parent_franchise_id` do usuario |
| `src/pages/admin/Logistics.tsx` | Filtrar franquias pelo `parent_franchise_id` do usuario |
| `src/pages/admin/Clients.tsx` | Filtrar franquias pelo `parent_franchise_id` do usuario |
| `src/pages/admin/Drivers.tsx` | Filtrar franquias pelo `parent_franchise_id` do usuario |
| `src/pages/admin/FranchiseReport.tsx` | Filtrar franquias pelo `parent_franchise_id` do usuario |
| `src/components/sales/ExportExcelModal.tsx` | Verificar se precisa filtro |
| `src/pages/admin/Monitors.tsx` | Verificar se precisa filtro |

---

### Secao Tecnica

#### Edge Function - assign-franqueadora-role/index.ts

Linha 126, mudar de:
```typescript
name: `Franquia de ${name}`,
```

Para:
```typescript
name: name,
```

#### Sales.tsx - fetchFranchises (Linha 714)

De:
```typescript
const fetchFranchises = async () => {
  try {
    const { data, error } = await supabase
      .from("franchises")
      .select("id, name, city")
      .eq("status", "active")
      .order("name");
    
    if (error) throw error;
    setFranchises(data || []);
  } catch (error) {
    console.error("Error fetching franchises:", error);
    toast.error("Erro ao carregar franquias");
  }
};
```

Para:
```typescript
const fetchFranchises = async () => {
  try {
    // Buscar a franquia raiz do usuario logado
    const { data: userFranchiseData } = await supabase
      .from("user_franchises")
      .select("franchise_id")
      .eq("user_id", user?.id)
      .maybeSingle();
    
    if (!userFranchiseData?.franchise_id) {
      setFranchises([]);
      return;
    }

    const rootFranchiseId = userFranchiseData.franchise_id;

    // Buscar a franquia raiz + unidades filhas
    const { data, error } = await supabase
      .from("franchises")
      .select("id, name, city")
      .eq("status", "active")
      .or(`id.eq.${rootFranchiseId},parent_franchise_id.eq.${rootFranchiseId}`)
      .order("name");
    
    if (error) throw error;
    setFranchises(data || []);
  } catch (error) {
    console.error("Error fetching franchises:", error);
    toast.error("Erro ao carregar unidades");
  }
};
```

A mesma logica sera aplicada em todos os outros arquivos que tem `fetchFranchises`.

---

### Dados Existentes no Banco

As franquias existentes com "Franquia de..." no nome permanecerao com esse nome. Se desejar, posso criar uma migracao para renomear automaticamente:

```sql
UPDATE franchises 
SET name = REPLACE(name, 'Franquia de ', '')
WHERE name LIKE 'Franquia de %';
```

**Voce quer que eu inclua essa migracao para corrigir os nomes existentes?**

---

### Resultado Esperado

1. Novos cadastros criam franquias sem o prefixo "Franquia de"
2. Dropdown "Selecionar Unidade" mostra apenas as unidades do cliente SaaS logado
3. Cada cliente SaaS ve apenas suas proprias unidades (isolamento multi-tenant)
4. Outros usuarios (de outros clientes SaaS) nao veem dados de outros clientes

