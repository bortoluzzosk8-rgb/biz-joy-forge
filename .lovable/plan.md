

## Plano: Atualizar Titulo e Favicon do Site

### Mudancas

1. **Titulo da aba do navegador** (`index.html`)
   - Trocar de "Catalogo ENGBRINK - Brinquedos Inflaveis" para "PlayGestor - Gestao completa para empresas de locacao"
   - Atualizar tambem as meta tags (og:title, description) para refletir a marca PlayGestor

2. **Favicon (icone da aba)**
   - Copiar a imagem enviada (`Design_sem_nome_3.png`) para `public/favicon.png`
   - Atualizar `index.html` para usar o novo favicon no lugar do padrao da Lovable

### Secao Tecnica

**Arquivo `index.html`:**
- Alterar `<title>` para "PlayGestor - Gestao completa para empresas de locacao"
- Alterar `<meta name="description">` para refletir PlayGestor
- Alterar `<meta property="og:title">` e `<meta property="og:description">`
- Adicionar `<link rel="icon" href="/favicon.png" type="image/png">`

**Arquivo de imagem:**
- Copiar `user-uploads://Design_sem_nome_3.png` para `public/favicon.png`

