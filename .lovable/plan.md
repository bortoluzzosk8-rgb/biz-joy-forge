

## Plano: Validar Horário de Retirada vs Horário da Festa

### Problema Identificado

Quando a data de retirada é igual à data da festa, o sistema permite que o horário de retirada seja antes do horário de início da festa.

| Campo | Valor no Screenshot |
|-------|---------------------|
| Data da Festa | 28/01/2026 |
| Data de Retirada | 28/01/2026 (mesmo dia) |
| Horário Início Festa | 08:00 |
| Horário Retirada | 07:00 |

Isso é impossível - não se pode retirar os equipamentos antes da festa começar.

---

### Solução Proposta

Implementar validação em dois pontos:

1. **Validação em tempo real** - Ao alterar o horário de retirada, verificar e mostrar alerta visual
2. **Validação no submit** - Bloquear o salvamento se a regra for violada

---

### Regra de Negócio

```text
SE data_retirada == data_festa
  E horario_retirada está preenchido
  E horario_inicio_festa está preenchido
  ENTÃO horario_retirada DEVE SER >= horario_inicio_festa
```

---

### Alterações de Código

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/Sales.tsx` | Adicionar validação no `handleSubmit` |
| `src/pages/admin/Sales.tsx` | Adicionar alerta visual no campo de horário de retirada |

---

### Detalhes Técnicos

**1. Validação no handleSubmit (antes de salvar):**

Adicionar após as validações existentes (~linha 1097):

```typescript
// Validar horário de retirada quando no mesmo dia da festa
if (formData.rental_start_date && formData.return_date && 
    formData.rental_start_date === formData.return_date &&
    formData.party_start_time && formData.return_time) {
  if (formData.return_time < formData.party_start_time) {
    toast.error("O horário de retirada não pode ser antes do horário de início da festa quando são no mesmo dia");
    setIsSubmitting(false);
    return;
  }
}
```

**2. Alerta visual no formulário:**

Adicionar um Card de aviso abaixo dos campos de horário quando a condição for violada:

```typescript
{formData.rental_start_date === formData.return_date && 
 formData.party_start_time && formData.return_time && 
 formData.return_time < formData.party_start_time && (
  <Card className="p-3 bg-red-50 dark:bg-red-950/20 border-red-200 mt-4">
    <p className="text-sm text-red-900 dark:text-red-100">
      ⚠️ O horário de retirada não pode ser anterior ao horário de início da festa no mesmo dia!
    </p>
  </Card>
)}
```

---

### Resultado Esperado

- Se o usuário tentar colocar horário de retirada antes do horário da festa (no mesmo dia):
  - Verá um aviso vermelho imediatamente no formulário
  - Não conseguirá salvar a locação até corrigir
  - Receberá mensagem de erro clara explicando o problema

