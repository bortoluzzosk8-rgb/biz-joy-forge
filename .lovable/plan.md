

## Plano: Renomear Seção para "Aparência do Catálogo"

### Alteração Identificada

A seção "Aparência do Sistema" deve ser renomeada para "Aparência do Catálogo", pois o logo e as cores configurados nessa seção são utilizados especificamente no catálogo público.

### Arquivo a Modificar

| Arquivo | Linha | Alteração |
|---------|-------|-----------|
| `src/pages/admin/Settings.tsx` | 347 | Renomear título da seção |

### Alteração Necessária

```tsx
// Antes (linha 347):
🎨 Aparência do Sistema

// Depois:
🎨 Aparência do Catálogo
```

### Resultado Esperado

- O título da seção será "Aparência do Catálogo"
- Ficará mais claro para o usuário que o logo e cores configurados ali são exibidos no catálogo público
- A descrição do campo "Logo da Empresa" continuará a mesma, indicando que é o logo exibido no catálogo

