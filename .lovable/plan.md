

## Corrigir logo na página de Reset de Senha

A página `/reset-password` usa `logo-engbrink.jpg` em vez do logo PlayGestor. Basta trocar o import e a imagem.

**`src/pages/ResetPassword.tsx`** — Substituir:
```typescript
import logoEngbrink from '@/assets/logo-engbrink.jpg';
```
por:
```typescript
import logoPlaygestor from '@/assets/logo-playgestor-novo.png';
```

E trocar a referência `logoEngbrink` por `logoPlaygestor` no `<img>`.

