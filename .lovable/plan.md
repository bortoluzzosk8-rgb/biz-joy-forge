

## Plano: Corrigir Logo na Landing Page

### Problema Identificado

O Header da landing page está importando o logo errado:
- **Landing Page (Header.tsx)**: usa `logo-playgestor.png`  
- **Sistema Admin (AdminLayout.tsx)**: usa `logo-playgestor-novo.png` ✓

### Arquivo a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/landing/Header.tsx` | Alterar import do logo |

---

### Alteração Detalhada

**Linha 6 - Alterar import do logo:**
```typescript
// ANTES
import logoPlayGestor from '@/assets/logo-playgestor.png';

// DEPOIS
import logoPlayGestor from '@/assets/logo-playgestor-novo.png';
```

O restante do código permanece igual, pois a variável `logoPlayGestor` já é utilizada corretamente no componente.

---

### Resultado Esperado

Após a alteração, o logo na landing page será o mesmo exibido no painel administrativo do sistema.

