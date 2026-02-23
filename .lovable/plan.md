
## Corrigir email nao enviado em cadastros repetidos

### Problema
Quando um usuario tenta se cadastrar com um email que ja foi registrado mas nunca confirmou, o Supabase retorna `user_repeated_signup` com status 200 (sem erro), porem **nao reenvia o email de confirmacao**. O sistema redireciona para a pagina de verificacao normalmente, mas o email nunca chega.

### Solucao
Detectar o cenario de "signup repetido" (usuario existe mas sem sessao confirmada) e usar `supabase.auth.resend()` para reenviar o email de confirmacao automaticamente.

### Passos

1. **Atualizar `src/pages/UserRegister.tsx`** - Apos o `signUp`, verificar se o usuario retornado ja existia (identities vazio ou created_at antigo) e nesse caso chamar `supabase.auth.resend({ type: 'signup', email })` para garantir que o email de confirmacao seja reenviado.

2. **Logica de deteccao**: O Supabase retorna `authData.user` com `identities` vazio (array `[]`) quando o usuario ja existe. Usar isso como indicador para disparar o reenvio.

### Secao Tecnica

No arquivo `src/pages/UserRegister.tsx`, apos a linha 79 (apos o `signUp`), adicionar verificacao:

```typescript
// Detectar signup repetido (usuario ja existe mas nao confirmou)
if (authData.user && 
    authData.user.identities && 
    authData.user.identities.length === 0) {
  // Usuario ja existe - reenviar email de confirmacao
  await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: {
      emailRedirectTo: window.location.origin,
    }
  });
  toast({
    title: "Quase la!",
    description: "Reenviamos o link de confirmacao para seu e-mail.",
  });
  navigate('/verificar-email', { state: { email: email.trim() } });
  setLoading(false);
  return;
}
```

Isso garante que mesmo em cadastros repetidos, o usuario sempre receba o email de confirmacao.
