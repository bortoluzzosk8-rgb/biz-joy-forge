

## Plano: Sistema de Trial de 10 Dias e Controle de Assinaturas

### Contexto

O sistema precisa:
1. Todo novo cadastro recebe **10 dias de acesso grátis** (trial)
2. Mostrar no painel **quantos dias restam** do trial
3. Após o trial, o usuário precisa **escolher e pagar um plano**
4. Se não pagar, **bloquear acesso** de todos os usuários vinculados (franqueadora + vendedores + motoristas)

---

### Arquitetura da Solução

```text
+-------------------+
|    franchises     |
+-------------------+
| trial_ends_at     | <- Data fim do trial (created_at + 10 dias)
| subscription_status | <- 'trial' | 'active' | 'expired' | 'cancelled'
| subscription_plan | <- 'basic' | 'pro' | 'multi'
| subscription_expires_at | <- Data fim da assinatura paga
+-------------------+
         |
         v
+-------------------+     +-------------------+
|  user_franchises  |---->|      sellers      |
+-------------------+     +-------------------+
| user_id           |     | user_id           |
| franchise_id      |---->| (vinculado)       |
+-------------------+     +-------------------+
                                   |
                          +-------------------+
                          |      drivers      |
                          +-------------------+
                          | user_id           |
                          | franchise_id      |
                          +-------------------+
```

---

### Fluxo de Acesso

1. **Novo cadastro**: Franchise criada com `trial_ends_at = NOW() + 10 dias`
2. **Login**: Sistema verifica status da assinatura
3. **Trial ativo**: Acesso normal + banner com dias restantes
4. **Trial expirado sem plano**: Redireciona para página de escolha de plano
5. **Plano pago**: Acesso normal (sem banner de trial)

---

### Alteracoes Necessarias

#### 1. Banco de Dados (Migracao)

Adicionar colunas na tabela `franchises`:

```sql
ALTER TABLE franchises 
ADD COLUMN trial_ends_at timestamptz DEFAULT (NOW() + INTERVAL '10 days'),
ADD COLUMN subscription_status text DEFAULT 'trial',
ADD COLUMN subscription_plan text DEFAULT NULL,
ADD COLUMN subscription_expires_at timestamptz DEFAULT NULL;
```

#### 2. Edge Function (assign-franqueadora-role)

Ao criar a franquia, definir `trial_ends_at`:

```typescript
const { data: franchise } = await supabaseAdmin
  .from('franchises')
  .insert({
    name: name,
    // ... outros campos
    trial_ends_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    subscription_status: 'trial'
  })
```

#### 3. AuthContext - Verificar Status da Assinatura

Adicionar verificacao de assinatura no contexto de autenticacao:

```typescript
type SubscriptionStatus = {
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trialDaysLeft: number | null;
  plan: string | null;
  expiresAt: Date | null;
};

// No AuthContext
const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);

// Buscar status da franquia
const checkSubscriptionStatus = async (franchiseId: string) => {
  const { data } = await supabase
    .from('franchises')
    .select('trial_ends_at, subscription_status, subscription_plan, subscription_expires_at')
    .eq('id', franchiseId)
    .single();
  
  // Calcular dias restantes e status
};
```

#### 4. ProtectedRoute - Bloquear Acesso se Expirado

Modificar o componente para verificar assinatura:

```typescript
// Se assinatura expirada, redirecionar para pagina de planos
if (subscriptionStatus?.status === 'expired') {
  return <Navigate to="/escolher-plano" replace />;
}
```

#### 5. AdminLayout - Mostrar Banner de Trial

Adicionar banner no topo do painel:

```typescript
{subscriptionStatus?.status === 'trial' && subscriptionStatus.trialDaysLeft !== null && (
  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4">
    <p className="text-amber-600 dark:text-amber-400 text-sm">
      ⏰ Voce tem <strong>{subscriptionStatus.trialDaysLeft} dias</strong> restantes do periodo de teste.
      <Button variant="link" onClick={() => navigate('/escolher-plano')}>
        Escolher um plano
      </Button>
    </p>
  </div>
)}
```

#### 6. Criar Pagina de Escolha de Plano

Nova pagina `/escolher-plano`:
- Mostrar os 3 planos disponiveis
- Botao para contratar cada plano
- Integracao futura com gateway de pagamento (Stripe)

