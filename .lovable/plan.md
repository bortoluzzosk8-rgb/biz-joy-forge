

## Mostrar formas de pagamento reais no contrato (da tabela sale_payments)

### Problema
O contrato exibe a forma de pagamento do campo `sales.payment_method` (valor fixo como "Dinheiro"), mas deveria mostrar as formas de pagamento reais registradas nos pagamentos da venda (`sale_payments`), agregadas com "/". Exemplo: "Dinheiro/Cartão/PIX".

### Alterações

**`src/pages/PublicContract.tsx`**
1. Na função `fetchSaleData`, buscar também os pagamentos da venda na tabela `sale_payments` (campos `payment_method`)
2. Na função `generateDocumentContent`, agregar os métodos de pagamento únicos dos pagamentos e formatá-los com "/" como separador
3. Se não houver pagamentos em `sale_payments`, usar o fallback `sale.payment_method` como hoje

Lógica:
```text
sale_payments → extrair payment_method únicos → mapear para labels → juntar com "/"
Exemplo: ['dinheiro', 'pix', 'credito'] → "Dinheiro / PIX / Cartão de Crédito"
```

