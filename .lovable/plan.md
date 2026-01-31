

## Plano: Alterar "Franquia" para "Unidade" na Gestão de Estoque

### Contexto

Conforme a preferência do sistema por utilizar "Unidade" em vez de "Franquia", os labels nos formulários e exibições da página de Estoque precisam ser atualizados.

### Arquivos a Modificar

| Arquivo | Localização | Alteração |
|---------|-------------|-----------|
| `src/pages/admin/Stock.tsx` | Linha 224 | Mensagem de erro "Preencha nome, valor e franquia" |
| `src/pages/admin/Stock.tsx` | Linha 300 | Mensagem "Apenas a franqueadora pode mover equipamentos entre franquias" |
| `src/pages/admin/Stock.tsx` | Linha 1174 | Label "Franquia *" no modal de novo equipamento |
| `src/pages/admin/Stock.tsx` | Linha 1270 | Label "Franquia" no modal de edição |
| `src/components/inventory/KanbanBoard.tsx` | Linha 72 | Label "Franquia:" na exibição do card |
| `src/components/inventory/DeletedEquipmentTable.tsx` | Linha 73 | Label "Franquia:" na tabela de excluídos |

---

### Alterações Detalhadas

#### 1. Stock.tsx - Mensagem de erro (linha 224)
```typescript
// ANTES
toast.error("Preencha nome, valor e franquia");

// DEPOIS
toast.error("Preencha nome, valor e unidade");
```

#### 2. Stock.tsx - Mensagem de erro (linha 300)
```typescript
// ANTES
toast.error("Apenas a franqueadora pode mover equipamentos entre franquias");

// DEPOIS
toast.error("Apenas a franqueadora pode mover equipamentos entre unidades");
```

#### 3. Stock.tsx - Label no modal de novo equipamento (linha 1174)
```typescript
// ANTES
<Label>Franquia *</Label>

// DEPOIS
<Label>Unidade *</Label>
```

#### 4. Stock.tsx - Label no modal de edição (linha 1270)
```typescript
// ANTES
<Label>Franquia</Label>

// DEPOIS
<Label>Unidade</Label>
```

#### 5. KanbanBoard.tsx - Label no card (linha 72)
```typescript
// ANTES
<span className="text-muted-foreground">Franquia:</span>

// DEPOIS
<span className="text-muted-foreground">Unidade:</span>
```

#### 6. DeletedEquipmentTable.tsx - Label na tabela (linha 73)
```typescript
// ANTES
<p className="text-muted-foreground">Franquia:</p>

// DEPOIS
<p className="text-muted-foreground">Unidade:</p>
```

---

### Resultado Esperado

Após as alterações:
- O modal de "Novo equipamento" mostrará "Unidade *" em vez de "Franquia *"
- O modal de edição mostrará "Unidade" em vez de "Franquia"
- Os cards de equipamento mostrarão "Unidade:" em vez de "Franquia:"
- A tabela de equipamentos excluídos mostrará "Unidade:" em vez de "Franquia:"
- As mensagens de erro usarão "unidade" em vez de "franquia"

