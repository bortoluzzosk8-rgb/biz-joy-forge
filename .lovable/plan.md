

## Plano: Sistema Completo de Assinaturas com Asaas

### Resumo

Implementar sistema completo de controle de assinaturas com:
- Trial de 10 dias (ja existe)
- Pagamento via cartao (assinatura recorrente)
- Pagamento via boleto ou Pix (cobranca mensal)
- Webhook para atualizacao automatica de status
- Pagina de gerenciamento de assinatura `/assinatura`

---

### O Que Ja Existe

| Funcionalidade | Status |
|----------------|--------|
| Campos `trial_ends_at`, `subscription_status`, `subscription_plan`, `subscription_expires_at` | Implementado |
| Hook `useSubscriptionStatus` | Implementado |
| Banner de trial no painel | Implementado |
| Bloqueio e redirecionamento para `/escolher-plano` | Implementado |
| Edge function `asaas-payment` basica | Implementado |
| Secret `ASAAS_API_KEY` | Configurada |

---

### O Que Precisa Ser Adicionado

#### 1. Novos Campos no Banco de Dados

Adicionar na tabela `franchises`:

```sql
ALTER TABLE franchises
ADD COLUMN asaas_customer_id text DEFAULT NULL,
ADD COLUMN asaas_subscription_id text DEFAULT NULL,
ADD COLUMN payment_method text DEFAULT NULL,
ADD COLUMN next_due_date date DEFAULT NULL;
```

#### 2. Tabela de Historico de Cobrancas

Nova tabela para armazenar historico de pagamentos de assinatura:

```sql
CREATE TABLE subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id uuid REFERENCES franchises(id) ON DELETE CASCADE NOT NULL,
  asaas_payment_id text NOT NULL,
  billing_type text NOT NULL, -- PIX, BOLETO, CREDIT_CARD
  value numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, paid, overdue, cancelled
  due_date date NOT NULL,
  payment_date date,
  boleto_url text,
  boleto_barcode text,
  pix_qrcode text,
  pix_qrcode_image text,
  pix_expiration_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

### Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/migrations/xxx_add_asaas_subscription_fields.sql` | Adicionar campos e tabela |
| `supabase/functions/asaas-payment/index.ts` | Expandir com assinaturas e webhook |
| `src/pages/Subscription.tsx` | Nova pagina de gerenciamento de assinatura |
| `src/App.tsx` | Adicionar rota `/assinatura` |
| `src/pages/ChoosePlan.tsx` | Integrar com pagamento real |
| `src/hooks/useSubscriptionStatus.ts` | Adicionar novos campos |
| `src/pages/admin/AdminLayout.tsx` | Adicionar link para assinatura |
| `src/components/ProtectedRoute.tsx` | Atualizar logica de bloqueio |
| `supabase/config.toml` | Configurar edge function webhook |

---

### Secao Tecnica

#### Edge Function asaas-payment - Novas Acoes

```typescript
// Novas acoes a adicionar:

case 'create-subscription': {
  // Criar assinatura recorrente no Asaas
  // - Criar/buscar cliente
  // - Criar assinatura mensal
  // - Retornar dados para salvar no banco
}

case 'create-charge': {
  // Criar cobranca avulsa (boleto ou Pix)
  // - Criar/buscar cliente
  // - Criar cobranca com vencimento
  // - Retornar boleto/QR Code
}

case 'subscription-webhook': {
  // Receber notificacoes do Asaas
  // - PAYMENT_CONFIRMED: status = active
  // - PAYMENT_OVERDUE: status = past_due
  // - SUBSCRIPTION_DELETED: status = cancelled
  // - Atualizar franchise e subscription_payments
}

case 'cancel-subscription': {
  // Cancelar assinatura no Asaas
}

case 'list-payments': {
  // Listar cobrancas do cliente
}
```

#### Pagina Subscription.tsx - Componentes

