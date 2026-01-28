

## Plano: Corrigir Erro de RLS na Tabela Categories

### Diagnóstico

O erro ocorre porque:

| Situação | Valor |
|----------|-------|
| Política RLS requer | `admin` role |
| Usuários têm | `franqueadora`, `super_admin`, `vendedor` |
| Role `admin` existe | Sim, mas ninguém a possui |

### Solução

Atualizar as políticas RLS para permitir que `franqueadora` e `super_admin` gerenciem categorias.

---

### Alterações Necessárias

| Política | Ação |
|----------|------|
| INSERT | Permitir `franqueadora` e `super_admin` |
| UPDATE | Permitir `franqueadora` e `super_admin` |
| DELETE | Permitir `franqueadora` e `super_admin` |

---

### Detalhes Técnicos

**SQL a ser executado via migration:**

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Only admins can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON public.categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON public.categories;

-- Criar novas políticas
CREATE POLICY "Franqueadora and super_admin can insert categories"
ON public.categories FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'franqueadora'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Franqueadora and super_admin can update categories"
ON public.categories FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'franqueadora'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY "Franqueadora and super_admin can delete categories"
ON public.categories FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'franqueadora'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);
```

---

### Resultado

Após a correção:
- Usuários com role `franqueadora` poderão criar/editar/deletar categorias
- Usuários com role `super_admin` poderão criar/editar/deletar categorias
- A visualização (SELECT) permanece pública para todos

