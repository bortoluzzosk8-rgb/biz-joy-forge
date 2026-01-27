

## Plano: Separar Fluxos de Autenticação (Admin vs Usuário)

Vou criar uma experiência de acesso separada para administradores e usuários normais, mantendo a segurança do sistema.

---

### Situação Atual

Atualmente o sistema tem:
- Uma única tela de login (`/admin-login`) para todos
- O botão "CRIAR CONTA" na landing page leva para a mesma tela de admin
- Usuários não conseguem criar suas próprias contas
- Apenas você (admin) consegue acessar o painel administrativo

---

### Solução Proposta

Vou criar dois fluxos separados:

**Fluxo do Usuário Normal:**
```
Landing Page → Criar Conta (novo) → Login → Catálogo
```

**Fluxo do Administrador (você):**
```
Landing Page → Área Admin → Painel Administrativo
```

---

### O que será criado

1. **Nova página de Login de Usuário** (`/login`)
   - Formulário simples de email + senha
   - Link "Criar conta" para usuários novos
   - Link "Esqueci minha senha"
   - Visual moderno e amigável

2. **Nova página de Cadastro de Usuário** (`/cadastro`)
   - Nome, email, telefone, senha
   - Validação de campos
   - Criação automática na tabela `clients`
   - Após cadastro, redireciona para o catálogo

3. **Atualização do Header da Landing Page**
   - Botão "LOGIN" → vai para `/login` (usuários)
   - Botão "CRIAR CONTA" → vai para `/cadastro` (usuários)
   - Link discreto "Área Admin" para você acessar o painel

4. **Atualização do AdminLogin**
   - Remover opção de criar conta (fica só login)
   - Manter apenas para admins/franqueados/vendedores/motoristas

---

### Fluxo após implementação

| Tipo | Rota de Login | Após Login |
|------|--------------|------------|
| Usuário novo | `/cadastro` → `/login` | Catálogo |
| Usuário existente | `/login` | Catálogo |
| Admin/Franqueado | `/admin-login` | Painel Admin |

---

### Detalhes Técnicos

**Criação de usuário:**
- Usar `supabase.auth.signUp()` com auto-confirm habilitado
- Criar registro na tabela `clients` com `user_id`
- Role padrão: nenhuma (usuário comum não precisa de role)

**Proteção de rotas:**
- `/catalog`, `/product/*`, `/checkout` → requerem autenticação (`requireAuth`)
- `/admin/*` → requerem role de admin (`requireAdmin`)

**Segurança:**
- Admins só podem ser criados via edge function `setup-admin`
- Usuários normais não têm acesso ao painel administrativo
- Validação server-side com RLS policies

---

### Resumo das alterações

| Arquivo | Ação |
|---------|------|
| `src/pages/UserLogin.tsx` | Criar (novo) |
| `src/pages/UserRegister.tsx` | Criar (novo) |
| `src/components/landing/Header.tsx` | Atualizar links |
| `src/pages/AdminLogin.tsx` | Simplificar (remover criação de conta pública) |
| `src/App.tsx` | Adicionar novas rotas |
| `supabase/migrations` | Adicionar coluna `user_id` em `clients` (se necessário) |

