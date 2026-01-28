
## Plano: Corrigir Redirecionamento do Dashboard (Incluir Sub-rotas)

### Diagnóstico

O redirecionamento atual só funciona para `/admin/dashboard` exato, mas você está acessando `/admin/dashboard/rentals`.

| Rota Atual | Redirecionamento | Status |
|------------|------------------|--------|
| `/admin/dashboard` | `/admin/rentals` | Funciona |
| `/admin/dashboard/rentals` | - | **404** (não coberta) |
| `/admin/dashboard/qualquer-coisa` | - | **404** (não coberta) |

### Solução

Usar um padrão de wildcard (`/*`) para capturar **todas** as sub-rotas do dashboard.

---

### Arquivo a Modificar

| Arquivo | Acao |
|---------|------|
| `src/App.tsx` | Alterar rota de redirecionamento |

---

### Alteracao

```typescript
// ANTES (linha 91)
<Route path="dashboard" element={<Navigate to="rentals" replace />} />

// DEPOIS
<Route path="dashboard/*" element={<Navigate to="/admin/rentals" replace />} />
```

**Mudancas:**
1. `dashboard` → `dashboard/*` - captura todas as sub-rotas
2. `"rentals"` → `"/admin/rentals"` - caminho absoluto para garantir redirecionamento correto

---

### Resultado

Todas estas rotas serao redirecionadas para `/admin/rentals`:
- `/admin/dashboard`
- `/admin/dashboard/rentals`
- `/admin/dashboard/qualquer-coisa`
