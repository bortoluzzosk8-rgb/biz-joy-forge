

## Plano: Padronizar Ícones das Abas de Gestão de Estoque

### Problema Identificado

As abas do painel de Gestão de Estoque estão **despadronizadas**:

| Aba | Estado Atual | Problema |
|-----|--------------|----------|
| Ativos | Sem ícone | Inconsistente |
| Consulta | 📋 (emoji) | OK |
| Excluídos | Sem ícone | Inconsistente |
| Movimentações | `<Truck>` (ícone Lucide) | Mistura de padrões |
| Dashboard | Sem ícone | Inconsistente |
| Histórico | `<History>` (ícone Lucide) | Mistura de padrões |
| Análise | 📊 (emoji) | OK |

---

### Solução Proposta

Padronizar usando **emojis** em todas as abas, seguindo o padrão já estabelecido no painel Financeiro (que usa emojis consistentemente).

| Aba | Emoji | Resultado |
|-----|-------|-----------|
| Ativos | 📦 | 📦 Ativos |
| Consulta | 🔍 | 🔍 Consulta |
| Excluídos | 🗑️ | 🗑️ Excluídos |
| Movimentações | 🚚 | 🚚 Movimentações |
| Dashboard | 📊 | 📊 Dashboard |
| Histórico | 🕐 | 🕐 Histórico |
| Análise | 📈 | 📈 Análise |

---

### Mudanças no Arquivo

**Arquivo:** `src/pages/admin/Stock.tsx`

Substituir os ícones Lucide (`<Truck>`, `<History>`) e adicionar emojis nas abas que não possuem:

```tsx
// ANTES
<Button ...>Ativos</Button>
<Button ...>📋 Consulta</Button>
<Button ...>Excluídos</Button>
<Button ...><Truck className="w-4 h-4 mr-1" />Movimentações...</Button>
<Button ...>Dashboard</Button>
<Button ...><History className="w-4 h-4 mr-1" />Histórico</Button>
<Button ...>📊 Análise</Button>

// DEPOIS
<Button ...>📦 Ativos</Button>
<Button ...>🔍 Consulta</Button>
<Button ...>🗑️ Excluídos</Button>
<Button ...>🚚 Movimentações...</Button>
<Button ...>📊 Dashboard</Button>
<Button ...>🕐 Histórico</Button>
<Button ...>📈 Análise</Button>
```

---

### Benefícios

1. **Consistência visual** - Todas as abas seguem o mesmo padrão
2. **Alinhamento com Financeiro** - Usa o mesmo estilo de emojis já existente no sistema
3. **Melhor identificação** - Cada aba terá um ícone representativo do seu conteúdo
4. **Simplicidade** - Remove a necessidade de importar ícones Lucide para as abas

---

### Resultado Esperado

As abas do painel de Gestão de Estoque ficarão visualmente uniformes e alinhadas com o padrão do restante do sistema.

