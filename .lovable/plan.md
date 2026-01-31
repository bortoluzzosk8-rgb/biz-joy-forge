

## Plano: Melhorar Navegação Mobile das Abas

### Situação Atual

No celular, as abas de navegação (Estoque, Clientes, Produtos, Financeiro, etc.) são exibidas como um dropdown Select. Isso funciona, mas pode ser menos intuitivo.

### Proposta de Melhoria

Trocar o dropdown por uma **barra de abas horizontal com scroll** - mais visual e fácil de navegar com o dedo.

---

### Arquivo a Modificar

`src/pages/admin/AdminLayout.tsx`

---

### Alterações

#### Navegação Mobile (linhas 184-222)

**Antes:** Dropdown Select
```tsx
{isMobile ? (
  <Select value={getCurrentTab()} onValueChange={handleTabChange}>
    <SelectTrigger className="w-full max-w-xs">
      <SelectValue placeholder="Selecione uma seção" />
    </SelectTrigger>
    <SelectContent>
      {visibleMenuItems.map(...)}
    </SelectContent>
  </Select>
) : (
  <Tabs>...</Tabs>
)}
```

**Depois:** Barra de abas horizontal com scroll
```tsx
<div className="w-full overflow-x-auto">
  <div className="flex gap-1 pb-2 min-w-max md:flex-wrap md:min-w-0">
    {visibleMenuItems.map((item) => {
      const Icon = item.icon;
      const isActive = getCurrentTab() === item.value;
      return (
        <Button
          key={item.value}
          variant={isActive ? "default" : "ghost"}
          size="sm"
          onClick={() => handleTabChange(item.value)}
          className={cn(
            "shrink-0 flex items-center gap-1.5 px-3 py-2",
            isActive && "bg-primary text-primary-foreground"
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="text-xs sm:text-sm">{item.label}</span>
        </Button>
      );
    })}
  </div>
</div>
```

---

### Comparação Visual

```text
ANTES (Mobile):                      DEPOIS (Mobile):
┌─────────────────────────────┐      ┌─────────────────────────────┐
│ [Locações        ▼]         │      │ [Locações][Estoque][Clientes] ──►
│                             │      │  ← scroll horizontal ──────►
│ (dropdown fechado)          │      │                             │
└─────────────────────────────┘      └─────────────────────────────┘

Precisa clicar para ver opções       Todas as opções visíveis
                                     Desliza para ver mais
```

---

### Benefícios

| Aspecto | Dropdown (Atual) | Barra Horizontal (Nova) |
|---------|------------------|-------------------------|
| Visibilidade | Opções escondidas | Opções visíveis |
| Navegação | 2 cliques (abrir + selecionar) | 1 toque direto |
| UX Mobile | Menos intuitivo | Padrão de apps modernos |
| Feedback visual | Apenas texto | Ícone + texto destacado |

---

### Detalhes Técnicos

1. `overflow-x-auto` permite scroll horizontal
2. `min-w-max` mantém os botões em linha
3. `shrink-0` impede que os botões encolham
4. Botão ativo usa `bg-primary` para destaque visual
5. Desktop mantém comportamento atual com `md:flex-wrap`

---

### Resultado Esperado

- Todas as abas visíveis ao mesmo tempo
- Scroll horizontal suave com o dedo
- Aba ativa destacada visualmente
- Ícones + texto para fácil identificação
- Navegação com 1 toque

