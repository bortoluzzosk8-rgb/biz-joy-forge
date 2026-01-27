

## Plano: Acesso Direto ao Painel Após Login na Landing

Vou corrigir o fluxo para que quando o usuário já estiver logado na landing page e clicar em "Acessar Sistema", ele vá direto para o painel administrativo sem pedir credenciais novamente.

---

### Problema Atual

O fluxo atual tem um problema de redirecionamento circular:

1. Usuário faz login na landing page (via Header)
2. Clica em "Acessar Sistema" 
3. Vai para `/admin/dashboard`
4. `ProtectedRoute` com `requireAdmin` verifica se `isAdmin === true`
5. Se `isAdmin` ainda é `false` (role não verificado ou não atribuído), redireciona para `/admin-login`
6. Usuário precisa fazer login novamente

---

### Causa Raiz

1. A rota `/admin` exige `requireAdmin`, que verifica se o usuário tem role de admin/franqueadora/franqueado
2. O `ProtectedRoute` redireciona para `/admin-login` se `isAdmin` é false
3. Mesmo o usuário estando logado, se ele não tem role ainda, é redirecionado

---

### Solução

Modificar o `ProtectedRoute` para tratar usuários autenticados de forma diferente:

1. Se o usuário está logado mas ainda não tem role verificado → mostrar loading (não redirecionar)
2. Se o usuário está logado e `checkingAdmin` é true → aguardar verificação
3. Só redirecionar para login se o usuário realmente não está autenticado

---

### Alterações

**1. ProtectedRoute.tsx**

Ajustar a lógica para:
- Se `requireAdmin` e usuário está logado mas `checkingAdmin` é true → mostrar loading
- Se `requireAdmin` e usuário está logado mas não é admin → redirecionar para uma página de "acesso negado" ou landing
- Se usuário não está logado → redirecionar para `/login` (não `/admin-login`)

```
Atual:
  Se requireAdmin e !isAdmin e !checkingAdmin → vai para /admin-login

Novo:
  Se requireAdmin e !user → vai para /login
  Se requireAdmin e user e checkingAdmin → mostra loading
  Se requireAdmin e user e !isAdmin e !checkingAdmin → mostra mensagem de acesso pendente
```

**2. Header.tsx**

Verificar se o botão "Acessar Sistema" só aparece quando o usuário já está logado (já está assim).

---

### Fluxo Após Correção

```
Usuario faz login na Landing
         |
         v
   isAdmin verificado?
         |
    +----+----+
    |         |
   Sim       Não (checkingAdmin=true)
    |         |
    v         v
  Botão     Aguarda verificação
"Acessar     (loading)
 Sistema"     |
    |         |
    +---------+
         |
         v
  /admin/dashboard
   (acesso direto)
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/ProtectedRoute.tsx` | Ajustar lógica de redirecionamento para não mandar usuário logado para login |

---

### Detalhes Técnicos

**ProtectedRoute.tsx - Nova Lógica:**

```typescript
// Se exige admin
if (requireAdmin) {
  // Se não tem usuário, vai para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Se ainda está verificando roles, mostra loading
  if (checkingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Se verificou e não é admin, mostra mensagem ou redireciona para home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
}
```

---

### Resultado Esperado

1. Usuário faz login na landing page
2. Clica em "Acessar Sistema"
3. Sistema verifica roles (mostra loading se necessário)
4. Usuário acessa `/admin/dashboard` diretamente
5. **Não precisa fazer login novamente**

