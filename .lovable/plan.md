

## Plano: Remover Toast de "Adicionado ao Carrinho"

### Problema

Ao clicar em "Encomendar" ou "Adicionar ao Carrinho", a mensagem de toast "Pula pula de 3,05m adicionado ao carrinho" aparece sobre o carrinho flutuante, dificultando clicar nos botões.

---

### Solução

Remover a chamada `toast.success()` da função `handleAddToCart()` no `ProductDetail.tsx`.

O feedback visual já é dado pelo próprio carrinho flutuante que aparece/atualiza automaticamente, mostrando o item adicionado.

---

### Arquivo a Modificar

`src/pages/ProductDetail.tsx`

---

### Alteração

**Linha 96 - Remover:**
```tsx
toast.success(`${product.name} adicionado ao carrinho`);
```

**Antes (linhas 86-97):**
```tsx
const handleAddToCart = () => {
  if (!product) return;
  
  const existing = cart.find((i) => i.product.id === product.id);
  const stock = product.stock_qty ?? 0;
  if (stock > 0 && existing && existing.quantity >= stock) {
    toast.error("Quantidade máxima em estoque atingida");
    return;
  }
  addToCart(product);
  toast.success(`${product.name} adicionado ao carrinho`);  // ← Remover esta linha
};
```

**Depois:**
```tsx
const handleAddToCart = () => {
  if (!product) return;
  
  const existing = cart.find((i) => i.product.id === product.id);
  const stock = product.stock_qty ?? 0;
  if (stock > 0 && existing && existing.quantity >= stock) {
    toast.error("Quantidade máxima em estoque atingida");
    return;
  }
  addToCart(product);
};
```

---

### Resultado

- Ao clicar em "Encomendar" ou "Adicionar ao Carrinho", o produto é adicionado silenciosamente
- O carrinho flutuante aparece/atualiza mostrando o item adicionado
- Nenhuma mensagem bloqueia os botões

