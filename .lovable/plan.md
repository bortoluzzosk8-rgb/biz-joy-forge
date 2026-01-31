

## Plano: Pagamento Confirmado Automaticamente

### Problema Atual

Fluxo em duas etapas desnecessário:
1. Adicionar pagamento → fica como "pendente"
2. Rolar até a lista → clicar em "Confirmar"

### Solução

Ao clicar em "Adicionar Pagamento", salvar diretamente com `status: 'paid'` e `payment_date` = data atual.

---

### Arquivo a Modificar

`src/components/admin/QuickPaymentDrawer.tsx`

---

### Alteração

Na função `handleAddPayment`, linhas 153-166, mudar:

**Antes:**
```tsx
const { error } = await supabase
  .from('sale_payments')
  .insert({
    sale_id: sale.id,
    payment_type: newPayment.payment_type,
    payment_method: newPayment.payment_method,
    amount,
    installments: parseInt(newPayment.installments),
    status: 'pending',  // ❌ Pendente
    card_fee: ...,
    receipt_url: receiptUrl,
  });
```

**Depois:**
```tsx
const { error } = await supabase
  .from('sale_payments')
  .insert({
    sale_id: sale.id,
    payment_type: newPayment.payment_type,
    payment_method: newPayment.payment_method,
    amount,
    installments: parseInt(newPayment.installments),
    status: 'paid',  // ✅ Já confirmado
    payment_date: new Date().toISOString().split('T')[0],  // Data atual
    card_fee: ...,
    receipt_url: receiptUrl,
  });
```

---

### Limpeza Adicional

Remover o scroll automático (linhas 188-194), pois não é mais necessário mostrar a lista para confirmar.

---

### Resultado

```text
ANTES:                          DEPOIS:
Adicionar → Pendente            Adicionar → Confirmado ✅
Rolar lista → Confirmar         Pronto!
```

- Um clique = pagamento confirmado
- Menos etapas
- Experiência mais rápida

