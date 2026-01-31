
## Plano: Corrigir Isolamento Multi-Tenant de Produtos e Estoque

### Problema Identificado

O usuário `engbrink01@gmail.com` (franquia "teste") está vendo produtos e estoque de outro tenant (PLAY GESTOR). Isso acontece por duas razões:

1. **Políticas RLS conflitantes**: As políticas antigas ainda existem junto com as novas, e como são PERMISSIVE, basta uma permitir acesso para que o dado seja visível
2. **Produto sem franchise_id**: O produto "Pula pula de 3,05m" tem `franchise_id = NULL`, o que faz com que a função `belongs_to_user_tenant()` não consiga filtrar corretamente

---

### Dados Atuais (Evidência do Problema)

| Tabela | Item | franchise_id | Pertence a |
|--------|------|--------------|------------|
| `products` | Pula pula de 3,05m | **NULL** | Nenhuma franquia |
| `inventory_items` | Pula pula de 3,05m | e8019f6e... | PLAY GESTOR |

| Usuário | franchise_id | Franquia |
|---------|--------------|----------|
| engbrink01@gmail.com | fcef5ea9... | teste |
| playgestor26@gmail.com | e8019f6e... | PLAY GESTOR |

---

### Políticas Problemáticas a Remover

**Tabela `products`:**
```sql
-- Permite que QUALQUER pessoa veja TODOS os produtos (inclui anônimos!)
"Anyone can view products" → qual: true
```

**Tabela `inventory_items`:**
```sql
-- Permite que QUALQUER franqueadora veja TODO o estoque
"Franqueadora can manage all inventory_items" → has_role(auth.uid(), 'franqueadora'::app_role)
```

---

### Solução

#### 1. Migração SQL - Limpar Políticas Antigas

```sql
-- Remover políticas antigas que permitem acesso irrestrito
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Franqueadora can manage all inventory_items" ON inventory_items;

-- Adicionar política pública para catálogo (apenas anônimos, filtrado por franchise_id na query)
CREATE POLICY "Public can view products for catalog"
ON products FOR SELECT TO anon
USING (franchise_id IS NOT NULL);

-- Garantir que produtos sem franchise_id não sejam visíveis para autenticados
-- A política existente "Franqueadora can manage own tenant products" já usa belongs_to_user_tenant()
-- mas precisamos garantir que franchise_id NULL não passe

-- Recriar política de produtos com tratamento de NULL
DROP POLICY IF EXISTS "Franqueadora can manage own tenant products" ON products;
CREATE POLICY "Franqueadora can manage own tenant products"
ON products FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'franqueadora'::app_role) 
  AND franchise_id IS NOT NULL
  AND belongs_to_user_tenant(franchise_id)
)
WITH CHECK (
  has_role(auth.uid(), 'franqueadora'::app_role) 
  AND franchise_id IS NOT NULL
  AND belongs_to_user_tenant(franchise_id)
);
```

#### 2. Limpar Dados Órfãos

O produto com `franchise_id = NULL` precisa ser associado a uma franquia ou removido:

```sql
-- Opção A: Associar ao PLAY GESTOR (já que o item de estoque relacionado pertence a ele)
UPDATE products 
SET franchise_id = 'e8019f6e-fdbf-480b-916a-71f9cc52b2c6' 
WHERE franchise_id IS NULL;

-- Opção B: Verificar se há produtos órfãos e decidir o que fazer
SELECT id, name, franchise_id FROM products WHERE franchise_id IS NULL;
```

#### 3. Tornar `franchise_id` NOT NULL (Prevenção Futura)

```sql
-- Após limpar dados órfãos, impedir novos produtos sem franquia
ALTER TABLE products ALTER COLUMN franchise_id SET NOT NULL;
```

---

### Resultado Esperado

| Cenário | Antes | Depois |
|---------|-------|--------|
| engbrink01@gmail.com abre Produtos | Vê produto de outro tenant | Vê apenas seus produtos (vazio) |
| engbrink01@gmail.com abre Estoque | Vê estoque de outro tenant | Vê apenas seu estoque (vazio) |
| Criar novo produto sem franchise_id | Permitido (causa vazamento) | Bloqueado (NOT NULL) |
| Catálogo público | Vê todos os produtos | Vê apenas produtos com franchise_id válido |

---

### Arquivos a Modificar

Nenhum arquivo de código - apenas migração SQL no banco de dados para:
1. Remover políticas antigas que permitem acesso irrestrito
2. Recriar políticas com filtro de tenant + tratamento de NULL
3. Limpar dados órfãos (produtos sem franchise_id)
4. Adicionar constraint NOT NULL para prevenção futura
