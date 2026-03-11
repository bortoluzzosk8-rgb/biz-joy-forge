

## Problema: Vendedor criado sem vínculo de franquia

O vendedor "vagner" foi criado com sucesso no banco (tabela `sellers` e `user_roles`), mas **não aparece na listagem** porque:

1. **Falta `user_franchises`**: A edge function `create-seller` NÃO insere um registro em `user_franchises` para o novo vendedor. Sem esse vínculo, a política RLS "Franqueadora can manage own tenant sellers" bloqueia a visualização, já que usa `belongs_to_user_tenant` que depende de `user_franchises`.

2. **Sem policy para super_admin**: A tabela `sellers` não tem política RLS para `super_admin`, então mesmo logado como super admin, o vendedor não aparece.

### Correções

**1. Edge Function `create-seller`** — Adicionar inserção em `user_franchises` vinculando o vendedor à mesma franquia do usuário que o criou:

```typescript
// Após criar o seller record, buscar a franquia do usuário criador
const { data: creatorFranchise } = await supabaseAdmin
  .from('user_franchises')
  .select('franchise_id')
  .eq('user_id', currentUser.id)
  .limit(1)
  .single();

if (creatorFranchise) {
  await supabaseAdmin.from('user_franchises').insert({
    user_id: newUser.user.id,
    franchise_id: creatorFranchise.franchise_id,
    name: name,
  });
}
```

**2. Migration SQL** — Adicionar policy para super_admin na tabela `sellers` e corrigir o vendedor existente:

```sql
CREATE POLICY "Super admin can manage all sellers"
ON public.sellers FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
```

**3. Corrigir vendedor existente** — Inserir o registro faltante em `user_franchises` para o vendedor vagner já criado, vinculando à franquia correta.

