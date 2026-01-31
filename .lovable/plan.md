

## Plano: Corrigir Isolamento Multi-Tenant (Crítico)

### Problema Identificado

O usuário `engebrink@gmail.com` está vendo dados de outro tenant (`Play Gestor`). Isso acontece porque as políticas RLS verificam apenas se o usuário tem a role `franqueadora`, mas **não verificam se os dados pertencem à franqueadora do usuário**.

**Exemplo da política atual (problemática):**
```sql
-- Permite que QUALQUER franqueadora veja TODOS os dados
has_role(auth.uid(), 'franqueadora'::app_role)
```

**30 tabelas** estão afetadas por esse problema.

---

### Solução

#### 1. Criar Função Helper para Isolamento por Tenant

```sql
CREATE OR REPLACE FUNCTION public.belongs_to_user_tenant(record_franchise_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_franchises uf
    JOIN public.franchises f ON f.id = uf.franchise_id
    WHERE uf.user_id = auth.uid()
    AND (
      -- A franquia raiz do usuário é a mesma do registro
      record_franchise_id = uf.franchise_id
      OR
      -- O registro pertence a uma unidade filha da franquia do usuário
      record_franchise_id IN (
        SELECT id FROM public.franchises 
        WHERE parent_franchise_id = uf.franchise_id
      )
      OR
      -- A franquia do usuário é filha da mesma raiz do registro
      uf.franchise_id IN (
        SELECT id FROM public.franchises 
        WHERE parent_franchise_id = (
          SELECT COALESCE(parent_franchise_id, id) 
          FROM public.franchises 
          WHERE id = record_franchise_id
        )
      )
    )
  )
$$;
```

#### 2. Atualizar Políticas RLS das Tabelas Principais

**Antes (qualquer franqueadora vê tudo):**
```sql
has_role(auth.uid(), 'franqueadora'::app_role)
```

**Depois (franqueadora vê apenas seus dados):**
```sql
has_role(auth.uid(), 'franqueadora'::app_role) 
AND belongs_to_user_tenant(franchise_id)
```

---

### Tabelas a Corrigir (Prioridade Alta)

Estas tabelas contêm dados sensíveis de negócio:

| Tabela | Impacto |
|--------|---------|
| `sales` | Vendas/Locações - **vazando atualmente** |
| `sale_items` | Itens das vendas |
| `products` | Catálogo de produtos |
| `inventory_items` | Estoque |
| `clients` | Clientes |
| `expenses` | Despesas financeiras |
| `drivers` | Motoristas |
| `franchises` | Franquias/Unidades |

---

### Tabelas a Corrigir (Prioridade Média)

| Tabela | Impacto |
|--------|---------|
| `credit_cards` | Cartões de crédito |
| `loans` | Empréstimos |
| `loan_installments` | Parcelas |
| `asset_categories` | Categorias de ativos |
| `assets` | Ativos |
| `expense_categories` | Categorias de despesa |
| `inventory_archive` | Equipamentos arquivados |
| `inventory_movements` | Histórico de movimentações |
| `monitors` | Monitores |
| `sellers` | Vendedores |
| `logistics_vehicles` | Veículos |
| `logistics_assignments` | Atribuições de logística |
| `purchases` | Compras |
| `product_codes` | Códigos de produto |
| `sale_payments` | Pagamentos |
| `settings` | Configurações |
| `equipment_archive` | Arquivo de equipamentos |
| `equipment_movement_history` | Histórico de movimentos |
| `equipment_status` | Status de equipamentos |
| `vehicle_driver_assignments` | Atribuições de motoristas |
| `user_franchises` | Vínculos usuário-franquia |

---

### Detalhes da Implementação

#### Migração SQL Completa

1. **Criar função helper** `belongs_to_user_tenant()`
2. **Dropar políticas antigas** com `DROP POLICY IF EXISTS`
3. **Criar novas políticas** com filtro por tenant

#### Exemplo para tabela `sales`:

```sql
-- Remover política antiga
DROP POLICY IF EXISTS "Franqueadora can manage all sales" ON public.sales;

-- Criar nova política com isolamento
CREATE POLICY "Franqueadora can manage own tenant sales"
ON public.sales
FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'franqueadora'::app_role) 
  AND belongs_to_user_tenant(franchise_id)
)
WITH CHECK (
  has_role(auth.uid(), 'franqueadora'::app_role) 
  AND belongs_to_user_tenant(franchise_id)
);
```

---

### Resultado Esperado

| Antes | Depois |
|-------|--------|
| engebrink vê dados de Play Gestor | engebrink vê apenas seus dados |
| Qualquer franqueadora vê tudo | Cada franqueadora isolada |
| Dados vazando entre tenants | Isolamento completo |

---

### Impacto

- **30 políticas** serão atualizadas
- **Sem mudança no frontend** - tudo funciona igual
- **Segurança corrigida** - cada tenant isolado
- **Performance** - função usa SECURITY DEFINER para evitar recursão

---

### Arquivos a Modificar

Nenhum arquivo de código - apenas migração SQL no banco de dados.

