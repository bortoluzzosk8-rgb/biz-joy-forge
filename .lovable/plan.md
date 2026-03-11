

## Corrigir RLS: Vendedor vê equipamentos de todas as unidades

### Problema
As políticas RLS `"Vendedor can view all inventory_items"` e `"Vendedor can update equipment status for maintenance"` na tabela `inventory_items` usam apenas `has_role(auth.uid(), 'vendedor'::app_role)` sem filtrar por franquia, permitindo que o vendedor veja todos os equipamentos do sistema.

### Correção

**Migration SQL** — Substituir as duas policies por versões filtradas por tenant:

```sql
DROP POLICY IF EXISTS "Vendedor can view all inventory_items" ON public.inventory_items;
DROP POLICY IF EXISTS "Vendedor can update equipment status for maintenance" ON public.inventory_items;

CREATE POLICY "Vendedor can view tenant inventory_items"
ON public.inventory_items FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'vendedor'::app_role) AND belongs_to_user_tenant(franchise_id));

CREATE POLICY "Vendedor can update tenant equipment status"
ON public.inventory_items FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'vendedor'::app_role) AND belongs_to_user_tenant(franchise_id));
```

Sem mudanças em código — apenas nas políticas de segurança do banco.

