
## Plano: Corrigir Delay na Exibição de Disponibilidade de Estoque

### Problema Identificado

Quando o usuário seleciona um produto na página de locação, a mensagem "Nenhum item disponível no estoque" aparece incorretamente durante o período em que a verificação de disponibilidade está sendo carregada.

| Momento | O que acontece | Resultado |
|---------|----------------|-----------|
| Usuário seleciona produto | `currentItem.product_id` é setado imediatamente | - |
| Durante o carregamento | `availableInventory.length === 0` | Condição da mensagem de erro é verdadeira |
| Mensagem de erro aparece | "Nenhum item disponível no estoque" | Experiência ruim para o usuário |
| Carregamento finaliza | `availableInventory` é populado | Mensagem some e itens aparecem |

---

### Solucao Proposta

Adicionar um estado de "loading" especifico para a verificacao de disponibilidade do inventario. A mensagem de erro so sera exibida quando:
- O carregamento estiver completo (`checkingInventory === false`)
- E realmente nao houver itens disponiveis (`availableInventory.length === 0`)

Durante o carregamento, sera exibido um indicador visual (spinner) informando ao usuario que a disponibilidade esta sendo verificada.

---

### Alteracoes Tecnicas

#### 1. Adicionar novo estado `checkingInventory` (linha ~172)

```tsx
const [checkingInventory, setCheckingInventory] = useState(false);
```

#### 2. Atualizar funcao `checkInventoryAvailability` (linhas 748-828)

```tsx
const checkInventoryAvailability = async (productName: string, franchiseId: string) => {
  if (!productName || !franchiseId || !formData.rental_start_date || !formData.return_date) {
    setAvailableInventory([]);
    return;
  }

  setCheckingInventory(true); // <-- Adicionar

  try {
    // ... logica existente ...
    setAvailableInventory(sorted);
  } catch (error) {
    console.error("Error checking inventory:", error);
    setAvailableInventory([]);
  } finally {
    setCheckingInventory(false); // <-- Adicionar
  }
};
```

#### 3. Adicionar indicador de carregamento (antes da linha 2514)

```tsx
{currentItem.product_id && checkingInventory && (
  <Card className="p-3 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
    <div className="flex items-center gap-2">
      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
      <p className="text-sm text-blue-900 dark:text-blue-100">
        Verificando disponibilidade...
      </p>
    </div>
  </Card>
)}
```

#### 4. Atualizar condicao da mensagem de erro (linha 2514)

```tsx
// Antes:
{currentItem.product_id && availableInventory.length === 0 && formData.rental_start_date && formData.return_date && (

// Depois:
{currentItem.product_id && !checkingInventory && availableInventory.length === 0 && formData.rental_start_date && formData.return_date && (
```

#### 5. Resetar estado de loading ao limpar produto (linha ~2102)

Garantir que `setCheckingInventory(false)` seja chamado junto com `setAvailableInventory([])` quando o produto for limpo.

---

### Fluxo Apos a Correcao

| Momento | Estado | UI |
|---------|--------|-----|
| Produto selecionado | `checkingInventory = true` | Spinner: "Verificando disponibilidade..." |
| Carregamento finaliza | `checkingInventory = false` | Itens disponiveis OU mensagem de erro |

---

### Arquivo a Modificar

| Arquivo | Alteracoes |
|---------|------------|
| `src/pages/admin/Sales.tsx` | Adicionar estado, atualizar funcao e condicoes de renderizacao |

---

### Resultado Esperado

- Usuario nunca vera a mensagem de erro enquanto o sistema estiver carregando
- Um spinner amigavel aparecera durante a verificacao
- A mensagem de erro so aparecera quando realmente nao houver itens disponiveis
- Experiencia de usuario muito mais fluida e profissional
