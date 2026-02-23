

## Exigir confirmacao de email antes de acessar o sistema (via Resend)

### Problema atual
Com auto-confirm ativado, o usuario cria a conta e entra direto no painel sem precisar confirmar o email. Isso permite cadastros com emails falsos.

### Solucao
Desativar auto-confirm e usar uma edge function com a API admin do Supabase para **gerar o link de confirmacao** e envia-lo via Resend. Assim o email chega de forma confiavel, e o usuario so acessa o sistema apos clicar no link.

### Fluxo esperado

1. Usuario preenche cadastro e clica "Criar conta"
2. Conta e criada (nao confirmada, sem sessao)
3. Edge function gera link de confirmacao via API admin e envia por Resend
4. Usuario e redirecionado para tela "Verifique seu email"
5. Usuario clica no link no email -> `/auth/callback` processa -> atribui role -> entra no painel
6. Se nao clicar, nao consegue fazer login (email nao confirmado)

### Passos de implementacao

**1. Desativar auto-confirm de email**
- Configurar autenticacao para exigir confirmacao de email no cadastro.

**2. Criar/atualizar edge function `send-email`**
- Adicionar tipo `confirmation` que usa `supabase.auth.admin.generateLink()` para criar link de confirmacao.
- Enviar o link via Resend com template branded do PlayGestor.
- O link aponta para `/auth/callback` para processar a confirmacao.

**3. Atualizar `src/pages/UserRegister.tsx`**
- Apos signup, NÃO redirecionar para o painel.
- Chamar edge function `send-email` com `type: 'confirmation'` para enviar link via Resend.
- Deslogar o usuario (signOut) para garantir que nao tenha sessao.
- Redirecionar para `/verificar-email` com o email.

**4. Atualizar `src/pages/VerifyEmail.tsx`**
- Mostrar mensagem "Verifique seu email para confirmar sua conta".
- Adicionar botao "Reenviar email" que chama a edge function novamente.
- Timer de cooldown de 60 segundos para evitar spam.

**5. AuthCallback.tsx ja esta pronto**
- Ja processa o codigo PKCE, atribui role e redireciona para `/admin/rentals`.

### Secao tecnica

**Edge function `send-email` - novo tipo `confirmation`:**
```typescript
case 'confirmation': {
  // Gerar link de confirmacao via admin API
  const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
    type: 'signup',
    email: to,
    options: { redirectTo: 'https://playgestor.com.br/auth/callback' }
  });
  const confirmationUrl = linkData?.properties?.action_link;
  
  subject = 'Confirme seu email — PlayGestor';
  html = getConfirmationTemplate(name, confirmationUrl);
  break;
}
```

**UserRegister.tsx - fluxo atualizado:**
```typescript
if (authData.user) {
  // Enviar email de confirmacao via Resend
  await supabase.functions.invoke('send-email', {
    body: { type: 'confirmation', to: email.trim(), name: name.trim() }
  });
  
  // Garantir que usuario nao tem sessao
  await supabase.auth.signOut();
  
  // Redirecionar para verificacao
  navigate('/verificar-email', { state: { email: email.trim() } });
}
```

**VerifyEmail.tsx - com reenvio:**
```typescript
const handleResend = async () => {
  await supabase.functions.invoke('send-email', {
    body: { type: 'confirmation', to: email, name: '' }
  });
  setCooldown(60);
};
```

### Resultado
- Emails falsos nao conseguem acessar o sistema
- Emails de confirmacao chegam de forma confiavel via Resend
- Fluxo profissional com branding PlayGestor
- Botao de reenvio funcional na tela de verificacao

