

## Plano: Remover Campo "Recebido por" (Franqueadora/Franqueado)

### Contexto

O campo "Recebido por" com as opções "Franqueadora" e "Franqueado" não é mais necessário no sistema. Este campo existe na tabela `sale_payments` e aparece em dois componentes de pagamento.

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/admin/PaymentManager.tsx` | Remover campo do formulário de adicionar, editar e exibição |
| `src/components/admin/QuickPaymentDrawer.tsx` | Remover campo do formulário de adicionar |

---

### Alterações Detalhadas

#### 1. PaymentManager.tsx

**Remover do estado de novo pagamento (linha 99):**
```typescript
// ANTES
received_by: '' as 'franqueadora' | 'franqueado' | '',

// DEPOIS: remover esta linha
```

**Remover validação (linhas 147-150):**
```typescript
// ANTES
if (!newPayment.received_by) {
  toast.error('Selecione quem recebeu o pagamento');
  return;
}

// DEPOIS: remover este bloco
```

**Remover do objeto de inserção (linhas 165-167, 201-203):**
```typescript
// Remover a linha:
received_by: newPayment.received_by as 'franqueadora' | 'franqueado',
```

**Remover do reset do formulário (linha 181, 221):**
```typescript
// Remover:
received_by: '',
```

**Remover do estado de edição (linha 88, 440):**
```typescript
// Remover referências a received_by
```

**Remover do update no banco (linha 466):**
```typescript
// Remover:
received_by: editPayment.received_by,
```

**Remover o campo Select do formulário de adicionar (linhas 912-923):**
```typescript
// Remover todo o bloco <div> com Label "Recebido por *" e Select
```

**Remover exibição na lista de pagamentos (linhas 1003-1007):**
```typescript
// Remover o bloco que exibe "Recebido por: Franqueadora/Franqueado"
```

**Remover o campo Select do formulário de edição (linhas 1457-1468):**
```typescript
// Remover todo o bloco <div> com Label "Recebido por *" e Select
```

---

#### 2. QuickPaymentDrawer.tsx

**Remover do tipo Payment (linha 33):**
```typescript
// Remover:
received_by?: 'franqueadora' | 'franqueado';
```

**Remover do estado (linha 78):**
```typescript
// Remover:
received_by: '' as 'franqueadora' | 'franqueado' | '',
```

**Remover validação (linhas 118-121):**
```typescript
// Remover o bloco de validação de received_by
```

**Remover do insert (linha 137):**
```typescript
// Remover:
received_by: newPayment.received_by,
```

**Remover do reset (linha 156):**
```typescript
// Remover:
received_by: '',
```

**Remover o campo Select do formulário (linhas 401-415):**
```typescript
// Remover todo o bloco <div> com Label "Recebido por *" e Select
```

---

### Banco de Dados

A coluna `received_by` na tabela `sale_payments` será mantida para não quebrar dados históricos. Apenas a interface será simplificada.

---

### Resultado Esperado

- O campo "Recebido por" não aparecerá mais nos formulários de pagamento
- Os pagamentos serão salvos sem essa informação
- Dados históricos com `received_by` preenchido continuarão no banco, mas não serão exibidos

