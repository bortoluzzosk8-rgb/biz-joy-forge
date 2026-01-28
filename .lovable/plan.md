

## Plano: Implementar Verificação de E-mail em Duas Etapas

### Objetivo

Garantir que novos clientes confirmem seu e-mail antes de acessar o sistema, verificando que o e-mail é real e pertence à pessoa.

---

### Situação Atual

1. **Auto-confirm habilitado**: Quando o usuário se cadastra, ele já entra direto no sistema
2. **Sem verificação**: Qualquer e-mail pode ser usado, mesmo inválidos ou de terceiros
3. **Role atribuída imediatamente**: A edge function `assign-franqueadora-role` cria a franquia e atribui a role logo após o signUp

---

### Solução Proposta

Implementar verificação de e-mail em duas etapas:

1. **Usuário preenche o cadastro** → Sistema cria conta (não verificada)
2. **Sistema envia e-mail de confirmação** → Usuário clica no link
3. **Usuário é redirecionado para o sistema** → Só então a role é atribuída

```
+-------------+     +--------------+     +---------------+     +------------+
| Cadastro    | --> | Tela de      | --> | Clica no link | --> | Dashboard  |
| (preenche)  |     | "Verifique   |     | do email      |     | (acesso    |
|             |     | seu email"   |     |               |     | liberado)  |
+-------------+     +--------------+     +---------------+     +------------+
```

---

### Alterações Necessárias

#### 1. Desabilitar auto-confirm no backend

Usar a ferramenta de configuração de autenticação para desabilitar o auto-confirm de e-mail.

#### 2. Criar página de "Verifique seu e-mail"

**Novo arquivo:** `src/pages/VerifyEmail.tsx`

Esta página será exibida após o cadastro, informando ao usuário que ele precisa verificar seu e-mail:

```
+----------------------------------------------------------+
|                    [Logo PlayGestor]                     |
|                                                          |
|              📧 Verifique seu E-mail                     |
|                                                          |
|  Enviamos um link de confirmação para:                   |
|  usuario@email.com                                       |
|                                                          |
|  Por favor, acesse seu e-mail e clique no link           |
|  para ativar sua conta.                                  |
|                                                          |
|  [Reenviar e-mail]  [Usar outro e-mail]                  |
|                                                          |
|  Não recebeu? Verifique sua caixa de spam.               |
+----------------------------------------------------------+
```

#### 3. Modificar o fluxo de cadastro

**Arquivo:** `src/pages/UserRegister.tsx`

**Alterações:**
- Após o `signUp`, verificar se o e-mail precisa de confirmação
- Redirecionar para `/verificar-email` em vez de `/admin/dashboard`
- Passar o e-mail como state para a página de verificação

```typescript
// Após signUp bem-sucedido
if (authData.user && !authData.session) {
  // Email precisa de confirmação
  navigate('/verificar-email', { state: { email: email.trim() } });
} else if (authData.user && authData.session) {
  // Já confirmado (fallback)
  // Atribuir role e redirecionar
}
```

#### 4. Ajustar a edge function

**Arquivo:** `supabase/functions/assign-franqueadora-role/index.ts`

A edge function já funciona corretamente. Será chamada:
- Quando o usuário confirma o e-mail e faz login pela primeira vez
- A lógica de verificar "role já existe" garante idempotência

#### 5. Adicionar rota no App

**Arquivo:** `src/App.tsx`

```typescript
<Route path="/verificar-email" element={<VerifyEmail />} />
```

#### 6. Modificar o AuthContext (opcional)

Adicionar tratamento para estado "email não confirmado":

```typescript
if (session?.user && !session.user.email_confirmed_at) {
  // Usuário logado mas email não confirmado
  // Pode exibir banner ou redirecionar
}
```

---

### Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| **Backend** | Desabilitar auto-confirm via ferramenta |
| `src/pages/VerifyEmail.tsx` | **CRIAR** - Página de verificação de e-mail |
| `src/pages/UserRegister.tsx` | Modificar para redirecionar após cadastro |
| `src/App.tsx` | Adicionar rota `/verificar-email` |

---

### Fluxo Detalhado do Usuário

**Cadastro:**
1. Usuário acessa `/cadastro`
2. Preenche nome, e-mail, telefone, senha
3. Clica em "Criar conta"
4. Sistema cria usuário no Supabase (não confirmado)
5. Sistema redireciona para `/verificar-email`
6. Usuário vê mensagem "Verifique seu e-mail"

**Verificação:**
1. Usuário abre seu e-mail
2. Clica no link de confirmação
3. Link redireciona para `seusite.com/?token=...` ou similar
4. Supabase confirma o e-mail e cria sessão
5. `AuthContext` detecta a sessão
6. Edge function `assign-franqueadora-role` é chamada
7. Usuário é redirecionado para `/admin/dashboard`

**Reenvio de e-mail:**
1. Na página `/verificar-email`, usuário clica em "Reenviar"
2. Sistema chama `supabase.auth.resend({ type: 'signup', email })`
3. Novo e-mail é enviado

---

### Benefícios da Verificação

| Sem Verificação | Com Verificação |
|-----------------|-----------------|
| Qualquer e-mail é aceito | Só e-mails reais funcionam |
| Podem cadastrar e-mail de terceiros | Confirma propriedade do e-mail |
| Difícil recuperar senha se e-mail errado | E-mail sempre válido para recuperação |
| Spam de cadastros falsos | Reduz cadastros fraudulentos |

---

### Considerações Importantes

1. **E-mails existentes**: Usuários já cadastrados não serão afetados
2. **Link expira**: O link de confirmação expira após um tempo (configurável)
3. **Experiência**: Usuário só precisa confirmar uma vez
4. **Recuperação**: Se o usuário não confirmar, pode reenviar ou usar outro e-mail

