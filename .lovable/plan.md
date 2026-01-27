

## Plano: Corrigir Logo PlayGestor e Escopo das Cores

### Problema Identificado

1. **Logo incorreto**: O arquivo `src/assets/logo-playgestor.png` contém a imagem completa (logo + quadrados de cores), quando deveria conter **apenas o logotipo "PlayGestor"**
2. **Cores aplicadas no escopo errado**: As cores foram aplicadas em todo o sistema (`src/index.css`), mas deveriam ser aplicadas **apenas na landing page**

---

### Situacao Atual vs Esperada

| Item | Atual | Esperado |
|------|-------|----------|
| Logo | Imagem completa com cores | Apenas "PlayGestor" (texto/logo) |
| Cores em `index.css` | Aplicadas em todo sistema | Manter cores originais do sistema |
| Cores na Landing Page | Herda do sistema | Usar vermelho/roxo apenas na landing page |

---

### O Que Sera Feito

#### 1. Substituir o Logo

O arquivo `src/assets/logo-playgestor.png` sera substituido por uma imagem contendo **apenas o logotipo PlayGestor** (sem os quadrados de cores). 

Voce precisara enviar uma nova imagem contendo apenas o logo, ou posso criar um logo temporario usando texto estilizado.

#### 2. Manter Cores Globais do Sistema

O arquivo `src/index.css` JA esta com as cores corretas (vermelho e roxo), e como as cores combinam bem com o branding PlayGestor, elas podem permanecer. 

Se preferir que o painel admin tenha cores diferentes da landing page, eu posso:
- **Opcao A**: Manter tudo como esta (cores iguais em todo sistema)
- **Opcao B**: Criar classes CSS especificas para landing page e reverter as cores globais para um tema neutro

#### 3. Remover Logo das Paginas de Login/Registro (Opcional)

Atualmente, as paginas `UserLogin.tsx` e `UserRegister.tsx` usam o logo PlayGestor. Se o logo for apenas para a landing page, elas podem voltar a usar um logo generico ou manter o PlayGestor (ja que sao paginas publicas relacionadas ao SaaS).

---

### Arquivos Afetados

| Arquivo | Acao |
|---------|------|
| `src/assets/logo-playgestor.png` | Substituir por imagem apenas do logo (precisa de nova imagem) |
| `src/components/landing/Header.tsx` | Manter (ja usa logo PlayGestor) |
| `src/components/landing/Footer.tsx` | Manter (ja usa logo PlayGestor) |

---

### Proximos Passos

Para prosseguir, preciso saber:

1. **Voce pode enviar uma imagem contendo APENAS o logotipo "PlayGestor"?** (sem os quadrados de cores)

2. **As cores vermelho/roxo devem ficar apenas na landing page ou em todo o sistema?**
   - Se apenas na landing page, eu reverto as cores globais e crio estilos especificos

