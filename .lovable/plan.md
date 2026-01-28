

## Plano: Substituir Logo do PlayGestor

### Situação Atual

O sistema usa o logo antigo localizado em `src/assets/logo-playgestor-header.png`.

### Alterações Necessárias

| Etapa | Ação |
|-------|------|
| 1 | Copiar a nova imagem para `src/assets/` |
| 2 | Atualizar o import no `AdminLayout.tsx` |

---

### Detalhes Técnicos

**1. Copiar a imagem:**
```
user-uploads://image-34.png → src/assets/logo-playgestor-novo.png
```

**2. Atualizar o import no AdminLayout.tsx:**

```typescript
// ANTES
import logoPlaygestor from "@/assets/logo-playgestor-header.png";

// DEPOIS
import logoPlaygestor from "@/assets/logo-playgestor-novo.png";
```

---

### Resultado

- O novo logo colorido com o ícone de play sorridente será exibido no cabeçalho do sistema
- O tamanho permanece em `h-28` (112px) como você aprovou

