
## Plano: Corrigir Logo nas Páginas de Login e Cadastro

### Problema Identificado

As páginas de login e cadastro estão usando o logo antigo (`logo-playgestor.png`) que tem fundo branco, ao invés do logo novo com fundo transparente (`logo-playgestor-novo.png`).

| Arquivo | Logo Atual (incorreto) | Logo Correto |
|---------|----------------------|--------------|
| `UserRegister.tsx` | `logo-playgestor.png` | `logo-playgestor-novo.png` |
| `UserLogin.tsx` | `logo-playgestor.png` | `logo-playgestor-novo.png` |

---

### Alterações Necessárias

#### 1. `src/pages/UserRegister.tsx`
```tsx
// Linha 11 - Antes:
import logoPlayGestor from '@/assets/logo-playgestor.png';

// Depois:
import logoPlayGestor from '@/assets/logo-playgestor-novo.png';
```

#### 2. `src/pages/UserLogin.tsx`
```tsx
// Linha 12 - Antes:
import logoPlayGestor from '@/assets/logo-playgestor.png';

// Depois:
import logoPlayGestor from '@/assets/logo-playgestor-novo.png';
```

---

### Resultado

Após as alterações:
- O logo nas páginas de cadastro e login será o mesmo usado na landing page
- O logo aparecerá sem o fundo branco
- Consistência visual em todo o sistema
