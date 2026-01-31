

## Plano: Adicionar Carrinho Flutuante na Página de Detalhes do Produto

### Problema Identificado

O carrinho flutuante ("Meu Carrinho") está implementado diretamente no `Catalog.tsx` (linhas 405-478), mas não existe no `ProductDetail.tsx`. Por isso, quando você adiciona um produto pela página de detalhes, aparece apenas o toast de confirmação, mas não o mini-carrinho flutuante.

---

### Solução

Extrair o carrinho flutuante para um componente reutilizável e incluí-lo em ambas as páginas.

---

### Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/components/catalog/FloatingCart.tsx` | Componente do carrinho flutuante reutilizável |

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Catalog.tsx` | Substituir código inline pelo componente FloatingCart |
| `src/pages/ProductDetail.tsx` | Adicionar o componente FloatingCart |

---

### Novo Componente: FloatingCart.tsx

```tsx
// src/components/catalog/FloatingCart.tsx
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";

const formatCurrency = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const FloatingCart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, cartTotal } = useCart();
  const [cartExpanded, setCartExpanded] = useState(false);

  if (cart.length === 0) return null;

  return (
    <Card className="fixed bottom-6 right-6 w-80 md:w-96 shadow-2xl border-2 border-primary/30 overflow-hidden z-50 animate-scale-in">
      {/* Header com gradiente */}
      <div 
        className="gradient-primary p-4 cursor-pointer transition-all duration-300 hover:opacity-90"
        onClick={() => setCartExpanded(!cartExpanded)}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <Badge className="absolute -top-2 -right-2 bg-secondary text-white border-0 w-5 h-5 p-0 flex items-center justify-center text-xs font-bold animate-pulse">
                {cart.length}
              </Badge>
            </div>
            <div>
              <p className="font-bold text-lg">Meu Carrinho</p>
              <p className="text-xs text-white/80">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">{formatCurrency(cartTotal())}</p>
          </div>
        </div>
      </div>
      
      {/* Lista de itens (expandível) */}
      {cartExpanded && (
        <div className="p-4 bg-card max-h-64 overflow-y-auto animate-fade-in">
          {/* Itens do carrinho */}
        </div>
      )}
      
      {/* Botão Finalizar */}
      <div className="p-4 bg-card border-t">
        <Button 
          onClick={() => navigate("/checkout")} 
          className="w-full gradient-success text-white font-bold text-lg py-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 border-0"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          Finalizar Compra
        </Button>
      </div>
    </Card>
  );
};
```

---

### Alteração no ProductDetail.tsx

```tsx
// Adicionar import:
import { FloatingCart } from "@/components/catalog/FloatingCart";

// Adicionar antes do fechamento do </div> principal (antes da linha 299):
<FloatingCart />
```

---

### Layout Visual

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                          PÁGINA DO PRODUTO                               │
│                                                                          │
│  [← Voltar ao Catálogo]                                                  │
│                                                                          │
│  ┌────────────────┐   ┌──────────────────────────────────────────────┐   │
│  │                │   │ 🏷️ inflável                                  │   │
│  │    [Imagem]    │   │                                              │   │
│  │                │   │ Pula pula de 3,05m                           │   │
│  │                │   │                                              │   │
│  │                │   │ R$ 200,00                                    │   │
│  └────────────────┘   │                                              │   │
│                       │ [  + Encomendar  ]                           │   │
│                       │ [  Ir para o Carrinho (1)  ]                 │   │
│                       └──────────────────────────────────────────────┘   │
│                                                                          │
│                                                    ┌────────────────────┐│
│                                                    │ 🛒 Meu Carrinho    ││
│                                                    │    1 item          ││
│                                                    │         R$ 200,00  ││
│                                                    │                    ││
│                                                    │ [Finalizar Compra] ││
│                                                    └────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
```

---

### Resultado Esperado

- Ao clicar em "Encomendar" na página de detalhes do produto, o carrinho flutuante aparece no canto inferior direito
- Mesmo comportamento que já existe na página do Catálogo
- Componente reutilizável para uso futuro em outras páginas

