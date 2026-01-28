

## Plano: Adicionar Botões "+" nos Dropdowns de Cliente e Unidade

### Objetivo

Adicionar botões "+" nos dropdowns de seleção de **Cliente** e **Unidade** na tela de Nova Locação, permitindo que o usuário seja redirecionado para as páginas de cadastro correspondentes quando não encontrar o item desejado.

---

### Situação Atual

O formulário "Nova Locação" possui:
- **Dropdown de Unidade**: Select padrão sem opção de cadastro
- **Dropdown de Cliente**: Combobox com busca, mostrando "Nenhum cliente encontrado" quando vazio

---

### Solução

Adicionar um botão "+ Cadastrar nova unidade" e "+ Cadastrar novo cliente" no final de cada lista, seguindo o mesmo padrão visual já implementado no Estoque para produtos.

**Visual esperado:**

```
┌─────────────────────────────┐
│ 🔍 Buscar cliente...        │
├─────────────────────────────┤
│ João Silva                  │
│ Maria Santos                │
├─────────────────────────────┤
│ + Cadastrar novo cliente    │  ← botão de navegação
└─────────────────────────────┘
```

---

### Alterações no Código

**Arquivo:** `src/pages/admin/Sales.tsx`

#### 1. Atualizar imports

```typescript
// Adicionar SelectSeparator ao import existente
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";

// Adicionar useNavigate
import { useNavigate } from "react-router-dom";
```

#### 2. Criar hook de navegação

```typescript
const Sales = () => {
  const navigate = useNavigate();
  // ... resto do código
```

#### 3. Adicionar botão no Dropdown de Unidade

Após a lista de franquias no SelectContent (linha ~2101), adicionar:

```typescript
<SelectContent>
  {franchises.map((franchise) => (
    <SelectItem key={franchise.id} value={franchise.id}>
      {franchise.name} - {franchise.city}
    </SelectItem>
  ))}
  <SelectSeparator />
  <div 
    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-primary font-medium"
    onClick={(e) => {
      e.stopPropagation();
      navigate('/admin/franchises');
    }}
  >
    <Plus className="absolute left-2 h-4 w-4" />
    Cadastrar nova unidade
  </div>
</SelectContent>
```

#### 4. Adicionar botão no Dropdown de Cliente

Dentro do CommandList, após o CommandGroup (linha ~2158), adicionar:

```typescript
<CommandList>
  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
  <CommandGroup>
    {clients.map((client) => (
      // ... itens existentes
    ))}
  </CommandGroup>
  
  {/* NOVO: Botão para cadastrar cliente */}
  <div className="border-t px-2 py-2">
    <div 
      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground text-primary font-medium"
      onClick={() => {
        setClientPopoverOpen(false);
        navigate('/admin/clients');
      }}
    >
      <Plus className="h-4 w-4" />
      Cadastrar novo cliente
    </div>
  </div>
</CommandList>
```

---

### Comportamento

| Dropdown | Botão | Navegação |
|----------|-------|-----------|
| Unidade/Franquia | + Cadastrar nova unidade | `/admin/franchises` |
| Cliente | + Cadastrar novo cliente | `/admin/clients` |

Ao clicar:
1. Dropdown/Popover fecha
2. Usuário é redirecionado para a página de cadastro
3. Após cadastrar, pode voltar à tela de Locações

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/Sales.tsx` | Adicionar imports, hook e botões nos dropdowns |

