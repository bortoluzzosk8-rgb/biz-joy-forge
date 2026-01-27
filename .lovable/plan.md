
## Plano: Controle de Super Admin para o SaaS

Vou implementar um sistema onde você (dono do SaaS) tenha acesso especial para gerenciar todos os clientes, enquanto a landing page fica limpa sem mostrar opções de admin.

---

### O Que Será Implementado

1. **Remover o botão "Área Admin" da landing page** - A landing ficará limpa, sem mostrar esse acesso
2. **Criar role `super_admin`** - Um novo role exclusivo para você
3. **Detectar automaticamente seu email** - O sistema reconhece quando você faz login
4. **Menu extra no dashboard** - Opção "Gestão SaaS" aparece apenas para você
5. **Nova página de gestão** - Para gerenciar todos os clientes/franqueadoras do sistema

---

### Arquitetura

```
Landing Page (limpa)
     |
     v
Usuario cria conta / faz login
     |
     v
Sistema verifica:
  - Email autorizado? 
    -> Sim: Atribui role super_admin + franqueadora
    -> Não: Atribui apenas role franqueadora
     |
     v
Dashboard renderiza:
  - Se super_admin: Menu "Gestão SaaS" visível
  - Se franqueadora comum: Menu normal
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/landing/Header.tsx` | Remover botão "Área Admin" |
| `supabase/config.toml` | Manter config da Edge Function |
| Nova migração SQL | Adicionar `super_admin` ao enum `app_role` |
| `src/contexts/AuthContext.tsx` | Adicionar verificação de `super_admin` |
| `supabase/functions/assign-franqueadora-role` | Verificar se é email autorizado e atribuir `super_admin` |
| `src/pages/admin/AdminLayout.tsx` | Adicionar menu "Gestão SaaS" para super_admin |
| Nova página `src/pages/admin/SaasManagement.tsx` | Página para gerenciar clientes do SaaS |
| `src/App.tsx` | Adicionar rota `/admin/saas-management` |

---

### Detalhes Técnicos

**1. Migração SQL - Adicionar novo role:**

```sql
ALTER TYPE app_role ADD VALUE 'super_admin';
```

**2. Edge Function - Verificar email autorizado:**

```typescript
const SUPER_ADMIN_EMAILS = ['seu-email@gmail.com']; // Seu email

if (SUPER_ADMIN_EMAILS.includes(email.toLowerCase())) {
  // Inserir role super_admin
  await supabase.from('user_roles').insert({
    user_id,
    role: 'super_admin'
  });
}
// Sempre inserir franqueadora também
await supabase.from('user_roles').insert({
  user_id,
  role: 'franqueadora'
});
```

**3. AuthContext - Adicionar isSuperAdmin:**

```typescript
type AuthContextType = {
  // ... existing
  isSuperAdmin: boolean;
};

const [isSuperAdmin, setIsSuperAdmin] = useState(false);

// Na verificação de roles:
const superAdminCheck = await supabase.rpc('has_role', { 
  _user_id: userId, 
  _role: 'super_admin' 
});
setIsSuperAdmin(superAdminCheck.data || false);
```

**4. AdminLayout - Menu condicional:**

```typescript
const menuItems = [
  // ... existing items
  { value: "saas-management", label: "Gestão SaaS", icon: Shield, roles: ["super_admin"] },
];

// No filtro de menus visíveis:
if (isSuperAdmin) return item.roles.includes("super_admin") || item.roles.includes("franqueadora");
```

**5. Header - Remover botão Área Admin:**

Simplesmente remover estas linhas do Header:
```tsx
<Button variant="ghost" asChild>
  <Link to="/admin-login" className="text-xs text-muted-foreground">
    Área Admin
  </Link>
</Button>
```

---

### Página de Gestão SaaS

A nova página terá:

| Funcionalidade | Descrição |
|----------------|-----------|
| Lista de clientes | Todas as franqueadoras cadastradas |
| Status da conta | Ativo, Inativo, Período de teste |
| Data de cadastro | Quando criou a conta |
| Último acesso | Data do último login |
| Ações | Ver detalhes, Ativar/Desativar |

---

### Fluxo de Acesso (Você)

```
Você acessa landing page
         |
         v
   Faz login com seu email
         |
         v
   Sistema detecta email autorizado
         |
         v
   Atribui role: super_admin + franqueadora
         |
         v
   Redireciona para /admin/dashboard
         |
         v
   Menu mostra "Gestão SaaS" (só pra você)
         |
         v
   Acessa /admin/saas-management
         |
         v
   Gerencia todos os clientes do SaaS
```

---

### Fluxo de Acesso (Clientes)

```
Cliente acessa landing page
         |
         v
   Cria conta ou faz login
         |
         v
   Atribui role: franqueadora
         |
         v
   Redireciona para /admin/dashboard
         |
         v
   Menu normal (sem "Gestão SaaS")
         |
         v
   Usa o sistema normalmente
```

---

### Segurança

- O role `super_admin` só é atribuído para emails na lista autorizada
- A verificação é feita no servidor (Edge Function), não no frontend
- RLS policies podem ser adicionadas para dar acesso total ao super_admin
- O botão "Área Admin" some da landing, mas a rota `/admin-login` ainda funciona como backup

---

### Resultado Final

1. Landing page limpa sem botão de admin
2. Você faz login normal pela landing
3. Sistema detecta seu email e dá poderes extras
4. Menu "Gestão SaaS" aparece só para você
5. Clientes usam o sistema normalmente sem ver opções de admin
6. Você pode gerenciar todos os clientes do SaaS em uma página dedicada

---

### Qual é o seu email?

Antes de implementar, preciso saber qual email você vai usar para o acesso de super admin. Esse email será configurado na Edge Function como o único autorizado a ter poderes de super admin.
