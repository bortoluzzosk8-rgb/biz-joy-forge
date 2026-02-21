

## Plano: Plano de Lancamento - R$ 59,00

### Objetivo

Substituir os 3 planos atuais (Basico R$197, Profissional R$297, Multi-Unidades R$497) por um unico **Plano de Lancamento** a R$59/mes com acesso total por 6 meses.

---

### Onde os planos estao definidos hoje

| Arquivo | O que tem |
|---------|-----------|
| `src/pages/Subscription.tsx` | `PLAN_PRICES` e `PLAN_NAMES` + seletor de plano |
| `src/pages/ChoosePlan.tsx` | Grid com 3 planos |
| `src/components/landing/Plans.tsx` | Planos na landing page |
| `supabase/functions/asaas-payment/index.ts` | `PLAN_PRICES` usado para cobrar no Asaas |

---

### Mudancas

#### 1. Edge Function `asaas-payment/index.ts`

Atualizar o mapa de precos:

```typescript
const PLAN_PRICES: Record<string, number> = {
  lancamento: 59,
};
```

#### 2. `src/pages/Subscription.tsx`

- Trocar `PLAN_PRICES` e `PLAN_NAMES` para o plano unico:

```typescript
const PLAN_PRICES: Record<string, number> = { lancamento: 59 };
const PLAN_NAMES: Record<string, string> = { lancamento: "Lancamento" };
```

- Remover o seletor de 3 planos e fixar `selectedPlan = 'lancamento'`
- Mostrar um card unico com as informacoes do plano de lancamento (R$59/mes, acesso total, valido por 6 meses)

#### 3. `src/pages/ChoosePlan.tsx`

- Substituir os 3 cards por um unico card destacado com:
  - Nome: "Plano de Lancamento"
  - Preco: R$ 59/mes
  - Descricao: Acesso total por 6 meses
  - Features: todas as funcionalidades listadas (estoque, financeiro, logistica, relatorios, usuarios ilimitados, etc.)
  - Badge: "Oferta de Lancamento"

#### 4. `src/components/landing/Plans.tsx`

- Substituir os 3 planos por um unico plano de lancamento com as mesmas informacoes

---

### O que NAO muda

- Fluxo de pagamento (Pix, Boleto, Cartao) continua o mesmo
- Webhook do Asaas continua funcionando igual
- Trial de 10 dias continua igual
- Logica de bloqueio por assinatura expirada continua igual

---

### Resultado Esperado

1. Usuario vê apenas um plano: **Lancamento - R$ 59/mes**
2. Ao pagar, o Asaas cobra R$ 59
3. Acesso total a todas as funcionalidades
4. Landing page mostra o plano unico de lancamento

