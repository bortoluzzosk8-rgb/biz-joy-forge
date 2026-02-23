

## Corrigir erro 404 no callback de confirmacao de email

### Problema
Quando o usuario clica no link de confirmacao (ou quando o link expira), a URL redireciona para `playgestor.com.br/auth/callback#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`. O componente AuthCallback nao le os parametros de erro do hash, e o resultado e uma pagina 404.

### Solucao
Atualizar o `AuthCallback.tsx` para:
1. Ler os parametros de erro do hash da URL (`window.location.hash`)
2. Se houver `error` ou `error_code` no hash, redirecionar para `/login` com uma mensagem amigavel
3. Se o link expirou (`otp_expired`), mostrar toast informando que o link expirou e orientar o usuario a fazer login ou solicitar novo link

### Arquivo a alterar

**`src/pages/AuthCallback.tsx`**
- No inicio do `handleCallback`, antes de chamar `getSession`, verificar `window.location.hash` para parametros de erro
- Se detectar `error=access_denied` ou `error_code=otp_expired`, redirecionar imediatamente para `/login` com mensagem via toast ou state
- Se nao houver erro no hash, manter o fluxo atual (getSession, assign role, redirect)

### Logica proposta

```
1. Ler window.location.hash
2. Extrair parametros (error, error_code, error_description)
3. Se error existir:
   - Se error_code === 'otp_expired': 
     -> Redirecionar para /login com toast "Link expirado. Faca login ou solicite novo link."
   - Outros erros:
     -> Redirecionar para /login com toast generico
4. Se nao houver erro:
   -> Fluxo atual (getSession, assign role, redirect para /admin/rentals)
```

### Resultado esperado
- Link valido: usuario e confirmado e redirecionado para o painel
- Link expirado/invalido: usuario e redirecionado para login com mensagem clara, sem 404

