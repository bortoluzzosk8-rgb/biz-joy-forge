

## Adicionar aba "Financeiro" na área Super Admin

### O que será feito

Adicionar uma nova aba "Financeiro" no menu do Super Admin (ao lado de "Leads SaaS" e "Clientes") com uma página que mostra:

- **Resumo financeiro**: Total de receitas (pagamentos recebidos), com cards de métricas
- **Lista de receitas**: Todos os pagamentos de `subscription_payments` com status "paid", mostrando nome da franquia, valor, data, tipo de cobrança
- **Filtros por período**: Mês atual, últimos 3 meses, últimos 6 meses, todos
- **Totalização**: Soma dos valores pagos no período filtrado

### Mudanças técnicas

**1. `src/pages/admin/AdminLayout.tsx`** — Adicionar item "Financeiro" no `superAdminMenuItems`:
```typescript
{ value: "saas-financial", label: "Financeiro", icon: DollarSign, roles: ["super_admin"] },
```

**2. `src/pages/admin/SaasFinancial.tsx`** (novo arquivo) — Página financeira do Super Admin:
- Busca `subscription_payments` com status "paid", fazendo join com `franchises` para exibir o nome
- Cards de resumo: total recebido no mês, total geral, quantidade de pagamentos
- Tabela com colunas: Franquia, Valor, Data Pagamento, Tipo, Vencimento
- Filtro de período (mês atual, 3 meses, 6 meses, todos)

**3. `src/App.tsx`** — Adicionar rota `/admin/saas-financial` apontando para o novo componente

**Sem mudanças no banco** — A tabela `subscription_payments` já tem RLS para `super_admin` e contém todos os dados necessários.

