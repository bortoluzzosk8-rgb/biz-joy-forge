

## Plano: Adicionar Botão "+" no Dropdown de Categorias (Produtos)

### Objetivo

Adicionar um botão "+" no final da lista de categorias do dropdown no formulário de Produtos, permitindo que o usuário seja redirecionado para a página de Categorias (`/admin/categories`) caso não encontre a categoria desejada.

---

### Visual Esperado

```
┌─────────────────────────────┐
│ Selecione uma categoria     │
├─────────────────────────────┤
│ 🎈 Infláveis                │
│ 🎠 Brinquedos               │
│ 🎪 Estruturas               │
├─────────────────────────────┤
│ + Cadastrar nova categoria  │  ← botão de navegação
└─────────────────────────────┘
```

---

### Alterações no Código

**Arquivo:** `src/pages/admin/Products.tsx`

#### 1. Adicionar imports necessários

```typescript
// Adicionar useNavigate
import { useNavigate } from "react-router-dom";

// Adicionar SelectSeparator ao import existente
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,  // <-- Novo
} from "@/components/ui/select";
```

#### 2. Criar hook de navegação (dentro do componente Products)

```typescript
const Products = () => {
  const navigate = useNavigate();
  // ... resto do código
```

#### 3. Atualizar o SelectContent do dropdown de categorias

Adicionar um separador e botão de navegação após a lista de categorias (linha ~481):

```typescript
<SelectContent>
  {loadingCategories ? (
    <SelectItem value="loading" disabled>Carregando...</SelectItem>
  ) : (
    categories.map((cat) => (
      <SelectItem key={cat.id} value={cat.id}>
        {cat.icon} {cat.name}
      </SelectItem>
    ))
  )}
  <SelectSeparator />
  <div 
    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-primary font-medium"
    onClick={(e) => {
      e.stopPropagation();
      navigate('/admin/categories');
    }}
  >
    <Plus className="absolute left-2 h-4 w-4" />
    Cadastrar nova categoria
  </div>
</SelectContent>
```

---

### Comportamento

1. Usuário abre o dropdown "Categoria"
2. Vê a lista de categorias existentes
3. Se não encontrar, clica em "+ Cadastrar nova categoria"
4. Usuário é redirecionado para `/admin/categories`
5. Após cadastrar, pode voltar à página de Produtos

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/Products.tsx` | Adicionar imports, hook navigate e botão no dropdown |

