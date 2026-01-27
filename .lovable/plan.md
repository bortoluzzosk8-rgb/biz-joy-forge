
## Plano: Corrigir Fluxo de Autenticação SaaS Multi-tenant

Vou corrigir o fluxo completo para que cada cliente que criar uma conta seja automaticamente uma nova "franqueadora" e possa acessar o sistema imediatamente.

---

### Problemas Identificados

| Problema | Causa | Impacto |
|----------|-------|---------|
| Role não detectado após login/cadastro | AuthContext verifica roles antes da Edge Function terminar | Usuário redirecionado para `/` por não ter `isAdmin = true` |
| Edge Function não chamada no Header | Login no Header não invoca `assign-franqueadora-role` | Usuários que fazem login pela landing não recebem role |
| Timing incorreto | Navigate acontece antes de `checkAdminStatus` atualizar o estado | `ProtectedRoute` vê `isAdmin = false` |

---

### Solução

Implementar um sistema onde:
1. O role é atribuído **imediatamente** após login/cadastro
2. O `AuthContext` tem uma função para **forçar re-verificação** dos roles
3. O redirecionamento só acontece **após** confirmar que o role foi atribuído

---

### Arquivos a Modificar

**1. `src/contexts/AuthContext.tsx`**
- Adicionar função `refreshRoles()` que pode ser chamada externamente para forçar re-verificação
- Exportar esta função no contexto

**2. `src/pages/UserLogin.tsx`**
- Após chamar a Edge Function, aguardar a resposta
- Chamar `refreshRoles()` para atualizar o estado
- Só então fazer o navigate

**3. `src/pages/UserRegister.tsx`**
- Mesmo ajuste: aguardar Edge Function e chamar `refreshRoles()`

**4. `src/components/landing/Header.tsx`**
- Adicionar formulário de login inline (já existe)
- Após login bem-sucedido, chamar Edge Function + refreshRoles
- Atualizar botão "Acessar Sistema" para verificar corretamente

---

### Implementação Detalhada

**AuthContext.tsx - Adicionar refreshRoles:**

```typescript
type AuthContextType = {
  // ... existing
  refreshRoles: () => Promise<void>;
};

// Dentro do provider:
const refreshRoles = async () => {
  if (user) {
    await checkAdminStatus(user.id);
  }
};

// Exportar no value:
<AuthContext.Provider value={{ 
  // ... existing
  refreshRoles
}}>
```

**UserLogin.tsx - Aguardar e atualizar:**

```typescript
const { refreshRoles } = useAuth();

// No handleSubmit:
if (data.user) {
  // Chamar Edge Function e aguardar
  const { error: roleError } = await supabase.functions.invoke('assign-franqueadora-role', {
    body: { user_id: data.user.id }
  });
  
  if (!roleError) {
    // Forçar re-verificação dos roles
    await refreshRoles();
  }
}

navigate('/admin/dashboard');
```

**UserRegister.tsx - Mesmo ajuste:**

```typescript
const { refreshRoles } = useAuth();

// Após signUp e chamar Edge Function:
await refreshRoles();
navigate('/admin/dashboard');
```

---

### Fluxo Corrigido

```
Usuario cria conta / faz login
         |
         v
   signUp() / signInWithPassword()
         |
         v
   invoke('assign-franqueadora-role')
         |
         v
   Aguardar resposta OK
         |
         v
   refreshRoles() → checkAdminStatus()
         |
         v
   isAdmin = true (franqueadora detectado)
         |
         v
   navigate('/admin/dashboard')
         |
         v
   ProtectedRoute vê isAdmin = true
         |
         v
   Dashboard renderizado!
```

---

### Alternativa Mais Simples

Se preferir uma solução mais simples, podemos:

1. **Remover a verificação de role no ProtectedRoute** temporariamente
2. **Usar apenas `requireAuth`** em vez de `requireAdmin`
3. Isso permitiria que qualquer usuário logado acesse o dashboard

Mas a solução completa (com roles) é melhor para quando você tiver diferentes tipos de usuários no futuro.

---

### Resultado Esperado

1. Cliente acessa landing page
2. Clica em "Criar conta"
3. Preenche dados e clica "Criar conta"
4. Sistema:
   - Cria conta no Supabase Auth
   - Atribui role `franqueadora`
   - Atualiza estado do AuthContext
   - Redireciona para `/admin/dashboard`
5. Cliente acessa o painel como franqueadora
6. Todos os dados que criar serão isolados para sua conta

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/contexts/AuthContext.tsx` | Adicionar função `refreshRoles()` |
| `src/pages/UserLogin.tsx` | Aguardar Edge Function e chamar `refreshRoles()` |
| `src/pages/UserRegister.tsx` | Aguardar Edge Function e chamar `refreshRoles()` |
