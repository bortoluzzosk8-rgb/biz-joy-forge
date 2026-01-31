

## Plano: Melhorar Visualização Mobile do Painel Financeiro

### Problema Identificado

Na imagem, as 7 abas do financeiro (Resumo, Receitas, Despesas, etc.) aparecem completamente sobrepostas e ilegíveis no celular. Isso ocorre porque o código atual força 7 colunas fixas:

```tsx
<TabsList className="grid w-full grid-cols-7 max-w-4xl">
```

---

### Solução

Implementar uma **barra de abas horizontal com scroll** no mobile, similar à melhoria aprovada para o AdminLayout.

---

### Arquivos a Modificar

1. `src/pages/admin/Financial.tsx` - Navegação por abas

---

### Alterações Detalhadas

#### Financial.tsx - Abas com Scroll Horizontal

**Antes:**
```tsx
<TabsList className="grid w-full grid-cols-7 max-w-4xl">
  <TabsTrigger value="summary">📊 Resumo</TabsTrigger>
  <TabsTrigger value="revenue">📈 Receitas</TabsTrigger>
  ...
</TabsList>
```

**Depois:**
```tsx
<TabsList className="flex w-full overflow-x-auto h-auto p-1 gap-1">
  <TabsTrigger value="summary" className="shrink-0 px-3 py-2 text-xs sm:text-sm">
    📊 Resumo
  </TabsTrigger>
  <TabsTrigger value="revenue" className="shrink-0 px-3 py-2 text-xs sm:text-sm">
    📈 Receitas
  </TabsTrigger>
  ...
</TabsList>
```

---

### Comparação Visual

```text
ANTES (Mobile):                      DEPOIS (Mobile):
┌─────────────────────────────┐      ┌─────────────────────────────┐
│ Res📊Rec📈Des📉Emp🏦Car💳Cat📂... │      │ [📊 Resumo][📈 Receitas] ──►
│ (texto sobreposto/ilegível) │      │  ← scroll horizontal ──────►
└─────────────────────────────┘      └─────────────────────────────┘
```

---

### Benefícios

| Aspecto | Antes | Depois |
|---------|-------|--------|
| Legibilidade | Texto sobreposto | Texto claro |
| Navegação | Impossível tocar na aba certa | Toque preciso |
| UX Mobile | Quebrado | Scroll suave |
| Desktop | 7 colunas fixas | Adapta-se ao espaço |

---

### Detalhes Técnicos

1. `flex` + `overflow-x-auto` permite scroll horizontal
2. `shrink-0` impede que as abas encolham
3. `text-xs sm:text-sm` reduz fonte no mobile
4. `h-auto` permite altura flexível
5. `gap-1` adiciona espaçamento entre abas

