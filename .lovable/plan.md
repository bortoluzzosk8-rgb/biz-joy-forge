

## Plano: Remover Aba de Patrimônios do Financeiro

### Objetivo

Excluir a aba "Patrimônios" da página Financeiro, pois esta funcionalidade não é mais necessária.

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/admin/Financial.tsx` | Remover import, tab trigger e tab content de "Patrimônios" |

---

### Arquivos a Excluir (Opcional)

Os seguintes arquivos podem ser excluídos pois não serão mais utilizados:

| Arquivo | Descrição |
|---------|-----------|
| `src/components/financial/AssetManager.tsx` | Componente principal de patrimônios |
| `src/components/financial/AssetList.tsx` | Lista de patrimônios |
| `src/components/financial/AssetCategoryManager.tsx` | Gerenciador de subcategorias de patrimônios |

---

### Alterações em Financial.tsx

#### 1. Remover Import
```tsx
// Remover esta linha:
import { AssetManager } from "@/components/financial/AssetManager";
```

#### 2. Atualizar Grid de Tabs (de 8 para 7 colunas)
```tsx
// Antes:
<TabsList className="grid w-full grid-cols-8 max-w-4xl">

// Depois:
<TabsList className="grid w-full grid-cols-7 max-w-4xl">
```

#### 3. Remover TabTrigger de Patrimônios
```tsx
// Remover esta linha:
<TabsTrigger value="assets">🏛️ Patrimônios</TabsTrigger>
```

#### 4. Remover TabContent de Patrimônios
```tsx
// Remover este bloco:
<TabsContent value="assets" className="mt-6">
  <AssetManager />
</TabsContent>
```

---

### Resultado Visual

```text
ANTES (8 abas):
┌────────┬─────────┬──────────┬────────────┬─────────┬─────────────┬────────────┬──────────────┐
│ Resumo │ Receitas│ Despesas │ Empréstimos│ Cartões │ Patrimônios │ Categorias │ Por Categoria│
└────────┴─────────┴──────────┴────────────┴─────────┴─────────────┴────────────┴──────────────┘

DEPOIS (7 abas):
┌────────┬─────────┬──────────┬────────────┬─────────┬────────────┬──────────────┐
│ Resumo │ Receitas│ Despesas │ Empréstimos│ Cartões │ Categorias │ Por Categoria│
└────────┴─────────┴──────────┴────────────┴─────────┴────────────┴──────────────┘
```

---

### Nota sobre Dados

As tabelas no banco de dados relacionadas a patrimônios (`assets`, `asset_categories`) podem ser mantidas caso você queira reativar esta funcionalidade no futuro, ou podem ser removidas posteriormente se preferir.

