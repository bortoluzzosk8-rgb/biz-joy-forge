

## Remover seletor de tipo de locação e usar horários de início/retirada com buffer de 1h

### O que muda
O campo "Tipo de Locação" (Diária / 4 Horas) será removido. A lógica passa a ser baseada nos horários: se o usuário informar horário de início e horário de retirada, o sistema calcula a duração automaticamente e aplica 1h de intervalo após a retirada para verificar disponibilidade. O usuário pode alugar por quantas horas quiser.

### Alterações

**1. Migration SQL** — Atualizar `check_item_availability`:
- Remover parâmetro `p_rental_type`
- A lógica de conflito passa a usar `party_start_time` (início) e `return_time` (retirada) + 1h de buffer
- Se ambas as locações no mesmo dia possuem horários, verificar sobreposição: `(novo_inicio, novo_retirada)` OVERLAPS `(existente_inicio, existente_retirada + 1h)`
- Se não há horários definidos, conflito por data como antes (dia inteiro)
- Coluna `rental_type` permanece na tabela (sem breaking change), mas deixa de ser usada

**2. `src/pages/admin/Sales.tsx`** — Formulário:
- Remover o bloco do Select "Tipo de Locação" (linhas ~2310-2339)
- Sempre mostrar Data de Retirada e Horário de Retirada (remover condicionais `rental_type !== '4horas'`)
- Remover validação obrigatória de `party_start_time` vinculada a `rental_type === '4horas'`
- Quando ambos horários preenchidos no mesmo dia, mostrar info "Disponível novamente às: [retirada + 1h]"
- Remover `p_rental_type` da chamada ao `check_item_availability`
- Default `rental_type` para `'diaria'` silenciosamente (compatibilidade)

**3. `src/pages/admin/Sales.tsx`** — Tabela:
- Remover coluna "Tipo" com badges (📅 Diária / ⏱️ 4h) e o header correspondente

**4. `src/components/sales/SendWhatsAppModal.tsx`** — WhatsApp:
- Remover lógica de `rental_type === '4horas'`
- Se houver `return_time`, mostrar na mensagem: "Data: 12/03 às 08:00 até 12:00 (retirada)"
- Lógica genérica baseada nos horários reais

**5. `src/lib/documentHelpers.ts` e `src/pages/PublicContract.tsx`** — Contrato:
- Remover referências a `isRental4h` / `rentalEndTime` fixo de 4h
- Se houver `return_time`, mostrar horário de retirada no contrato

### Lógica de disponibilidade (SQL)
```text
Mesmo dia + ambos com horários:
  conflito se (novo_inicio, novo_retirada) OVERLAPS (existente_inicio, existente_retirada + 1h)

Dias diferentes ou sem horários:
  conflito se datas se sobrepõem (comportamento atual)
```

