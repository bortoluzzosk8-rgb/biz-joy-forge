

## Plano: Reduzir Tamanho do Carrinho Flutuante no Mobile

### Problema

O carrinho flutuante atual ocupa quase toda a largura da tela no celular (`w-80` = 320px), com:
- Header com padding grande (`p-4`)
- Texto do valor em `text-2xl`  
- Botão "Finalizar Compra" muito alto (`py-6`)

Isso atrapalha a visualização dos botões de ação da página.

---

### Solução

Criar uma versão mais compacta para mobile que seja menor e menos intrusiva.

---

### Arquivo a Modificar

`src/components/catalog/FloatingCart.tsx`

---

### Alterações

| Elemento | Antes | Depois |
|----------|-------|--------|
| Largura | `w-80 md:w-96` | `w-64 md:w-80` |
| Posição | `bottom-6 right-6` | `bottom-4 right-4 md:bottom-6 md:right-6` |
| Padding header | `p-4` | `p-3 md:p-4` |
| Gap header | `gap-3` | `gap-2 md:gap-3` |
| Ícone carrinho | `w-6 h-6` | `w-5 h-5 md:w-6 md:h-6` |
| Título | `text-lg` | `text-base md:text-lg` |
| Valor total | `text-2xl` | `text-lg md:text-2xl` |
| Padding botão | `p-4` | `p-3 md:p-4` |
| Botão altura | `py-6` | `py-3 md:py-6` |
| Botão texto | `text-lg` | `text-sm md:text-lg` |

---

### Código Atualizado

```tsx
<Card className="fixed bottom-4 right-4 md:bottom-6 md:right-6 w-64 md:w-80 shadow-2xl border-2 border-primary/30 overflow-hidden z-50 animate-scale-in">
  <div 
    className="gradient-primary p-3 md:p-4 cursor-pointer transition-all duration-300 hover:opacity-90"
    onClick={() => setCartExpanded(!cartExpanded)}
  >
    <div className="flex items-center justify-between text-white">
      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative">
          <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
          <Badge className="absolute -top-2 -right-2 bg-secondary text-white border-0 w-4 h-4 md:w-5 md:h-5 p-0 flex items-center justify-center text-xs font-bold animate-pulse">
            {cart.length}
          </Badge>
        </div>
        <div>
          <p className="font-bold text-base md:text-lg">Meu Carrinho</p>
          <p className="text-xs text-white/80">{cart.length} {cart.length === 1 ? 'item' : 'itens'}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-lg md:text-2xl font-black">{formatCurrency(cartTotal())}</p>
      </div>
    </div>
  </div>
  
  {/* ... lista de itens (mesmo código) ... */}
  
  <div className="p-3 md:p-4 bg-card border-t">
    <Button 
      onClick={() => navigate("/checkout")} 
      className="w-full gradient-success text-white font-bold text-sm md:text-lg py-3 md:py-6 rounded-xl shadow-lg hover:scale-105 transition-all duration-300 border-0"
    >
      <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 mr-2" />
      Finalizar Compra
    </Button>
  </div>
</Card>
```

---

### Comparação Visual

```text
ANTES (Mobile):                      DEPOIS (Mobile):
┌──────────────────────────────┐     ┌────────────────────────┐
│ 🛒 Meu Carrinho   R$ 800,00  │     │ 🛒 Meu Carrinho        │
│    1 item                    │     │    1 item    R$ 800,00 │
│                              │     │                        │
│ ┌──────────────────────────┐ │     │ ┌────────────────────┐ │
│ │                          │ │     │ │ Finalizar Compra   │ │
│ │     Finalizar Compra     │ │     │ └────────────────────┘ │
│ │                          │ │     └────────────────────────┘
│ └──────────────────────────┘ │     
└──────────────────────────────┘     Largura: ~256px
Largura: ~320px                      Altura: ~30% menor
```

---

### Resultado Esperado

- Carrinho flutuante **20% mais estreito** no mobile (256px vs 320px)
- **Altura reduzida** em ~30% com padding e botão menores
- Não bloqueia o botão "Ir para o Carrinho"
- Mantém todas as funcionalidades intactas
- Em desktop permanece com tamanho confortável

