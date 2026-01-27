
## Plano: Atribuir Role Automaticamente no Login

Vou corrigir o sistema para que o role `franqueadora` seja atribuído automaticamente tanto no cadastro quanto no login.

---

### Problema Identificado

1. **Usuário sem role**: O usuário `oompabrink01@gmail.com` não tem nenhum role na tabela `user_roles`
2. **Login não atribui role**: A Edge Function `assign-franqueadora-role` só é chamada no cadastro, não no login
3. **ProtectedRoute bloqueia acesso**: Como `isAdmin = false`, o usuário é redirecionado para `/` ao tentar acessar `/admin/dashboard`

---

### Solução

Modificar o `UserLogin.tsx` para chamar a Edge Function `assign-franqueadora-role` após o login bem-sucedido, garantindo que qualquer usuário que fizer login tenha o role `franqueadora`.

---

### Alterações

**1. `src/pages/UserLogin.tsx`**

Após o login bem-sucedido (`supabase.auth.signInWithPassword`):
- Obter o `user.id` da sessão
- Chamar a Edge Function `assign-franqueadora-role` com o `user_id`
- Aguardar a resposta antes de redirecionar
- Redirecionar para `/admin/dashboard`

---

### Código a Ser Implementado

```typescript
// UserLogin.tsx - handleSubmit
const { data, error } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password,
});

if (error) {
  // ... tratamento de erro
} else {
  // Atribuir role franqueadora após login
  if (data.user) {
    await supabase.functions.invoke('assign-franqueadora-role', {
      body: { user_id: data.user.id }
    });
  }
  
  toast({ ... });
  navigate('/admin/dashboard');
}
```

---

### Fluxo Após Correção

```
Usuario faz login (/login)
         |
         v
   signInWithPassword()
         |
         v
   invoke('assign-franqueadora-role')
         |
         v
   Role inserido em user_roles
         |
         v
   navigate('/admin/dashboard')
         |
         v
   ProtectedRoute verifica roles
         |
         v
   isAdmin = true (tem franqueadora)
         |
         v
   Acessa Dashboard normalmente
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/UserLogin.tsx` | Adicionar chamada à Edge Function após login |

---

### Resultado Esperado

1. Usuário faz login na página `/login`
2. Sistema autentica o usuário
3. Edge Function atribui o role `franqueadora` automaticamente
4. Usuário é redirecionado para `/admin/dashboard`
5. `ProtectedRoute` valida que `isAdmin = true`
6. Usuário acessa o painel administrativo

---

### Benefício Adicional

Esta correção também resolve o problema de usuários antigos que foram criados antes da implementação do sistema de roles - na próxima vez que fizerem login, receberão o role automaticamente.
