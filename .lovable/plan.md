
## Plano: Separar Dashboard do Super Admin vs Dashboard dos Clientes

O Dashboard atual será dividido em dois: um para você gerenciar o SaaS (como na imagem que você enviou) e outro para os clientes gerenciarem suas franquias.

---

### Estrutura Nova

| Usuário | O que vê no Dashboard |
|---------|----------------------|
| Super Admin (você) | Dashboard do SaaS - Leads, Mensagens, Novos Usuários |
| Franqueadora (cliente) | Dashboard Financeiro - Receitas, Despesas, Vendas |
| Franqueado | Dashboard da Franquia |
| Vendedor | Dashboard do Vendedor |
| Motorista | Redirecionado para Logística |

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/admin/Dashboard.tsx` | Adicionar lógica para mostrar `SuperAdminDashboard` se for super admin |
| Novo: `src/pages/admin/SuperAdminDashboard.tsx` | Dashboard completo do SaaS (baseado na imagem) |
| `src/pages/admin/AdminLayout.tsx` | Ajustar menu para super admin ver opções de gestão SaaS |

---

### O Dashboard do Super Admin terá

Baseado na imagem que você enviou (PlayGestor), o dashboard terá:

**Cards de Resumo:**
- Novos Hoje - Cadastros nas últimas 24h
- Mensagens Pendentes - Aguardando envio
- Em Conversa - Leads sendo atendidos
- Última Semana - Total de novos leads

**Seção Leads por Status:**
- Novos
- Mensagem Enviada
- Em Conversa
- Ativando
- Ativos
- Inativos

**Seção Últimos Cadastros:**
- Lista dos clientes mais recentes que se cadastraram no SaaS

---

### Menu do Super Admin

O menu lateral/tabs terá:
- **Dashboard** (visão geral do SaaS)
- **Leads** (leads do SaaS - pessoas que visitaram a landing)
- **Clientes** (franqueadoras que usam o sistema)
- **Mensagens** (comunicação com leads/clientes)

Os menus atuais de "Locações", "Estoque", "Financeiro" etc. **NÃO aparecerão** para o Super Admin, pois ele não gerencia franquias diretamente.

---

### Fluxo Final

```
Super Admin (bortoluzzosk8@gmail.com):
  /admin/dashboard → SuperAdminDashboard
     - Novos cadastros hoje
     - Leads por status  
     - Últimos cadastros

  Menu:
     - Dashboard (SaaS)
     - Leads (pessoas da landing)
     - Clientes (franqueadoras)

---

Franqueadora (cliente comum):
  /admin/dashboard → FinancialDashboard
     - Receitas
     - Despesas
     - Vendas
     - Gráficos

  Menu:
     - Dashboard
     - Locações
     - Estoque
     - Logística
     - Financeiro
     - etc...
```

---

### Detalhes Técnicos

**1. Dashboard.tsx - Lógica de Renderização:**

```typescript
const Dashboard = () => {
  const { isSuperAdmin, isFranqueadora, isFranqueado, isVendedor, isMotorista } = useAuth();

  // Super Admin vê dashboard do SaaS
  if (isSuperAdmin) {
    return <SuperAdminDashboard />;
  }

  // Motorista redireciona
  if (isMotorista && !isFranqueadora && !isFranqueado && !isVendedor) {
    return <Navigate to="/admin/logistics" replace />;
  }

  // Vendedor vê seu dashboard
  if (isVendedor && !isFranqueadora && !isFranqueado) {
    return <SellerDashboard />;
  }

  // Franqueado vê dashboard da franquia
  if (isFranqueado && !isFranqueadora) {
    return <FranchiseDashboard />;
  }

  // Franqueadora (cliente) vê dashboard financeiro
  return <FinancialDashboard />;
};
```

**2. SuperAdminDashboard.tsx - Componentes:**

```typescript
// Cards de estatísticas
const statsCards = [
  { label: "Novos Hoje", value: newTodayCount, icon: Users, description: "Cadastros nas últimas 24h" },
  { label: "Mensagens Pendentes", value: pendingMessages, icon: MessageSquare, description: "Aguardando envio" },
  { label: "Em Conversa", value: inConversation, icon: TrendingUp, description: "Leads sendo atendidos" },
  { label: "Última Semana", value: lastWeekCount, icon: Clock, description: "Total de novos leads" },
];

// Leads por status
const leadStatuses = [
  { status: "Novos", color: "blue", count: X },
  { status: "Mensagem Enviada", color: "yellow", count: X },
  { status: "Em Conversa", color: "purple", count: X },
  { status: "Ativando", color: "orange", count: X },
  { status: "Ativos", color: "green", count: X },
  { status: "Inativos", color: "gray", count: X },
];
```

**3. AdminLayout.tsx - Menu Filtrado:**

```typescript
const menuItems = [
  // Menus do Super Admin (SaaS)
  { value: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["super_admin"] },
  { value: "leads", label: "Leads", icon: UserPlus, roles: ["super_admin"] },
  { value: "saas-clients", label: "Clientes", icon: Building2, roles: ["super_admin"] },
  
  // Menus das Franqueadoras/Franqueados (sem acesso pro super admin)
  { value: "dashboard", label: "Dashboard", icon: BarChart3, roles: ["franqueadora", "franqueado", "vendedor"] },
  { value: "rentals", label: "Locações", icon: Calendar, roles: ["franqueadora", "franqueado", "vendedor"] },
  // ... resto dos menus
];
```

---

### Dados que o Super Admin verá

| Métrica | De onde vem |
|---------|-------------|
| Novos Hoje | `user_roles` criados nas últimas 24h com role = franqueadora |
| Mensagens Pendentes | Campo a definir (precisamos criar tabela de mensagens ou usar outro sistema) |
| Em Conversa | Leads com status específico |
| Última Semana | `user_roles` criados nos últimos 7 dias |
| Leads por Status | Precisamos adicionar campo `status` na lógica de leads do SaaS |
| Últimos Cadastros | `user_roles` ordenados por created_at |

---

### Observações

1. **Leads do SaaS vs Leads da Franquia**: Os "leads" que você vê como super admin são diferentes dos leads das franquias. Os seus são pessoas interessadas no SaaS, os das franquias são clientes finais que querem alugar produtos.

2. **Mensagens**: Na imagem aparece "Mensagens Pendentes". Precisamos definir se isso será um sistema de mensagens interno ou integração com WhatsApp/email.

3. **Status dos Leads**: Precisamos criar um sistema de status para os leads do SaaS (Novo → Mensagem Enviada → Em Conversa → Ativando → Ativo → Inativo).

---

### Resultado

Após implementar:
- Você (super admin) verá o dashboard focado em gestão do SaaS
- Seus clientes (franqueadoras) continuarão vendo o dashboard financeiro para gerenciar suas franquias
- Cada tipo de usuário terá a experiência correta para seu papel
