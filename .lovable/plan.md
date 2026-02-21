

## Plano: Adicionar Pagamento com Cartao de Credito e Remover Boleto

### Objetivo

Ativar o pagamento por cartao de credito (que ja existe na edge function como `create-subscription`) e remover a opcao de boleto, ficando apenas **Pix** e **Cartao de Credito**.

---

### Mudancas em `src/pages/Subscription.tsx`

#### Remover Boleto
- Remover o botao "Boleto Bancario" (linhas 410-423)
- Remover o estado `showBoletoModal` e o modal de boleto (linhas 551-589)
- Remover o import do icone `FileText` (nao sera mais usado)

#### Adicionar Modal de Cartao de Credito
- Adicionar estado `showCardModal` para controlar o modal
- Adicionar campos de formulario no modal:
  - Nome no cartao
  - Numero do cartao
  - Mes de validade
  - Ano de validade
  - CVV
  - CEP
  - Numero do endereco
- Criar funcao `handleCreditCardPayment` que chama a edge function com `action: 'create-subscription'` passando os dados do cartao (`creditCard` e `creditCardHolderInfo`)

#### Ajustar Layout
- Trocar o grid de `md:grid-cols-3` para `md:grid-cols-2`
- Botao de cartao de credito abre o modal ao inves de mostrar toast
- Manter o botao de Pix como esta

---

### Edge Function `asaas-payment/index.ts`

Nenhuma mudanca necessaria. A action `create-subscription` ja existe e suporta cartao de credito com todos os campos necessarios (linhas 222-323).

---

### Fluxo do Cartao de Credito

1. Usuario clica em "Cartao de Credito"
2. Modal abre pedindo dados do cartao
3. Usuario preenche e confirma
4. Frontend chama edge function com `action: 'create-subscription'`
5. Edge function cria assinatura recorrente no Asaas
6. Franchise atualizada com status `active` e `payment_method: 'card'`
7. Cobranças mensais automaticas pelo Asaas

---

### Resultado Esperado

- 2 opcoes de pagamento: **Pix** e **Cartao de Credito**
- Cartao cria assinatura recorrente (cobranca automatica todo mes)
- Pix gera cobranca avulsa mensal (como ja funciona)
- Boleto removido completamente da interface

