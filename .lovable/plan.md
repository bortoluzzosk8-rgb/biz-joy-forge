

## Adicionar opção de locação por 4 horas com intervalo de 1 hora

### Contexto
Atualmente o sistema só permite locação diária (o item fica indisponível o dia todo). O usuário quer a opção de alugar por **4 horas**, com **1 hora de intervalo** entre locações, permitindo múltiplas locações no mesmo dia.

Exemplo: Futebol de Sabão alugado das 08:00 às 12:00 → disponível novamente às 13:00.

### Alterações

**1. Migration SQL** — Adicionar coluna `rental_type` na tabela `sales` e atualizar a função `check_item_availability`:

```sql
-- Novo campo: tipo de locação
ALTER TABLE public.sales 
  ADD COLUMN rental_type text NOT NULL DEFAULT 'diaria';

-- Atualizar função de disponibilidade para considerar horários quando rental_type = '4horas'
```

A função `check_item_availability` será reescrita para:
- Receber `p_rental_type` e `p_party_end_time` (horário fim = início + 4h)
- Se ambas as locações são diárias: conflito por sobreposição de datas (como hoje)
- Se pelo menos uma é de 4 horas: verificar sobreposição de horários com 1h de buffer no mesmo dia
- Locação diária bloqueia o dia inteiro; locação de 4h só bloqueia o slot de 5h (4h + 1h intervalo)

**2. `src/pages/admin/Sales.tsx`** — Formulário:
- Adicionar campo `rental_type` ao `formData` (select: "Diária" ou "4 Horas")
- Quando "4 Horas" selecionado: tornar `party_start_time` obrigatório e calcular automaticamente o horário de término (início + 4h)
- Mostrar horário de término calculado como informativo
- Passar `rental_type` no save e no `check_item_availability`
- Adicionar `rental_type` ao tipo `Sale`

**3. Função SQL `check_item_availability`** — Lógica de conflito atualizada:
```text
Para cada locação existente no mesmo item:
  - Se a nova OU existente é 'diaria':
      → Conflito se as datas se sobrepõem (comportamento atual)
  - Se AMBAS são '4horas' E no mesmo dia:
      → Conflito se os horários (com +1h buffer) se sobrepõem
      → Ex: existente 08:00-12:00 → bloqueia até 13:00
            nova 13:00-17:00 → OK (sem conflito)
            nova 12:30-16:30 → CONFLITO (dentro do buffer)
```

**4. Exibição na lista** — Mostrar o tipo de locação na tabela de vendas para diferenciar visualmente.

