

## Plano: Auto-Scroll para Pagamentos Registrados

### Problema

Ao adicionar um pagamento no drawer, a seção "Pagamentos Registrados" não fica visível. O usuário precisa rolar manualmente para ver e confirmar o pagamento recém-adicionado.

---

### Solução

Implementar scroll automático para a lista de pagamentos após adicionar um novo pagamento:

1. Criar uma referência (`useRef`) para a seção de pagamentos registrados
2. Após adicionar o pagamento com sucesso, usar `scrollIntoView()` para rolar até essa seção

---

### Arquivo a Modificar

`src/components/admin/QuickPaymentDrawer.tsx`

---

### Alterações

#### 1. Importar useRef (linha 1)

```tsx
import { useState, useEffect, useRef } from "react";
```

#### 2. Criar a referência (linha ~75)

```tsx
const paymentsListRef = useRef<HTMLDivElement>(null);
```

#### 3. Adicionar scroll após adicionar pagamento (após linha 182)

```tsx
// Após loadPayments() e onPaymentAdded()
setTimeout(() => {
  paymentsListRef.current?.scrollIntoView({ 
    behavior: 'smooth', 
    block: 'start' 
  });
}, 100);
```

#### 4. Adicionar ref na seção de pagamentos (linha 528)

```tsx
<div ref={paymentsListRef}>
  <h3 className="font-semibold mb-3">📜 Pagamentos Registrados ({payments.length})</h3>
  ...
</div>
```

---

### Fluxo Após a Alteração

```text
1. Usuário preenche o formulário
2. Clica em "Adicionar Pagamento"
3. Pagamento é salvo no banco
4. Lista é recarregada
5. ✨ Scroll automático para a seção "Pagamentos Registrados"
6. Usuário vê o pagamento recém-adicionado
7. Pode clicar em "Confirmar" imediatamente
```

---

### Resultado Esperado

- Após adicionar um pagamento, a tela rola automaticamente para mostrar a lista
- O pagamento recém-adicionado fica visível imediatamente
- O botão "Confirmar" fica acessível sem precisar rolar manualmente

