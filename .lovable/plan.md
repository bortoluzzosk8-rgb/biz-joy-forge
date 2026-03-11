

## Problema: Cliente não é removido após confirmar exclusão

### Causa raiz

Os clientes têm `franchise_id = NULL`. As políticas de DELETE exigem que o `franchise_id` corresponda ao tenant do usuário. Como `belongs_to_user_tenant(NULL)` retorna `false`, o Supabase bloqueia silenciosamente o DELETE (retorna 0 linhas afetadas sem erro). O código exibe "sucesso" sem verificar se algo foi de fato deletado.

### Correções

**1. Adicionar política RLS para franqueadora deletar clientes sem franchise_id**

Criar uma nova policy que permite franqueadora deletar clientes com `franchise_id IS NULL` (clientes avulsos que ainda não foram atribuídos a uma unidade):

```sql
CREATE POLICY "Franqueadora can delete clients without franchise"
ON public.clients FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'franqueadora') AND franchise_id IS NULL);
```

**2. Clients.tsx — verificar se o delete realmente removeu algo**

Alterar `handleDelete` para usar `.select()` após o delete ou verificar o count retornado, mostrando erro se nenhuma linha foi afetada:

```typescript
const { data, error } = await supabase
  .from("clients")
  .delete()
  .eq("id", id)
  .select();

if (error) throw error;
if (!data || data.length === 0) {
  toast.error("Não foi possível remover o cliente. Verifique suas permissões.");
  return;
}
toast.success("Cliente removido com sucesso");
```

### Resultado

- Franqueadora consegue deletar clientes mesmo sem `franchise_id`
- Se a exclusão falhar silenciosamente, o usuário recebe feedback correto

