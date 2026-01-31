

## Plano: Atualizar Logo com Fundo Transparente

### O que será feito

Substituir o logo atual (`logo-playgestor-novo.png`) pelo novo logo com fundo transparente que você enviou, mantendo o mesmo tamanho em todos os lugares.

### Etapas

| Etapa | Ação |
|-------|------|
| 1 | Copiar o novo logo para `src/assets/logo-playgestor-novo.png` (substituindo o atual) |

### Arquivos que usam o logo

O logo é importado de `@/assets/logo-playgestor-novo.png` nos seguintes arquivos:

| Arquivo | Tamanho atual |
|---------|---------------|
| `Header.tsx` (landing page) | `h-10 md:h-14` |
| `Footer.tsx` (landing page) | `h-12` |
| `AdminLayout.tsx` (sistema) | `h-14` |

### Resultado

Após a substituição:
- O logo aparecerá sem o fundo branco em todos os lugares
- Funcionará perfeitamente sobre fundos escuros (como o footer) e claros (como o header)
- O tamanho permanecerá exatamente o mesmo

