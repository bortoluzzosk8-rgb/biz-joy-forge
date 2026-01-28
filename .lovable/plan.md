

## Plano: Renomear Label do Campo de Unidade

### Alteração

Remover a palavra "Franquia" do label do campo de seleção de unidade no formulário de Nova Locação.

| De | Para |
|----|------|
| Unidade/Franquia que vai Atender * | Unidade que vai Atender * |

---

### Arquivo a Modificar

**`src/pages/admin/Sales.tsx`** - Linha 2075

```typescript
// ANTES
<Label htmlFor="franchise_id">Unidade/Franquia que vai Atender *</Label>

// DEPOIS
<Label htmlFor="franchise_id">Unidade que vai Atender *</Label>
```

