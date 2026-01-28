

## Plano: Corrigir Cadastro de Unidades - Problema de user_franchises

### Diagnóstico do Problema

O usuário reporta que ao cadastrar uma unidade, aparece "Unidade criada com sucesso", mas a unidade não aparece na listagem.

Após investigação, identifiquei que:

1. O usuário `playgestor26@gmail.com` possui a role `franqueadora` no banco
2. Porém, **não existe registro na tabela `user_franchises`** vinculando este usuário a uma franquia
3. Isso causa:
   - `rootFranchiseId` fica como `null` no código
   - Unidade é criada com `parent_franchise_id: null` (como franquia raiz independente)
   - Na busca, o filtro não encontra nada porque não há vínculo

### Causa Raiz

A edge function `assign-franqueadora-role` verifica se a role já existe e, se sim, retorna sucesso sem verificar se a franquia/user_franchise foi criada. Isso acontece quando:

- O usuário confirmou email e fez login
- O `AuthContext` chamou a edge function sem o parâmetro `name`
- A function viu que a role já existe e retornou sem criar a franquia

### Solução

Modificar a edge function `assign-franqueadora-role` para:

1. **Sempre verificar** se existe `user_franchises` para o usuário
2. **Criar franquia e vínculo** mesmo se a role já existir, caso não tenha franquia

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `supabase/functions/assign-franqueadora-role/index.ts` | Corrigir lógica de criação de franquia |

---

### Alterações na Edge Function

**Lógica Atual (Problemática):**

```text
1. Verifica se role 'franqueadora' existe
2. Se existe, retorna sucesso (sem verificar franquia!)
3. Se não existe, cria franquia + user_franchise + role
```

**Lógica Corrigida:**

```text
1. Verifica se role 'franqueadora' existe
2. Verifica se user_franchises existe para o usuário
3. Se user_franchises NÃO existe, cria franquia + vínculo
4. Se role NÃO existe, cria a role
5. Retorna sucesso
```

---

### Código a Modificar

**Mover a verificação de franquia para ANTES da verificação de role existente:**

```typescript
// Verificar se usuário já tem franquia vinculada
const { data: existingFranchise } = await supabaseAdmin
  .from('user_franchises')
  .select('franchise_id')
  .eq('user_id', user_id)
  .maybeSingle()

let franchiseId = existingFranchise?.franchise_id

// Criar franquia se não existir (independente se role já existe)
if (!franchiseId) {
  // Buscar nome do user_metadata se não foi passado
  const userName = name || userData.user.user_metadata?.name || 'Franquia'
  
  const trialEndsAt = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
  
  const { data: franchise, error: franchiseError } = await supabaseAdmin
    .from('franchises')
    .insert({
      name: userName,
      email: email || userEmail,
      phone: phone || null,
      city: 'A definir',
      status: 'active',
      parent_franchise_id: null,
      trial_ends_at: trialEndsAt,
      subscription_status: 'trial'
    })
    .select()
    .single()

  if (franchiseError) {
    console.error('Error creating franchise:', franchiseError)
    return new Response(
      JSON.stringify({ error: 'Failed to create franchise' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  franchiseId = franchise.id
  console.log(`Created franchise: ${franchise.id} for user: ${user_id}`)

  // Vincular usuário à franquia
  const { error: linkError } = await supabaseAdmin
    .from('user_franchises')
    .insert({
      user_id: user_id,
      franchise_id: franchiseId,
      name: userName
    })

  if (linkError) {
    console.error('Error linking user to franchise:', linkError)
    return new Response(
      JSON.stringify({ error: 'Failed to link user to franchise' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  console.log(`Linked user ${user_id} to franchise ${franchiseId}`)
}

// DEPOIS verificar e criar role se necessário
const { data: existingRole } = await supabaseAdmin
  .from('user_roles')
  .select('id')
  .eq('user_id', user_id)
  .eq('role', 'franqueadora')
  .maybeSingle()

if (!existingRole) {
  const { error: insertError } = await supabaseAdmin
    .from('user_roles')
    .insert({
      user_id: user_id,
      role: 'franqueadora'
    })

  if (insertError) {
    console.error('Error inserting role:', insertError)
  }
}
```

---

### Comportamento Após Correção

1. Usuário se cadastra e confirma email
2. Ao fazer login, `AuthContext` chama a edge function
3. Edge function verifica se tem `user_franchises`:
   - Se não tem, cria a franquia + vínculo (usando `user_metadata.name`)
4. Verifica se tem role, cria se não tiver
5. Usuário agora pode cadastrar unidades corretamente

---

### Correção Imediata para Usuários Existentes

Após a correção do código, precisaremos também corrigir o usuário atual no banco. Isso pode ser feito com uma query SQL:

```sql
-- 1. Criar franquia para o usuário
INSERT INTO franchises (name, email, city, status, parent_franchise_id, trial_ends_at, subscription_status)
VALUES ('Play gestor', 'playgestor26@gmail.com', 'A definir', 'active', null, now() + interval '10 days', 'trial')
RETURNING id;

-- 2. Vincular usuário à franquia (substituir ID_DA_FRANQUIA_CRIADA)
INSERT INTO user_franchises (user_id, franchise_id, name)
VALUES ('e162b3e7-f791-481a-bf6b-e8a7afe1d21a', 'ID_DA_FRANQUIA_CRIADA', 'Play gestor');
```