```
+--------------------------------------------------+
| Gerenciar Assinatura                             |
+--------------------------------------------------+
| Status: [Trial / Ativo / Bloqueado]              |
| Plano: [Basico / Profissional / Multi-Unidades]  |
| Proximo vencimento: [data]                       |
+--------------------------------------------------+
| [Pagar com Cartao]  [Gerar Boleto]  [Gerar Pix]  |
+--------------------------------------------------+
| Historico de Cobrancas                           |
| - 28/01/2026 | R$ 197,00 | Pago | Cartao        |
| - 28/12/2025 | R$ 197,00 | Pago | Boleto        |
+--------------------------------------------------+
```

#### Fluxo de Pagamento com Cartao

```
1. Usuario clica "Pagar com Cartao"
2. Abre modal com formulario de cartao (Asaas tokenizacao)
3. Frontend envia dados para edge function 'create-subscription'
4. Edge function:
   a. Cria/busca cliente no Asaas
   b. Cria assinatura recorrente
   c. Atualiza franchise no banco
5. Retorna sucesso, usuario tem acesso liberado
```

#### Fluxo de Pagamento com Boleto/Pix

```
1. Usuario clica "Gerar Boleto" ou "Gerar Pix"
2. Frontend chama edge function 'create-charge'
3. Edge function:
   a. Cria/busca cliente no Asaas
   b. Cria cobranca com vencimento (5 dias)
   c. Salva em subscription_payments
   d. Atualiza franchise (status = past_due)
4. Exibe boleto/QR Code na tela
5. Webhook recebe confirmacao quando pago
6. Webhook atualiza franchise (status = active)
```

#### Webhook do Asaas

Configurar URL do webhook no painel do Asaas:
```
https://xpbjlcxqftopbizqcjuv.supabase.co/functions/v1/asaas-payment?action=subscription-webhook
```

Eventos a processar:
- `PAYMENT_CONFIRMED` / `PAYMENT_RECEIVED` → status = active
- `PAYMENT_OVERDUE` → status = past_due (3 dias de tolerancia)
- `PAYMENT_DELETED` → manter status atual
- `SUBSCRIPTION_DELETED` → status = cancelled

#### Regra de Bloqueio Atualizada

```typescript
// ProtectedRoute.tsx
const isBlocked = 
  subscriptionStatus?.status === 'expired' ||
  subscriptionStatus?.status === 'blocked' ||
  subscriptionStatus?.status === 'cancelled';

if (isBlocked && !isSuperAdmin) {
  return <Navigate to="/assinatura" replace />;
}
```

#### Mensagens ao Usuario

| Situacao | Mensagem |
|----------|----------|
| Trial | "Voce esta no teste gratis. Faltam X dias para ativar sua assinatura." |
| Bloqueado | "Seu teste expirou. Escolha uma forma de pagamento para continuar usando o sistema." |
| Pagamento pendente | "Identificamos um pagamento em aberto. Regularize para evitar bloqueio." |
| Assinatura ativa | "Sua assinatura esta ativa ate [data]." |

---

### Precos dos Planos

| Plano | Preco | Codigo |
|-------|-------|--------|
| Basico | R$ 197/mes | basic |
| Profissional | R$ 297/mes | pro |
| Multi-Unidades | R$ 497/mes | multi |

---

### Resultado Esperado

1. Usuario pode pagar com cartao (recorrente automatico)
2. Usuario pode gerar boleto ou Pix (pagamento mensal)
3. Sistema atualiza status automaticamente via webhook
4. Usuario bloqueado ve apenas pagina de assinatura
5. Historico de cobrancas disponivel na pagina
6. Vendedores e motoristas vinculados tambem bloqueados junto com franqueadora

---

### Observacoes de Seguranca

- Webhook usa service_role_key internamente (seguro)
- RLS protege tabela subscription_payments
- Tokenizacao de cartao feita pelo Asaas (PCI compliant)
- Nao armazenamos dados sensiveis de cartao

