
## Plano: Isolar Dados Entre Clientes SaaS

O problema é que cada pessoa que se cadastra pela landing page é um **cliente SaaS separado**, mas atualmente todos os dados estão misturados. A franqueadora "Oompa Brink" não deveria aparecer no painel do Bortoluzzo.

---

### Arquitetura Correta

```text
┌────────────────────────────────────────────────────────────────┐
│                        SUPER ADMIN                             │
│    (bortoluzzosk8@gmail.com - você, dono do SaaS)             │
│                                                                │
│    Dashboard SaaS: vê TODOS os clientes que pagam             │
│    - Lista de franqueadoras cadastradas                       │
│    - Métricas do sistema SaaS                                  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────┐  ┌────────────────────────────┐
│   CLIENTE SAAS 1           │  │   CLIENTE SAAS 2           │
│   Oompa Brink              │  │   Outro Cliente            │
│                            │  │                            │
│   Suas unidades:           │  │   Suas unidades:           │
│   - Curitiba               │  │   - São Paulo              │
│   - Londrina               │  │   - Rio de Janeiro         │
│                            │  │                            │
│   (não vê nada do outro)   │  │   (não vê nada do outro)   │
└────────────────────────────┘  └────────────────────────────┘
```

---

### O Que Precisa Mudar

#### 1. Identificar a "Franquia Raiz" do Usuário

Quando um usuário franqueadora se cadastra, a franquia criada automaticamente é a **franquia principal** dele. Qualquer outra franquia que ele criar são unidades **filhas** dessa franquia raiz.

Adicionar coluna `parent_franchise_id` na tabela `franchises`:
- Se `NULL` → é uma franquia raiz (cliente SaaS principal)
- Se preenchido → é uma unidade filha

---

#### 2. Modificar a Página de Franquias

Atualmente:
```typescript
// Busca TODAS as franquias - ERRADO!
const { data } = await supabase
  .from("franchises")
  .select("*")
```

Correto:
```typescript
// Busca apenas as franquias do usuário logado
const { data: userFranchiseData } = await supabase
  .from("user_franchises")
  .select("franchise_id")
  .eq("user_id", userId)
  .single();

// Busca a franquia raiz do usuário
const rootFranchiseId = userFranchiseData?.franchise_id;

// Busca unidades filhas dessa franquia raiz
const { data } = await supabase
  .from("franchises")
  .select("*")
  .or(`id.eq.${rootFranchiseId},parent_franchise_id.eq.${rootFranchiseId}`)
```

---

#### 3. Separar Dashboard SaaS do Painel Normal

| Página | Quem Vê | O Que Mostra |
|--------|---------|--------------|
| Dashboard SaaS | Apenas super_admin | Todos os clientes SaaS (franqueadoras) |
| Gestão de Unidades | Franqueadora | Apenas suas próprias unidades |
| Dashboard da Franquia | Franqueadora | Dados da sua franquia |

---

#### 4. Remover Franquias "Fantasma"

A "Franquia Principal" do bortoluzzosk8 foi criada automaticamente, mas se você é o super admin do SaaS, talvez não precise aparecer como uma franquia na lista.

Opções:
- **A)** Remover a franquia do super admin (ele só gerencia o SaaS, não é um cliente)
- **B)** Manter, mas não mostrar na lista de franquias se `parent_franchise_id IS NULL`

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| Migração SQL | Adicionar coluna `parent_franchise_id` em `franchises` |
| `src/pages/admin/Franchises.tsx` | Filtrar franquias pelo usuário logado |
| `src/pages/admin/SuperAdminDashboard.tsx` | Mostrar apenas clientes SaaS (franqueadoras) |
| Edge Function `assign-franqueadora-role` | Marcar franquia criada como "raiz" |

---

### Resultado Final

Após implementar:
- Cada franqueadora vê **apenas suas próprias unidades**
- O Dashboard SaaS mostra a **lista de clientes pagantes**
- A franquia da "Oompa Brink" **não aparece** no painel do Bortoluzzo
- Cada cliente SaaS tem um sistema **completamente isolado**

---

### Seção Técnica

#### Migração SQL
```sql
-- Adicionar coluna para identificar franquia pai
ALTER TABLE franchises 
ADD COLUMN parent_franchise_id UUID REFERENCES franchises(id);

-- Índice para performance
CREATE INDEX idx_franchises_parent ON franchises(parent_franchise_id);
```

#### Modificação no Franchises.tsx
```typescript
const fetchFranchises = async () => {
  // Buscar a franquia do usuário logado
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: userFranchise } = await supabase
    .from("user_franchises")
    .select("franchise_id")
    .eq("user_id", user?.id)
    .single();

  const rootFranchiseId = userFranchise?.franchise_id;

  // Buscar apenas unidades dessa franquia
  const { data, error } = await supabase
    .from("franchises")
    .select("*")
    .or(`id.eq.${rootFranchiseId},parent_franchise_id.eq.${rootFranchiseId}`)
    .order("name");

  setFranchises(data || []);
};
```

#### Nova lógica na Edge Function
```typescript
// Ao criar franquia para novo usuário SaaS
const { data: franchise } = await supabaseAdmin
  .from('franchises')
  .insert({
    name: `Franquia de ${name}`,
    email: email,
    phone: phone,
    city: 'A definir',
    status: 'active',
    parent_franchise_id: null // É uma franquia RAIZ
  })
  .select()
  .single();
```

#### Quando franqueadora cria nova unidade
```typescript
// Criar unidade filha
await supabase.from("franchises").insert({
  ...franchiseData,
  parent_franchise_id: rootFranchiseId // Vincula à franquia raiz
});
```