---

### Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/migrations/xxx_add_subscription_fields.sql` | Adicionar colunas de assinatura |
| `supabase/functions/assign-franqueadora-role/index.ts` | Setar trial_ends_at ao criar franquia |
| `src/contexts/AuthContext.tsx` | Adicionar verificacao de assinatura |
| `src/components/ProtectedRoute.tsx` | Bloquear acesso se expirado |
| `src/pages/admin/AdminLayout.tsx` | Mostrar banner de trial |
| `src/pages/ChoosePlan.tsx` | Nova pagina de escolha de plano |
| `src/App.tsx` | Adicionar rota /escolher-plano |

---

### Comportamento por Role

| Role | Verificacao de Assinatura |
|------|---------------------------|
| **Franqueadora** | Verifica status da propria franquia |
| **Vendedor** | Busca franchise_id da tabela `sellers` via `user_id`, depois verifica status |
| **Motorista** | Busca `franchise_id` da tabela `drivers` via `user_id`, depois verifica status |

Todos os usuarios vinculados a uma franquia com assinatura expirada serao bloqueados automaticamente.

---

### Secao Tecnica Detalhada

#### Funcao para Buscar Status da Assinatura

```typescript
const getSubscriptionStatus = async (userId: string): Promise<SubscriptionStatus | null> => {
  // 1. Buscar franchise_id do usuario (pode ser franqueadora, vendedor ou motorista)
  let franchiseId: string | null = null;
  
  // Tentar user_franchises primeiro (franqueadora)
  const { data: ufData } = await supabase
    .from('user_franchises')
    .select('franchise_id')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (ufData?.franchise_id) {
    franchiseId = ufData.franchise_id;
  } else {
    // Tentar drivers
    const { data: driverData } = await supabase
      .from('drivers')
      .select('franchise_id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (driverData?.franchise_id) {
      franchiseId = driverData.franchise_id;
    }
  }
  
  if (!franchiseId) return null;
  
  // 2. Buscar franquia raiz (parent_franchise_id IS NULL)
  const { data: franchise } = await supabase
    .from('franchises')
    .select('id, parent_franchise_id, trial_ends_at, subscription_status, subscription_plan, subscription_expires_at')
    .eq('id', franchiseId)
    .single();
  
  // Se for unidade filha, buscar franquia pai
  let rootFranchise = franchise;
  if (franchise?.parent_franchise_id) {
    const { data: parent } = await supabase
      .from('franchises')
      .select('trial_ends_at, subscription_status, subscription_plan, subscription_expires_at')
      .eq('id', franchise.parent_franchise_id)
      .single();
    rootFranchise = parent;
  }
  
  // 3. Calcular status
  const now = new Date();
  const trialEndsAt = rootFranchise?.trial_ends_at ? new Date(rootFranchise.trial_ends_at) : null;
  const subscriptionExpiresAt = rootFranchise?.subscription_expires_at ? new Date(rootFranchise.subscription_expires_at) : null;
  
  // Calcular dias restantes do trial
  let trialDaysLeft = null;
  if (trialEndsAt && rootFranchise?.subscription_status === 'trial') {
    const diff = trialEndsAt.getTime() - now.getTime();
    trialDaysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
  
  // Determinar status atual
  let status = rootFranchise?.subscription_status || 'trial';
  if (status === 'trial' && trialEndsAt && now > trialEndsAt) {
    status = 'expired';
  }
  if (status === 'active' && subscriptionExpiresAt && now > subscriptionExpiresAt) {
    status = 'expired';
  }
  
  return {
    status,
    trialDaysLeft,
    plan: rootFranchise?.subscription_plan || null,
    expiresAt: subscriptionExpiresAt
  };
};
```

---

### Resultado Esperado

1. Novos usuarios recebem 10 dias de trial automaticamente
2. Banner amarelo mostra dias restantes no painel
3. Apos trial expirar, usuario e redireccionado para pagina de planos
4. Vendedores e motoristas vinculados tambem sao bloqueados
5. Ao contratar plano, acesso e liberado para todos

---

### Proximos Passos (Futuro)

- Integracao com Stripe para pagamentos recorrentes
- Webhooks para atualizar status automaticamente
- Email de lembrete quando trial estiver acabando
- Dashboard do Super Admin para gerenciar assinaturas

