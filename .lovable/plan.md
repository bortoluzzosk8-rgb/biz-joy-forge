

## Problema: Recuperação de senha não funciona

### Causa raiz

O fluxo atual envia **dois emails** ao recuperar senha:

1. `supabase.auth.resetPasswordForEmail()` envia o email padrão do Supabase com o link real de reset -- mas esse link redireciona para a URL do Supabase e depois para `window.location.origin/reset-password`. Se o usuario esta no preview do Lovable, o link aponta para o preview. Em producao (`playgestor.com.br`), funciona, mas o email padrão do Supabase tem aparencia generica.

2. `supabase.functions.invoke('send-email', { body: { type: 'password_reset' } })` envia um email bonito via Resend, mas **sem nenhum link de reset** -- apenas diz "voce recebera outro email". O usuario clica nesse email (que e o mais visivel) e nao consegue fazer nada.

Alem disso, o `ResetPassword.tsx` chama `getSession()` imediatamente, mas o token de recuperacao pode nao ter sido trocado por sessao ainda, causando "Link invalido".

### Correcoes

**1. Edge function `send-email` -- adicionar link real ao email de reset**

No case `password_reset`, gerar o link de recuperacao via `generateLink({ type: 'recovery' })` (igual ao confirmation) e incluir no template com botao clicavel.

```typescript
case 'password_reset': {
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
  const origin = data?.origin || 'https://playgestor.com.br';
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: to,
    options: { redirectTo: `${origin}/reset-password` }
  });
  // Usar linkData.properties.action_link no template
  subject = 'Recuperação de Senha — PlayGestor 🔐';
  html = getPasswordResetTemplate(to, linkData.properties.action_link);
  break;
}
```

**2. Template de password reset -- adicionar botao com link**

Atualizar `getPasswordResetTemplate` para receber `resetUrl` e incluir botao "Redefinir minha senha".

**3. UserLogin.tsx -- parar de enviar dois emails**

Remover a chamada `supabase.auth.resetPasswordForEmail()` e usar apenas `supabase.functions.invoke('send-email', { body: { type: 'password_reset', to: email, data: { origin: window.location.origin } } })`. Assim so um email e enviado, com o link correto.

**4. ResetPassword.tsx -- aguardar evento PASSWORD_RECOVERY**

Usar `onAuthStateChange` para detectar o evento `PASSWORD_RECOVERY` antes de validar a sessao, evitando o erro "Link invalido" por timing.

```typescript
useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'PASSWORD_RECOVERY') {
      setIsValidSession(true);
      setCheckingSession(false);
    }
  });
  
  // Fallback: checar sessao existente apos delay
  const timer = setTimeout(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) setIsValidSession(true);
    setCheckingSession(false);
  }, 2000);
  
  return () => { subscription.unsubscribe(); clearTimeout(timer); };
}, []);
```

### Resultado

- Um unico email bonito via Resend com link funcional de reset
- Link aponta para o ambiente correto (preview ou producao)
- Pagina `/reset-password` detecta corretamente o token de recuperacao

