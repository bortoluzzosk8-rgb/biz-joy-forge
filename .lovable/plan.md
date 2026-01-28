

## Plano: Adicionar Botão "+" no Dropdown de Produtos

### Objetivo

Adicionar um botão "+" no final da lista de produtos do dropdown, permitindo que o usuário seja redirecionado para a página de Produtos (`/admin/products`) caso não encontre o produto desejado.

---

### Situação Atual

O modal "Novo equipamento" possui um dropdown (`Select`) que lista todos os produtos cadastrados. Se o produto desejado não estiver na lista, o usuário precisa:
1. Fechar o modal
2. Navegar manualmente para a aba de Produtos
3. Cadastrar o produto
4. Voltar para o Estoque
5. Abrir o modal novamente

---

### Solução

Adicionar um item especial no final do dropdown com um ícone "+" que redireciona para `/admin/products`:

```
+---------------------------+
| Selecione o produto...    |
+---------------------------+
| Cama Elástica            |
| Piscina de Bolinhas      |
| Tobogã Inflável          |
+---------------------------+
| + Cadastrar novo produto  |  <-- NOVO
+---------------------------+
```

---

### Alterações no Código

**Arquivo:** `src/pages/admin/Stock.tsx`

#### 1. Importar `useNavigate` e ícone `Plus`

```typescript
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
```

#### 2. Criar hook de navegação

```typescript
const navigate = useNavigate();
```

#### 3. Adicionar item de "Cadastrar novo" no SelectContent

Dentro do dropdown de produtos, após listar os produtos existentes, adicionar um separador e um botão:

```typescript
<SelectContent>
  {products.map((p) => (
    <SelectItem key={p.id} value={p.name}>
      {p.name}
    </SelectItem>
  ))}
  <SelectSeparator />
  <div 
    className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-primary font-medium"
    onClick={(e) => {
      e.stopPropagation();
      setEquipModalOpen(false);
      navigate('/admin/products');
    }}
  >
    <Plus className="absolute left-2 h-4 w-4" />
    Cadastrar novo produto
  </div>
</SelectContent>
```

---

### Comportamento

1. Usuário abre o dropdown "Nome do Equipamento"
2. Vê a lista de produtos existentes
3. Se não encontrar, clica em "+ Cadastrar novo produto"
4. Modal fecha e usuário é redirecionado para `/admin/products`
5. Após cadastrar o produto, pode voltar ao Estoque e criar o equipamento

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/Stock.tsx` | Adicionar botão de cadastrar produto no dropdown |

---

### Opcional: Aplicar no modal de Edição também

O mesmo padrão pode ser aplicado no dropdown do modal de edição (linhas 1196-1200) para manter consistência.

---

### Resultado Visual

O dropdown terá um visual assim:

```
┌─────────────────────────────┐
│ Cama Elástica               │
│ Piscina de Bolinhas         │
│ Tobogã Inflável             │
├─────────────────────────────┤
│ + Cadastrar novo produto    │  ← destaque em cor primária
└─────────────────────────────┘
```

