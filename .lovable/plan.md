

## Plano: Reduzir Logo pela Metade

### Situação Atual

O logo está com a classe `h-28` que equivale a **112px** de altura.

### Alteração

Reduzir pela metade significa usar `h-14` que equivale a **56px** de altura.

| Classe | Altura | Status |
|--------|--------|--------|
| h-28 | 112px | Atual |
| h-14 | 56px | **Novo (metade)** |

---

### Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/AdminLayout.tsx` | Linha 132 |

---

### Código

```typescript
// ANTES
className="h-28 w-auto"

// DEPOIS
className="h-14 w-auto"
```

---

### Resultado

O logo do PlayGestor ficará com a metade do tamanho atual (de 112px para 56px de altura), mantendo a proporção original.

