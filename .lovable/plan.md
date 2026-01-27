

## Plano: Corrigir Redirecionamentos para o Painel Administrativo

Vou corrigir todos os pontos onde o sistema está redirecionando incorretamente para o catálogo em vez do painel administrativo.

---

### Problemas Encontrados

| Arquivo | Linha | Problema | Correção |
|---------|-------|----------|----------|
| `src/components/landing/Header.tsx` | 60 | "Acessar Sistema" → `/catalog` | Mudar para `/admin/dashboard` |
| `src/components/landing/Header.tsx` | 115 | "Acessar Sistema" (mobile) → `/catalog` | Mudar para `/admin/dashboard` |
| `src/pages/LoginSelection.tsx` | 64 | "Acessar Catálogo" → `/catalog` | Mudar para `/admin/dashboard` |
| `src/components/landing/Hero.tsx` | 63 | "Criar conta" → `/admin-login` | Mudar para `/cadastro` |
| `src/components/landing/Hero.tsx` | 71 | "Entrar no sistema" → `/admin-login` | Mudar para `/login` |

---

### Alterações a Serem Feitas

**1. Header.tsx** - Quando usuário logado clica em "Acessar Sistema":
- Linha 60: `navigate('/catalog')` → `navigate('/admin/dashboard')`
- Linha 115: `navigate('/catalog')` → `navigate('/admin/dashboard')`

**2. LoginSelection.tsx** - Botão principal:
- Linha 64: `navigate("/catalog")` → `navigate("/admin/dashboard")`
- Também atualizar o texto do botão de "Acessar Catálogo" para "Acessar Sistema"
- Atualizar o título da página

**3. Hero.tsx** - Botões de CTA na landing page:
- Linha 63: `navigate('/admin-login')` → `navigate('/cadastro')`
- Linha 71: `navigate('/admin-login')` → `navigate('/login')`

---

### Resultado Esperado

Após as correções:

| Ação do Usuário | Antes | Depois |
|-----------------|-------|--------|
| Clicar "Criar conta" na landing | `/admin-login` | `/cadastro` |
| Clicar "Entrar no sistema" na landing | `/admin-login` | `/login` |
| Clicar "Acessar Sistema" (logado) | `/catalog` | `/admin/dashboard` |
| Clicar "Acessar" na LoginSelection | `/catalog` | `/admin/dashboard` |

---

### Arquivos a Modificar

1. `src/components/landing/Header.tsx` - 2 alterações
2. `src/components/landing/Hero.tsx` - 2 alterações  
3. `src/pages/LoginSelection.tsx` - 1 alteração + ajuste de texto

