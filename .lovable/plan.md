

## Correção: campo "Qtd Monitores" não permite valor 0

O `min="1"` e o fallback `|| 1` no onChange impedem o usuário de limpar o campo ou colocar 0.

### Alteração

**`src/pages/admin/Sales.tsx` (linha 2657-2659)**
- Mudar `min="1"` para `min="0"`
- Mudar o fallback de `parseInt(e.target.value) || 1` para `parseInt(e.target.value) || 0`, e permitir string vazia no campo usando o valor direto do input quando vazio

```typescript
// De:
min="1"
value={currentMonitoringSlot.monitors_quantity}
onChange={(e) => setCurrentMonitoringSlot({ ...currentMonitoringSlot, monitors_quantity: parseInt(e.target.value) || 1 })}

// Para:
min="0"
value={currentMonitoringSlot.monitors_quantity}
onChange={(e) => setCurrentMonitoringSlot({ ...currentMonitoringSlot, monitors_quantity: e.target.value === "" ? 0 : parseInt(e.target.value) || 0 })}
```

