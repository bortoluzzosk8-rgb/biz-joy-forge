
## Plano: Corrigir Atribuição de Role Após Confirmação de Email

### Problema Identificado

Quando um novo usuário confirma seu email clicando no link de confirmação:
1. O Supabase confirma o email e cria uma sessão automaticamente (login implícito)
2. O usuário é redirecionado para o sistema
3. **A edge function `assign-franqueadora-role` NÃO é chamada**
4. O usuário acessa o painel sem nenhuma role atribuída, causando comportamento inesperado na interface

Isso explica por que o usuário `playgestor26@gmail.com` viu o painel de Super Admin - provavelmente houve um estado inconsistente durante o carregamento.

---

### Solução

Modificar o `AuthContext` para detectar quando um usuário tem sessão mas não tem roles atribuídos, e automaticamente chamar a edge function para atribuir a role de franqueadora.

---

### Alterações no Código

**Arquivo:** `src/contexts/AuthContext.tsx`

#### 1. Adicionar lógica para atribuir role automaticamente

Após verificar os roles no `checkAdminStatus`, se o usuário não tem nenhum role, chamar a edge function:

```typescript
const checkAdminStatus = async (userId: string, userEmail?: string) => {
  setCheckingAdmin(true);
  try {
    // Verificar roles existentes
    const [franqueadoraCheck, adminCheck, vendedorCheck, motoristaCheck, superAdminCheck] = await Promise.all([...]);
    
    const hasSomeRole = isFranqueadoraRole || isAdminRole || isVendedorRole || isMotoristaRole || isSuperAdminRole;
    
    // Se não tem nenhum role, é um usuário recém-criado que precisa da role
    if (!hasSomeRole && userEmail) {
      // Chamar edge function para atribuir role
      await supabase.functions.invoke('assign-franqueadora-role', {
        body: { user_id: userId }
      });
      
      // Aguardar e verificar novamente
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Re-verificar após atribuição
      const { data: hasNewRole } = await supabase.rpc('has_role', { 
        _user_id: userId, 
        _role: 'franqueadora' 
      });
      
      if (hasNewRole) {
        setIsFranqueadora(true);
        setIsAdmin(true);
      }
    }
    
    // ... resto da lógica
  } catch (err) { ... }
};
```

#### 2. Passar email para checkAdminStatus

No `onAuthStateChange` e `getSession`, passar o email do usuário:

```typescript
if (session?.user) {
  setTimeout(() => {
    checkAdminStatus(session.user.id, session.user.email);
  }, 0);
}
```

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/contexts/AuthContext.tsx` | Adicionar auto-atribuição de role para usuários sem role |

---

### Fluxo Corrigido

**Cadastro com verificação de email:**
1. Usuário preenche cadastro
2. Sistema cria conta e envia email de confirmação
3. Usuário redireciona para `/verificar-email`
4. Usuário clica no link no email
5. Supabase confirma email e cria sessão
6. Usuário é redirecionado para o site
7. **NOVO**: `AuthContext` detecta que usuário não tem role
8. **NOVO**: Edge function é chamada automaticamente
9. Role `franqueadora` e franquia são criados
10. Usuário vê o painel correto de franqueadora

---

### Validações de Segurança

A edge function `assign-franqueadora-role` já possui validações:
- Só cria franquia se o usuário não tiver uma
- Só atribui role se o usuário não tiver a role
- Só atribui `super_admin` se o email estiver na lista autorizada (`bortoluzzosk8@gmail.com`)
- Usuários normais NUNCA receberão `super_admin`

---

### Benefícios

1. **Sem gaps**: Role é atribuída imediatamente após confirmação de email
2. **Idempotente**: Se a role já existe, nada acontece
3. **Seguro**: Super Admin continua protegido por email autorizado
4. **Experiência fluida**: Usuário não precisa fazer login manual após confirmar email

---

### Seção Técnica

A edge function `assign-franqueadora-role` verifica o email do usuário via `auth.admin.getUserById()` e compara com a lista `SUPER_ADMIN_EMAILS` para determinar se deve atribuir a role `super_admin`. Apenas o email `bortoluzzosk8@gmail.com` está autorizado para receber essa role.

Para outros usuários, apenas a role `franqueadora` é atribuída, garantindo que novos cadastros sempre acessem o painel de franqueadora (não o de Super Admin).
