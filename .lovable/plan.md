

## Plano: Corrigir Isolamento Multi-Tenant no Histórico de Movimentações

### Problema Identificado

O usuário "teste" (`fcef5ea9-8818-4513-8011-bd61eddad2f8`) está vendo histórico de movimentações de outros tenants (PLAY GESTOR e Franquia de gg).

**Causa raiz:** Políticas RLS antigas que permitem acesso irrestrito a qualquer franqueadora.

---

### Políticas Problemáticas a Remover

| Tabela | Política | Problema |
|--------|----------|----------|
| `inventory_movements` | `"Franqueadora can manage all inventory_movements"` | Permite que QUALQUER franqueadora veja TODAS as movimentações |
| `equipment_movement_history` | `"Franqueadora can manage all equipment movements"` | Mesmo problema |

Ambas usam apenas `has_role(auth.uid(), 'franqueadora')` sem filtrar por tenant.

---

### Dados Atuais (Evidência)

| Movimentação | De | Para | Envolve "teste"? |
|--------------|----|----|------------------|
| 31/01/2026 12:36 | Franquia de gg | PLAY GESTOR | ❌ Não |
| 31/01/2026 11:08 | PLAY GESTOR | Franquia de gg | ❌ Não |

O usuário "teste" não deveria ver nenhuma dessas movimentações.

---

### Solução

#### Migração SQL

```sql
-- ========================================
-- 1. TABELA: inventory_movements
-- ========================================

-- Remover política antiga que permite acesso irrestrito
DROP POLICY IF EXISTS "Franqueadora can manage all inventory_movements" ON inventory_movements;

-- A política "Franqueadora can manage own tenant inventory movements" já existe
-- e usa belongs_to_user_tenant(to_franchise_id), mas precisamos ajustar
-- para filtrar também por from_franchise_id

-- Recriar política com filtro correto (deve verificar ambos os lados)
DROP POLICY IF EXISTS "Franqueadora can manage own tenant inventory movements" ON inventory_movements;
CREATE POLICY "Franqueadora can manage own tenant inventory movements"
ON inventory_movements FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'franqueadora'::app_role) 
  AND (
    belongs_to_user_tenant(to_franchise_id) 
    OR belongs_to_user_tenant(from_franchise_id)
  )
)
WITH CHECK (
  has_role(auth.uid(), 'franqueadora'::app_role) 
  AND (
    belongs_to_user_tenant(to_franchise_id) 
    OR belongs_to_user_tenant(from_franchise_id)
  )
);

-- ========================================
-- 2. TABELA: equipment_movement_history
-- ========================================

-- Remover política antiga que permite acesso irrestrito
DROP POLICY IF EXISTS "Franqueadora can manage all equipment movements" ON equipment_movement_history;

-- Recriar política com filtro correto
DROP POLICY IF EXISTS "Franqueadora can manage own tenant equipment movement history" ON equipment_movement_history;
CREATE POLICY "Franqueadora can manage own tenant equipment movement history"
ON equipment_movement_history FOR ALL TO authenticated
USING (
  has_role(auth.uid(), 'franqueadora'::app_role) 
  AND (
    belongs_to_user_tenant(to_franchise_id) 
    OR belongs_to_user_tenant(from_franchise_id)
  )
)
WITH CHECK (
  has_role(auth.uid(), 'franqueadora'::app_role) 
  AND (
    belongs_to_user_tenant(to_franchise_id) 
    OR belongs_to_user_tenant(from_franchise_id)
  )
);
```

---

### Resultado Esperado

| Cenário | Antes | Depois |
|---------|-------|--------|
| engbrink01@gmail.com (teste) abre Histórico | Vê movimentações de outros tenants | Vê lista vazia (correto) |
| playgestor26@gmail.com abre Histórico | Vê todas as movimentações | Vê apenas movimentações do seu tenant |
| Nova movimentação | Visível para todos | Visível apenas para o tenant envolvido |

---

### Arquivos a Modificar

Nenhum arquivo de código - apenas migração SQL para:
1. Remover políticas antigas que permitem acesso irrestrito
2. Garantir que as políticas filtrem por tenant usando `belongs_to_user_tenant()`

