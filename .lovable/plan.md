

## Corrigir entrega de emails: Usar Resend em vez do email padrao do sistema

### Problema raiz
O servico de email padrao do backend de autenticacao tem limitacoes severas de entrega (rate limit de ~4 emails/hora, remetente generico que cai em spam). Por isso os emails de confirmacao **nao chegam** — nem para usuarios novos, nem para reenvios. Os logs mostram status 200 (aceito), mas o email nunca e entregue ao destinatario.

### Solucao
Contornar o sistema de email padrao e usar o Resend (ja configurado com API key e dominio `playgestor.com.br`) para enviar os emails de confirmacao. Para isso:

1. **Ativar auto-confirmacao de email** no cadastro — assim o usuario ja recebe sessao imediatamente apos criar a conta.
2. **Enviar email de boas-vindas personalizado** via edge function `send-email` usando Resend, garantindo entrega confiavel.
3. **Simplificar o fluxo de cadastro** — sem necessidade da pagina `/verificar-email`, o usuario entra direto no painel.

### Passos de implementacao

**1. Ativar auto-confirm de email**
- Usar a ferramenta de configuracao de autenticacao para ativar auto-confirmacao de signups por email.

**2. Atualizar edge function `send-email`**
- Adicionar template de "boas-vindas" com branding PlayGestor.
- O template incluira nome do usuario, link para o painel e dicas iniciais.

**3. Atualizar `src/pages/UserRegister.tsx`**
- Remover logica de verificacao de email (nao sera mais necessaria).
- Apos signup bem-sucedido com sessao, chamar edge function `send-email` com type `welcome`.
- Atribuir role e redirecionar direto para `/admin/dashboard`.
- Manter deteccao de signup repetido: se identities vazio, redirecionar para login com mensagem clara.

**4. Atualizar `src/pages/VerifyEmail.tsx`**
- Manter a pagina como fallback mas adicionar redirecionamento automatico se usuario ja tiver sessao.
- Adicionar persistencia do email via query param.

**5. Atualizar `src/pages/UserLogin.tsx`**
- Ler email de state/query para pre-preencher campo quando redirecionado do cadastro.

### Secao Tecnica

**Template de boas-vindas no send-email:**
```typescript
case 'welcome':
  subject = 'Bem-vindo ao PlayGestor!';
  html = getWelcomeTemplate(name || 'Usuario', to);
  break;
```

**Fluxo simplificado no UserRegister.tsx:**
```typescript
// Com auto-confirm, signUp retorna sessao imediatamente
if (authData.session) {
  // Enviar email de boas-vindas via Resend
  supabase.functions.invoke('send-email', {
    body: { type: 'welcome', to: email.trim(), name: name.trim() }
  }).catch(err => console.error('Welcome email error:', err));
  
  // Atribuir role e redirecionar
  await supabase.functions.invoke('assign-franqueadora-role', { ... });
  await refreshRoles();
  navigate('/admin/dashboard');
}

// Signup repetido (identities vazio)
if (authData.user?.identities?.length === 0) {
  toast({ title: "Conta ja existe", description: "Faca login com suas credenciais." });
  navigate('/login', { state: { email: email.trim() } });
  return;
}
```

### Fluxo esperado apos implementacao

1. Usuario novo cria conta -> conta criada instantaneamente -> recebe email de boas-vindas via Resend -> entra no painel
2. Usuario com email ja cadastrado tenta criar conta -> redirecionado para login com mensagem clara
3. Sem dependencia do sistema de email padrao do backend para confirmacao

