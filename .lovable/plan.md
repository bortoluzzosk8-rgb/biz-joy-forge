
## Plano: Dobrar o Tamanho do Logo

### Situação Atual

O logo está com a classe `h-14` que equivale a **56px** de altura.

### Alteração

Dobrar o tamanho significa usar `h-28` que equivale a **112px** de altura.

| Classe | Altura | Status |
|--------|--------|--------|
| h-14 | 56px | Atual |
| h-28 | 112px | **Novo (dobro)** |

---

### Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/AdminLayout.tsx` | Linha 132 |

---

### Código

```typescript
// ANTES (linha 132)
className="h-14 w-auto"

// DEPOIS
className="h-28 w-auto"
```

---

### Resultado

O logo do PlayGestor ficará com o dobro do tamanho atual (de 56px para 112px de altura).
