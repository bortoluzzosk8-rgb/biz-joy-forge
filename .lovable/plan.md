

## Correção: Expiração por mês, não por 30 dias

### Problema
Ao registrar pagamento, o sistema calcula a expiração somando 30 dias corridos à data de vencimento. O correto é avançar para o mesmo dia do mês seguinte (ex: pagamento dia 11/03 → expira 11/04).

### Correção

**`src/pages/admin/Leads.tsx`** — Linha 207: trocar `setDate(+30)` por `setMonth(+1)`:

```typescript
// Antes:
expiresAt.setDate(expiresAt.getDate() + 30);

// Depois:
expiresAt.setMonth(expiresAt.getMonth() + 1);
```

Isso usa o `setMonth` nativo do JavaScript, que já lida com meses de tamanhos diferentes (ex: 31/01 → 28/02 ou 03/03 dependendo do ano).

