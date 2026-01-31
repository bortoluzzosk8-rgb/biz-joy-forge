

## Plano: Adicionar Coluna "Festas" na Lista de Monitores

### Objetivo

Exibir na tabela de monitores cadastrados a quantidade de festas/locações em que cada monitor participou, funcionando como um ranking de participação.

---

### Como Funciona a Relação

```text
┌─────────────┐         ┌────────────────────────┐         ┌─────────┐
│   monitors  │────────▶│  sale_monitoring_slots │◀────────│  sales  │
└─────────────┘         └────────────────────────┘         └─────────┘
       │                          │                              │
   monitor_id              monitor_id + sale_id              locações
```

- Quando uma locação é criada e um monitor é selecionado, ele é registrado na tabela `sale_monitoring_slots`
- Contando os registros por `monitor_id`, obtemos quantas festas cada monitor participou

---

### Arquivo a Modificar

`src/pages/admin/Monitors.tsx`

---

### Alterações Detalhadas

#### 1. Adicionar Estado para Contagem de Festas

```tsx
// Novo estado para armazenar contagem de festas por monitor
const [monitorPartyCounts, setMonitorPartyCounts] = useState<Record<string, number>>({});
```

#### 2. Buscar Contagem de Festas na Função `fetchData`

```tsx
// Dentro de fetchData(), após buscar monitores:
// Buscar contagem de festas por monitor
const { data: partyCountsData, error: partyCountsError } = await supabase
  .from("sale_monitoring_slots")
  .select("monitor_id");

if (!partyCountsError && partyCountsData) {
  // Contar ocorrências por monitor_id
  const counts: Record<string, number> = {};
  partyCountsData.forEach(slot => {
    if (slot.monitor_id) {
      counts[slot.monitor_id] = (counts[slot.monitor_id] || 0) + 1;
    }
  });
  setMonitorPartyCounts(counts);
}
```

#### 3. Adicionar Coluna no Cabeçalho da Tabela

```tsx
// Antes da coluna "Unidade" (linha ~395):
<TableHead>Festas</TableHead>
```

#### 4. Adicionar Célula na Linha do Monitor

```tsx
// Antes da célula de Unidade (linha ~433):
<TableCell>
  <div className="flex items-center gap-2">
    <span className="font-semibold text-primary">
      {monitorPartyCounts[monitor.id] || 0}
    </span>
  </div>
</TableCell>
```

---

### Layout Visual da Tabela

```text
┌─────────┬────────────┬──────────┬─────────────┬────────┬──────────────────────┬────────┐
│  Nome   │  Telefone  │ Endereço │ Observações │ Festas │       Unidade        │ Ações  │
├─────────┼────────────┼──────────┼─────────────┼────────┼──────────────────────┼────────┤
│ 👤 Gui  │ 📞 1111... │ 📍 1111  │     -       │   10   │ 🏢 PLAY GESTOR-CEDRAL│ ✏️ 🗑️  │
│ 👤 Ana  │ 📞 2222... │ 📍 ...   │     -       │   8    │ 🏢 PLAY GESTOR-SP    │ ✏️ 🗑️  │
│ 👤 João │ 📞 3333... │ 📍 ...   │     -       │   3    │ 🏢 PLAY GESTOR-RJ    │ ✏️ 🗑️  │
└─────────┴────────────┴──────────┴─────────────┴────────┴──────────────────────┴────────┘
```

---

### Resultado Esperado

- Nova coluna "Festas" exibindo a quantidade de vezes que cada monitor foi utilizado em locações
- Atualização automática conforme novas locações são criadas com monitores
- Valor 0 exibido para monitores que ainda não participaram de nenhuma festa
- Possibilidade futura de ordenar por esta coluna para criar um ranking

