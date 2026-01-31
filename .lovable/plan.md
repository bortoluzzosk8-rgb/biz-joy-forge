

## Plano: Carrinho Flutuante Compacto no Mobile

### Problema

O carrinho flutuante ainda ocupa muito espaço no mobile, cobrindo parte da descrição do produto e dificultando a navegação.

---

### Solução

Criar **duas versões** do carrinho:
- **Mobile**: Apenas um botão circular pequeno com ícone + badge
- **Desktop**: O card completo como está hoje

No mobile, ao tocar no botão, o card expande. Ao tocar novamente (ou em "Finalizar"), ele colapsa.

---

### Arquivo a Modificar

`src/components/catalog/FloatingCart.tsx`

---

### Mudança de Abordagem

**No mobile (padrão):** Apenas um botão circular de 56x56px com:
- Ícone de carrinho
- Badge com quantidade
- Ao clicar: expande para o card completo

**No desktop:** Card completo como está hoje

---

### Código Atualizado

```tsx
export const FloatingCart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, cartTotal } = useCart();
  const [isExpanded, setIsExpanded] = useState(false);

  if (cart.length === 0) return null;

  return (
    <>
      {/* Botão compacto - Visível apenas no mobile quando não expandido */}
      <button
        onClick={() => setIsExpanded(true)}
        className="md:hidden fixed bottom-4 right-4 w-14 h-14 rounded-full gradient-primary shadow-xl z-50 flex items-center justify-center animate-scale-in"
        style={{ display: isExpanded ? 'none' : 'flex' }}
      >
        <ShoppingCart className="w-6 h-6 text-white" />
        <Badge className="absolute -top-1 -right-1 bg-secondary text-white border-0 w-5 h-5 p-0 flex items-center justify-center text-xs font-bold animate-pulse">
          {cart.length}
        </Badge>
      </button>

      {/* Card completo - Sempre visível no desktop, só quando expandido no mobile */}
      <Card 
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 w-64 md:w-80 shadow-2xl border-2 border-primary/30 overflow-hidden z-50 animate-scale-in ${
          isExpanded ? 'block' : 'hidden md:block'
        }`}
      >
        {/* Header com botão de fechar no mobile */}
        <div 
          className="gradient-primary p-3 md:p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* ... conteúdo do header ... */}
        </div>
        
        {/* Lista de itens e botão Finalizar */}
        {/* ... resto do código ... */}
      </Card>
    </>
  );
};
```

---

### Comparação Visual

```text
ANTES (Mobile):                    DEPOIS (Mobile):
┌────────────────────────┐         
│ 🛒 Meu Carrinho        │                              ┌────┐
│    1 item    R$ 800,00 │         Botão compacto →     │ 🛒 │
│                        │                              │ ❶  │
│ ┌────────────────────┐ │                              └────┘
│ │ Finalizar Compra   │ │              56x56px
│ └────────────────────┘ │         
└────────────────────────┘         Ocupa muito menos espaço!

                           
Ao clicar no botão:                Expande para o card →
                                   (mesmo layout atual)
```

---

### Benefícios

- **Botão circular compacto** de 56x56px no mobile
- Não atrapalha a navegação ou visualização do produto
- Ao clicar, expande para o card completo
- Desktop mantém o comportamento atual
- Fácil de acessar e não intrusivo

