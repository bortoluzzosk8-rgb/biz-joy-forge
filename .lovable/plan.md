
## Plano: Atualizar Valores Padrão do Catálogo para PlayGestor

### Problema Identificado

A tabela `settings` no banco de dados está **vazia**, então o sistema está usando os valores padrão definidos no código. Esses valores padrão ainda são os antigos da marca "ENGBRINK":

| Campo | Valor Atual (Incorreto) | Valor Correto |
|-------|------------------------|---------------|
| `logoUrl` | `/src/assets/logo-engbrink.jpg` | `/src/assets/logo-playgestor-novo.png` |
| `catalogHeaderTitle` | `Catálogo ENGBRINK` | `Catálogo` |
| `companyName` | `ENGBRINK` | `PlayGestor` |

---

### Arquivos Afetados

Os valores padrão estão definidos em dois lugares:

1. **`src/hooks/useSettings.tsx`** - Hook que fornece configurações para toda a aplicação
2. **`src/pages/admin/Settings.tsx`** - Página de configurações

---

### Alterações Necessárias

#### 1. `src/hooks/useSettings.tsx`

Atualizar os valores padrão do estado inicial (linha 27-35):

```tsx
// Antes:
logoUrl: '/src/assets/logo-engbrink.jpg',
catalogTitle: 'Brinquedos Infláveis',
catalogSubtitle: 'Bem-vindo ao nosso catálogo!',
catalogHeaderTitle: 'Catálogo ENGBRINK',

// Depois:
logoUrl: '/src/assets/logo-playgestor-novo.png',
catalogTitle: 'Catálogo de Produtos',
catalogSubtitle: 'Bem-vindo ao nosso catálogo!',
catalogHeaderTitle: 'Catálogo',
```

Atualizar também os fallbacks na função `loadSettings()` (linhas 55-62):

```tsx
// Antes:
logoUrl: data.logo_url || '/src/assets/logo-engbrink.jpg',
catalogHeaderTitle: data.catalog_header_title || 'Catálogo ENGBRINK',

// Depois:
logoUrl: data.logo_url || '/src/assets/logo-playgestor-novo.png',
catalogHeaderTitle: data.catalog_header_title || 'Catálogo',
```

#### 2. `src/pages/admin/Settings.tsx`

Atualizar os valores padrão do estado inicial (linhas 23-26):

```tsx
// Antes:
catalogTitle: "Brinquedos Infláveis",
catalogSubtitle: "Bem-vindo ao nosso catálogo!",
catalogHeaderTitle: "Catálogo ENGBRINK",
companyName: "ENGBRINK",

// Depois:
catalogTitle: "Catálogo de Produtos",
catalogSubtitle: "Bem-vindo ao nosso catálogo!",
catalogHeaderTitle: "Catálogo",
companyName: "PlayGestor",
```

E os fallbacks ao carregar dados (linhas 73-76):

```tsx
// Antes:
catalogTitle: data.catalog_title || "Brinquedos Infláveis",
catalogHeaderTitle: data.catalog_header_title || "Catálogo ENGBRINK",
companyName: data.company_name || "ENGBRINK",

// Depois:
catalogTitle: data.catalog_title || "Catálogo de Produtos",
catalogHeaderTitle: data.catalog_header_title || "Catálogo",
companyName: data.company_name || "PlayGestor",
```

---

### Resultado Esperado

Após as alterações:
- O catálogo mostrará automaticamente o logo do PlayGestor
- O título será "Catálogo" ao invés de "Catálogo ENGBRINK"
- A identidade visual ficará consistente com a landing page
- Quando o usuário salvar as configurações pela primeira vez, um registro será criado no banco de dados e esses valores poderão ser personalizados

---

### Próximos Passos (Opcional)

Para personalização completa, o usuário pode acessar **Configurações** no painel administrativo e:
1. Fazer upload de um logo customizado
2. Definir cores personalizadas
3. Configurar os textos do catálogo

