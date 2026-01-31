
## Plano: Remover Card de "Diferença" do Gráfico de Vendas

### Componente Identificado

O card de "Diferença" está localizado no arquivo `src/components/sales/SalesChart.tsx` nas linhas 365-382.

### Layout Atual

```
Grid com 4 cards:
[ Realizado ] [ Vendido ] [ Diferença ] [ Ticket Médio ]
```

### Layout Após Remoção

```
Grid com 3 cards:
[ Realizado ] [ Vendido ] [ Ticket Médio ]
```

---

### Alterações Necessárias

#### 1. Remover o card de "Diferença" (linhas 365-382)

Remover completamente o seguinte bloco:
```tsx
<Card>
  <CardContent className="pt-4">
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
      {isPositiveDiff ? (
        <TrendingUp className="h-4 w-4 text-green-500" />
      ) : (
        <TrendingDown className="h-4 w-4 text-red-500" />
      )}
      Diferença
    </div>
    <div className={`text-2xl font-bold ${isPositiveDiff ? "text-green-600" : "text-red-600"}`}>
      {isPositiveDiff ? "+" : ""}{formatCurrency(difference)}
    </div>
    <div className="text-xs text-muted-foreground mt-1">
      vendas antecipadas
    </div>
  </CardContent>
</Card>
```

#### 2. Ajustar o grid de 4 para 3 colunas (linha 334)

```tsx
// Antes:
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">

// Depois:
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
```

---

### Arquivo a Modificar

| Arquivo | Alterações |
|---------|------------|
| `src/components/sales/SalesChart.tsx` | Remover card de Diferença e ajustar grid layout |

---

### Resultado Esperado

- O painel de "Diferença" não será mais exibido
- Os 3 cards restantes (Realizado, Vendido, Ticket Médio) ficarão bem distribuídos
- Layout responsivo mantido
