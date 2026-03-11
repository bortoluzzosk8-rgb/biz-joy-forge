

## Problema: Link de recuperação de senha redireciona para o login

### Causa raiz

O `generateLink` na edge function usa `redirectTo: ${origin}/reset-password`, mas essa URL provavelmente não está na lista de "Redirect URLs" permitidas na configuração de autenticação do projeto. Como resultado, o Supabase ignora o `redirect_to` e redireciona para a URL padrão do site (raiz ou login).

A confirmação de email funciona porque usa `redirectTo: ${origin}/auth/callback`, que já está na lista permitida.

Confirmação nos logs: o verify endpoint processa o token com sucesso (303), mas redireciona para a URL errada.

### Solução

Reutilizar a rota `/auth/callback` (que já funciona) e fazê-la detectar quando é uma recuperação de senha.

**1. Edge function `send-email` — mudar redirectTo**

No case `password_reset`, mudar de:
```
redirectTo: `${resetOrigin}/reset-password`
```
Para:
```
redirectTo: `${resetOrigin}/auth/callback`
```

**2. `AuthCallback.tsx` — detectar recovery no hash**

Antes de processar como confirmação normal, verificar se o hash da URL contém `type=recovery`. Se sim:
- Definir flag `sessionStorage.setItem('password_recovery', 'true')`
- Navegar para `/reset-password` em vez de `/admin/rentals`

```typescript
const hash = window.location.hash.substring(1);
const hashParams = new URLSearchParams(hash);
const authType = hashParams.get('type');

if (authType === 'recovery') {
  sessionStorage.setItem('password_recovery', 'true');
  navigate('/reset-password', { replace: true });
  return;
}
```

**3. `ResetPassword.tsx` — aceitar flag do sessionStorage**

Além do listener `PASSWORD_RECOVERY` e do fallback de sessão, verificar a flag:
```typescript
if (sessionStorage.getItem('password_recovery') === 'true') {
  sessionStorage.removeItem('password_recovery');
  setIsValidSession(true);
  setCheckingSession(false);
}
```

### Resultado

- Link de recovery passa pela mesma rota que já funciona (`/auth/callback`)
- Callback detecta tipo recovery e redireciona para `/reset-password`
- Página de reset reconhece a sessão e mostra o formulário de nova senha

