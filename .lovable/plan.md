

## Plano: Corrigir Seguranca da Exclusao de Franqueados

### Problema Identificado

A edge function `delete-user/index.ts` permite que **franqueados** excluam usuarios, mas a verificacao de seguranca so valida se eles estao excluindo **motoristas** da mesma unidade. Isso cria uma vulnerabilidade onde:

1. Um **franqueado** poderia tentar excluir **outros franqueados** do sistema
2. A funcao nao verifica se o usuario sendo excluido e realmente um motorista vs um franqueado

### Analise do Codigo Atual

```typescript
// Linha 64-67 - Permite franqueado excluir
const isFranqueado = userRoles.includes('franqueado');

if (!isSuperAdmin && !isFranqueadora && !isFranqueado && !isVendedor) {
  // bloqueia apenas se NAO for nenhum desses
}

// Linha 85-112 - So valida motoristas
if (isFranqueado && !isFranqueadora) {
  // Verifica apenas se o usuario sendo excluido e um DRIVER
  const { data: driver } = await supabaseAdmin
    .from('drivers')
    .select('franchise_id')
    .eq('user_id', user_id)
    .single();
  // NAO verifica se o usuario e outro FRANQUEADO!
}
```

---

### Solucao Proposta

#### 1. Edge Function `delete-user/index.ts`

Adicionar verificacao para impedir que franqueados excluam outros franqueados:

```typescript
// Se o caller e franqueado, verificar o que ele esta tentando excluir
if (isFranqueado && !isFranqueadora) {
  // Verificar se o usuario sendo excluido tem role de franqueado
  const { data: targetRoles } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user_id);
  
  const targetIsFranqueado = targetRoles?.some(r => r.role === 'franqueado');
  const targetIsFranqueadora = targetRoles?.some(r => r.role === 'franqueadora');
  
  if (targetIsFranqueado || targetIsFranqueadora) {
    return new Response(
      JSON.stringify({ error: 'Franqueados nao podem excluir outros franqueados' }),
      { status: 403, ... }
    );
  }
  
  // Verificar se e um motorista da mesma unidade (logica existente)
  // ...
}
```

#### 2. Frontend `FranchiseUsers.tsx`

A pagina ja esta protegida com `isFranqueadora` no frontend (linha 42, 71-74, 346-356), entao apenas franqueadoras podem ver esta pagina. Isso e bom, mas a protecao backend e essencial.

---

### Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/functions/delete-user/index.ts` | Adicionar verificacao para impedir franqueados de excluir outros franqueados |

---

### Codigo Final da Correcao

```typescript
// Se franqueado, verificar permissoes especificas
if (isFranqueado && !isFranqueadora) {
  // NOVA VERIFICACAO: Impedir que franqueado exclua outros franqueados
  const { data: targetRoles } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', user_id);
  
  const targetUserRoles = targetRoles?.map(r => r.role) || [];
  const targetIsFranqueado = targetUserRoles.includes('franqueado');
  const targetIsFranqueadora = targetUserRoles.includes('franqueadora');
  const targetIsVendedor = targetUserRoles.includes('vendedor');
  
  if (targetIsFranqueado || targetIsFranqueadora || targetIsVendedor) {
    console.log('Franqueado tentou excluir usuario protegido');
    return new Response(
      JSON.stringify({ error: 'Voce nao tem permissao para excluir este usuario' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Franqueado so pode excluir motoristas da sua propria unidade
  const { data: userFranchise } = await supabaseAdmin
    .from('user_franchises')
    .select('franchise_id')
    .eq('user_id', caller.id)
    .single();
  
  // ... resto da logica existente
}
```

---

### Resultado Esperado

1. **Franqueadora**: Pode excluir qualquer franqueado (comportamento atual mantido)
2. **Franqueado**: So pode excluir motoristas da sua propria unidade (nao pode excluir outros franqueados)
3. **Vendedor**: Pode excluir motoristas (comportamento atual mantido)
4. **Super Admin**: Pode excluir qualquer usuario

