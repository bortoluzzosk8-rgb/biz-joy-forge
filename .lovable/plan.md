

## Plano: Separar Franqueadoras de Clientes

O problema é que quando alguém se cadastra como franqueadora no sistema, está sendo adicionado na tabela `clients` (que é para clientes que alugam brinquedos). Isso está misturando dois tipos completamente diferentes de pessoas.

---

### O que está acontecendo

```text
Cadastro de Franqueadora (UserRegister.tsx)
    └── Cria usuário no auth.users
    └── Insere na tabela "clients" com is_client = true  ← ERRO!
    └── Atribui role "franqueadora"

Página de Clientes (Clients.tsx)
    └── Busca de "clients" WHERE is_client = true
    └── Mostra franqueadoras + clientes misturados
```

---

### Solução

1. **Remover inserção na tabela `clients`** quando franqueadora se cadastra
2. **Criar automaticamente uma franquia** para a franqueadora
3. **Vincular o usuário à franquia** via `user_franchises`
4. **A tabela `clients`** será usada apenas para clientes finais (quem aluga brinquedos)

---

### Arquivos a Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/pages/UserRegister.tsx` | Modificar | Remover inserção na tabela clients; criar franquia automaticamente |
| `supabase/functions/assign-franqueadora-role/index.ts` | Modificar | Criar franquia e vínculo user_franchises junto com o role |

---

### Novo Fluxo de Cadastro

```text
Cadastro de Franqueadora (UserRegister.tsx)
    └── Cria usuário no auth.users
    └── Chama edge function "assign-franqueadora-role"
         └── Cria registro em "franchises" (nome, email, etc)
         └── Cria vínculo em "user_franchises"
         └── Atribui role "franqueadora"
    └── Redireciona para dashboard
```

---

### Mudanças no UserRegister.tsx

Remover estas linhas:
```typescript
// REMOVER - Franqueadoras não são clientes
const { error: clientError } = await supabase
  .from('clients')
  .insert({
    name: name.trim(),
    email: email.trim(),
    phone: phone.replace(/\D/g, ''),
    user_id: authData.user.id,
    is_client: true,
  });
```

Passar mais dados para a edge function:
```typescript
// NOVO - Passar dados para criar franquia
const { error: roleError } = await supabase.functions.invoke('assign-franqueadora-role', {
  body: { 
    user_id: authData.user.id,
    name: name.trim(),
    email: email.trim(),
    phone: phone.replace(/\D/g, '')
  }
});
```

---

### Mudanças na Edge Function

A edge function `assign-franqueadora-role` passará a:

1. **Verificar se é super admin** (email específico)
2. **Criar franquia** na tabela `franchises`
3. **Vincular usuário à franquia** na tabela `user_franchises`
4. **Atribuir role** `franqueadora` (ou `super_admin` + `franqueadora`)

```typescript
// Criar franquia para o novo usuário
const { data: franchise } = await supabase
  .from('franchises')
  .insert({
    name: `Franquia de ${name}`,
    email: email,
    phone: phone,
    city: 'A definir',
    status: 'active'
  })
  .select()
  .single();

// Vincular usuário à franquia
await supabase
  .from('user_franchises')
  .insert({
    user_id: userId,
    franchise_id: franchise.id
  });

// Atribuir role
await supabase
  .from('user_roles')
  .insert({ user_id: userId, role: 'franqueadora' });
```

---

### Limpar Dados Existentes

Precisamos remover os registros incorretos da tabela `clients`:

```sql
-- Remover franqueadoras que foram inseridas incorretamente em clients
DELETE FROM clients 
WHERE user_id IN (
  SELECT user_id FROM user_roles WHERE role = 'franqueadora'
);
```

E criar as franquias para os usuários existentes.

---

### Resumo das Tabelas

| Tabela | Propósito | Quem vai parar lá |
|--------|-----------|-------------------|
| `clients` | Clientes finais que alugam brinquedos | Pessoas cadastradas manualmente pelo franqueado |
| `franchises` | Franquias do SaaS | Empresas que usam o sistema |
| `user_franchises` | Vínculo usuário ↔ franquia | Franqueadoras e franqueados |
| `user_roles` | Roles de acesso | franqueadora, franqueado, vendedor, motorista, super_admin |

---

### Resultado Final

Após implementar:
- A página "Clientes" mostrará apenas clientes finais (quem aluga brinquedos)
- Franqueadoras terão suas próprias franquias criadas automaticamente
- O Dashboard do Super Admin mostrará corretamente os novos cadastros de franqueadoras
- Os dados existentes serão limpos/migrados

