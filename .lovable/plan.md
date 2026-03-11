

## Problema: Link de recuperação redireciona para o Lovable em vez do app

O email de recuperação gera um link com `redirect_to` baseado em `window.location.origin` (que no preview é `https://...lovableproject.com`). Esse domínio pode não estar na lista de URLs permitidas do backend de autenticação, fazendo o redirecionamento falhar e cair na página do Lovable.

A página `/reset-password` já existe e funciona corretamente — o problema está apenas no redirecionamento do link do email.

### Correção

**Edge Function `send-email`** — Usar a URL publicada do app como fallback confiável para o `redirect_to`, garantindo que o redirecionamento funcione tanto no preview quanto em produção:

```typescript
// Linha ~198: trocar a origin dinâmica por URL fixa do app publicado
const resetOrigin = data?.origin || 'https://biz-joy-forge.lovable.app';
```

**Frontend `UserLogin.tsx`** — Garantir que o `origin` enviado seja a URL publicada quando estiver no ambiente Lovable:

```typescript
const origin = window.location.origin.includes('lovable')
  ? 'https://biz-joy-forge.lovable.app'
  : window.location.origin;
```

Isso garante que o link do email sempre redirecione para `biz-joy-forge.lovable.app/auth/callback`, que processa o token de recovery e encaminha para `/reset-password` onde o usuário define a nova senha.

Nenhuma mudança na página de reset — ela já está funcional.

