

## Problema e Solução

A página de Leads SaaS busca da tabela `franchises` (29 registros), mas muitas dessas franquias não têm usuários reais vinculados (só 5 no banco de autenticação). Além disso, faltam funcionalidades de bloqueio de acesso e registro de pagamento.

### Mudanças Propostas

**1. Filtrar leads para mostrar apenas franquias com usuários reais**

Na `fetchSaasLeads`, fazer JOIN com `user_franchises` para trazer apenas franquias que têm pelo menos um usuário vinculado. Também trazer os dados de assinatura (`subscription_status`, `subscription_plan`, `trial_ends_at`) para exibir na listagem.

**2. Adicionar botão de Bloquear/Desbloquear acesso**

Em cada lead, adicionar um botão que altera o `subscription_status` da franquia entre `active` e `blocked`. Quando bloqueado, o `ProtectedRoute` já redireciona para `/assinatura`, então basta atualizar o campo no banco.

**3. Adicionar funcionalidade de registrar pagamento de mensalidade**

Criar um drawer/modal inline que permite ao Super Admin inserir um pagamento na tabela `subscription_payments` para a franquia selecionada. Campos: valor, data de vencimento, tipo de cobrança (pix/cartão), status (pending/paid). Ao marcar como pago, atualizar o `subscription_status` da franquia para `active` e definir o `subscription_expires_at`.

### Detalhes Técnicos

**RLS**: A tabela `subscription_payments` já tem política para `super_admin`. Precisamos adicionar uma policy para o Super Admin poder fazer UPDATE na tabela `franchises` nos campos de assinatura (já existe via `has_role('franqueadora')`, mas precisamos de uma para `super_admin`).

**Nova migration SQL**:
```sql
CREATE POLICY "Super admin can manage all franchises"
ON public.franchises FOR ALL TO authenticated
USING (has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role));
```

**Leads.tsx (Super Admin view)** — Mudanças principais:
- Query passa a fazer join: buscar franquias que existem em `user_franchises`
- Mostrar `subscription_status` (trial, active, blocked, expired) em cada card
- Botão de bloqueio/desbloqueio com toggle
- Botão "Registrar Pagamento" que abre um drawer com formulário simples
- Ao salvar pagamento: inserir em `subscription_payments` e atualizar `franchises.subscription_status` e `subscription_expires_at`

**Componente de pagamento inline** — Drawer com:
- Valor (R$)
- Data de vencimento
- Tipo: Pix ou Cartão
- Status: Pendente ou Pago
- Botão salvar

