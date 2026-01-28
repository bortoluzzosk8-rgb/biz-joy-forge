

## Plano: Corrigir Fluxo de Redirecionamento Após Cadastro

### Problema Identificado

Existe uma **condição de corrida (race condition)** no fluxo de cadastro:

1. Usuario cria conta em `/cadastro`
2. Edge function `assign-franqueadora-role` atribui a role corretamente
3. `refreshRoles()` e chamado, mas o estado React ainda nao propagou completamente
4. `navigate('/admin/dashboard')` executa imediatamente
5. `ProtectedRoute` verifica `isAdmin` que ainda esta `false` (estado desatualizado)
6. Usuario e redirecionado para `/` (landing page)

Os logs de rede confirmam que as roles estao sendo atribuidas corretamente (`has_role` para `franqueadora` retorna `true`), mas o componente React nao recebe o estado atualizado a tempo.

---

### Solucao Proposta

#### 1. Modificar `refreshRoles()` para Retornar Status

O `refreshRoles()` no `AuthContext.tsx` precisa retornar o resultado da verificacao, permitindo que o `UserRegister` saiba quando as roles foram atualizadas com sucesso:

```typescript
const refreshRoles = async (): Promise<boolean> => {
  if (user) {
    await checkAdminStatus(user.id);
    return true;
  }
  return false;
};
```

#### 2. Aguardar Estado Atualizado no UserRegister

Antes de navegar, garantir que o estado foi propagado:

```typescript
// Aguardar um pequeno delay para garantir que o estado propagou
await new Promise(resolve => setTimeout(resolve, 100));
```

#### 3. Alternativa Mais Robusta: Verificar Role Diretamente

Em vez de depender do estado React, verificar a role diretamente antes de navegar:

```typescript
// Verificar role diretamente no banco
const { data: hasRole } = await supabase.rpc('has_role', { 
  _user_id: authData.user.id, 
  _role: 'franqueadora' 
});

if (hasRole) {
  await refreshRoles();
  navigate('/admin/dashboard');
} else {
  // Tentar novamente apos 500ms
  setTimeout(async () => {
    await refreshRoles();
    navigate('/admin/dashboard');
  }, 500);
}
```

---

### Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/UserRegister.tsx` | Adicionar verificacao de role antes de navegar |
| `src/contexts/AuthContext.tsx` | Melhorar `refreshRoles()` para ser mais confiavel |

---

### Secao Tecnica

#### UserRegister.tsx - Modificacao Principal

```typescript
if (authData.user) {
  // Assign franqueadora role and create franchise via edge function
  const { error: roleError } = await supabase.functions.invoke('assign-franqueadora-role', {
    body: { 
      user_id: authData.user.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.replace(/\D/g, '')
    }
  });

  if (roleError) {
    console.error('Error assigning role:', roleError);
  }

  // Aguardar a role ser atribuida antes de verificar
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Verificar se a role foi atribuida com sucesso
  const { data: hasRole } = await supabase.rpc('has_role', { 
    _user_id: authData.user.id, 
    _role: 'franqueadora' 
  });

  // Atualizar o contexto de auth
  await refreshRoles();

  if (hasRole) {
    toast({
      title: "Conta criada com sucesso!",
      description: "Bem-vindo ao painel administrativo.",
    });
    navigate('/admin/dashboard');
  } else {
    // Fallback - role pode demorar mais
    toast({
      title: "Conta criada!",
      description: "Aguarde enquanto configuramos seu acesso...",
    });
    // Tentar novamente apos 1 segundo
    setTimeout(async () => {
      await refreshRoles();
      navigate('/admin/dashboard');
    }, 1000);
  }
}
```

---

### Resultado Esperado

1. Usuario cria conta
2. Sistema aguarda a edge function terminar
3. Sistema verifica se a role foi atribuida corretamente
4. Somente apos confirmacao, redireciona para o painel admin
5. Sem mais redirecionamentos para a landing page

