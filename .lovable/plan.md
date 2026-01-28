

## Plano: Aumentar Tamanho do Logo no Header

### Objetivo

Aumentar o logo do PlayGestor no header do painel administrativo para ficar mais proporcional ao texto do email.

---

### Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/AdminLayout.tsx` | Aumentar classe do logo |

---

### Alteração

**Linha 130** - Alterar a classe de altura do logo:

```typescript
// ANTES
className="h-10 w-auto"

// DEPOIS
className="h-14 w-auto"
```

### Comparação de Tamanhos

| Classe | Altura | Observação |
|--------|--------|------------|
| h-10 | 40px | Atual (pequeno) |
| h-12 | 48px | Médio |
| h-14 | 56px | Recomendado |
| h-16 | 64px | Grande |

Vou usar `h-14` (56px) que deve ficar proporcional ao email. Se ainda precisar ajustar, podemos aumentar ou diminuir.

