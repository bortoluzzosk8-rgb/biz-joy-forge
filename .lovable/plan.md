
## Plano: Novo Usuário com Acesso Completo (Franqueadora)

Vou alterar o fluxo de cadastro para que novos usuários tenham acesso completo ao painel administrativo, como se fossem a franqueadora.

---

### Problema Atual

Quando um usuário cria uma conta pelo formulário `/cadastro`:
- Ele é salvo apenas na tabela `clients` (como cliente)
- Ele é redirecionado para o `/catalog` (catálogo de produtos)
- Ele **não tem nenhum role** administrativo
- Ele **não consegue acessar** o painel administrativo

---

### Solução

Criar uma **Edge Function** para gerenciar o registro de usuários com acesso administrativo completo. O fluxo será:

1. Usuário preenche o formulário de cadastro
2. Frontend cria a conta via `supabase.auth.signUp()`
3. Frontend chama a Edge Function `assign-franqueadora-role` com o `user_id`
4. Edge Function adiciona o role `franqueadora` na tabela `user_roles`
5. Usuário é redirecionado para `/admin/dashboard`

---

### O que será criado/modificado

**1. Nova Edge Function:** `supabase/functions/assign-franqueadora-role/index.ts`
- Recebe o `user_id` do usuário recém-criado
- Valida se o usuário existe
- Insere o role `franqueadora` na tabela `user_roles`
- Retorna sucesso ou erro

**2. Atualização do UserRegister:** `src/pages/UserRegister.tsx`
- Após criar a conta, chama a Edge Function para atribuir o role
- Redireciona para `/admin/dashboard` (não mais `/catalog`)
- Melhora as mensagens de feedback

**3. Atualização do UserLogin:** `src/pages/UserLogin.tsx`
- Redireciona para `/admin/dashboard` após login (não mais `/catalog`)

---

### Fluxo Após Implementação

```
                Landing Page
                     |
            +--------+--------+
            |                 |
      [CRIAR CONTA]      [Área Admin]
            |                 |
            v                 v
     /cadastro           /admin-login
            |                 |
     (Cria conta +          (Login)
      atribui role)           |
            |                 |
            +-----------------+
                     |
                     v
           /admin/dashboard
         (Painel Administrativo)
```

---

### Segurança

- A Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` para inserir roles
- Apenas usuários autenticados podem chamar a função
- O role é atribuído apenas uma vez (verificação de duplicatas)

---

### Detalhes Técnicos

**Edge Function - assign-franqueadora-role:**
```typescript
// 1. Recebe user_id do body
// 2. Valida que user_id foi enviado
// 3. Verifica se usuário já tem role franqueadora
// 4. Se não tem, insere na tabela user_roles
// 5. Retorna sucesso
```

**UserRegister.tsx - handleSubmit:**
```typescript
// 1. Cria usuário com signUp()
// 2. Chama Edge Function para atribuir role
// 3. Redireciona para /admin/dashboard
```

---

### Arquivos Afetados

| Arquivo | Ação |
|---------|------|
| `supabase/functions/assign-franqueadora-role/index.ts` | Criar (novo) |
| `src/pages/UserRegister.tsx` | Modificar redirecionamento e adicionar chamada à Edge Function |
| `src/pages/UserLogin.tsx` | Modificar redirecionamento para `/admin/dashboard` |
| `supabase/config.toml` | Adicionar configuração da nova Edge Function |

---

### Resultado Esperado

Após a implementação:
1. Usuário acessa a landing page e clica em "Criar Conta"
2. Preenche nome, email, telefone e senha
3. Clica em "Criar conta"
4. Sistema cria a conta e atribui automaticamente o role `franqueadora`
5. Usuário é redirecionado diretamente para o painel administrativo completo
6. Pode gerenciar locações, estoque, logística, financeiro, etc.
