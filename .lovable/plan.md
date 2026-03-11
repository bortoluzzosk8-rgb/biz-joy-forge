

## Filtrar produtos do dropdown para mostrar apenas os que têm estoque

### Problema
O dropdown "Produto" na aba de locação mostra todos os produtos do catálogo (`products` table), mesmo os que não possuem nenhum item no estoque (`inventory_items`). O usuário quer ver apenas produtos que existem no inventário.

### Correção

**`src/pages/admin/Sales.tsx`** — Alterar `fetchProducts` para buscar apenas produtos que possuem itens correspondentes no `inventory_items`:

1. Após carregar os `products`, buscar os nomes distintos de `inventory_items` visíveis ao usuário (já filtrados por RLS).
2. Filtrar a lista de `products` para incluir apenas os que têm ao menos um item no `inventory_items` com nome correspondente (usando `ilike` match, já que o sistema usa `name` para cruzar produto ↔ item de inventário).

Alternativa mais simples e direta: substituir o `fetchProducts` para buscar diretamente os nomes distintos de `inventory_items` em vez da tabela `products`, já que o cruzamento é feito por nome. O select do dropdown passaria a listar os nomes únicos do estoque real.

**Abordagem escolhida**: Buscar os nomes distintos dos `inventory_items` e cruzar com `products` para manter o `id` e `sale_price` do produto. Produtos sem itens no inventário serão excluídos do dropdown.

```typescript
const fetchProducts = async () => {
  try {
    // Buscar nomes distintos no inventário
    const { data: inventoryNames } = await supabase
      .from("inventory_items")
      .select("name");
    
    const uniqueNames = [...new Set((inventoryNames || []).map(i => i.name))];
    
    if (uniqueNames.length === 0) {
      setProducts([]);
      return;
    }

    // Buscar produtos que existem no inventário
    const { data, error } = await supabase
      .from("products")
      .select("id, name, cost_price, sale_price")
      .in("name", uniqueNames)
      .order("name");
    
    if (error) throw error;
    setProducts(data || []);
  } catch (error) {
    console.error("Error fetching products:", error);
    toast.error("Erro ao carregar produtos");
  }
};
```

Sem mudanças no banco — apenas na query do frontend.

