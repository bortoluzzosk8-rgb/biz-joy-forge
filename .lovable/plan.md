
## Plano: Corrigir Página de Leads do Super Admin

O problema é que a página de Leads está buscando dados da tabela `clients` (clientes que alugam brinquedos), mas para o **Super Admin**, os leads são as **franqueadoras que se cadastraram no SaaS** (tabela `franchises`).

---

### Situacao Atual

| Fonte Atual | O Que Mostra |
|-------------|--------------|
| `clients` (vazia) | Nada - tabela vazia |

### Fonte Correta

| Fonte Correta | O Que Mostra |
|---------------|--------------|
| `franchises` WHERE `parent_franchise_id IS NULL` | Clientes SaaS (Oompa Brink, etc.) |

---

### Dados Atuais das Franqueadoras

| Nome | Email | Telefone | Status |
|------|-------|----------|--------|
| Franquia de Oompa Brink | oompabrink01@gmail.com | (vazio) | active |
| Franquia Principal | bortoluzzosk8@gmail.com | (vazio) | active |

---

### O Que Sera Mudado

#### 1. Modificar a Pagina de Leads para Super Admin

A pagina `src/pages/admin/Leads.tsx` sera atualizada para:

- Buscar de `franchises` (com `parent_franchise_id IS NULL`) em vez de `clients`
- Mostrar email, telefone, cidade de cada franqueadora
- Adicionar botao de WhatsApp (usando telefone da franquia)
- Manter os filtros de temperatura adaptados para status do SaaS
- Mostrar data de cadastro e ultimo acesso

#### 2. Adicionar Colunas Faltantes na Franquia

A tabela `franchises` ja tem `email` e `phone`, mas o telefone esta vazio. A edge function `assign-franqueadora-role` sera atualizada para salvar o telefone do usuario ao criar a franquia.

#### 3. Nova Estrutura da Lista de Leads

Cada lead mostrara:
- Nome da franquia
- Email
- Telefone (com botao WhatsApp)
- Cidade
- Data de cadastro
- Status (ativo, inativo)
- Indicadores de atividade

---

### Secao Tecnica

#### Modificacao no Leads.tsx

```typescript
// ANTES: Busca de clients (errado)
const { data } = await supabase
  .from("clients")
  .select("*")
  .order("last_access", { ascending: false });

// DEPOIS: Busca de franchises (clientes SaaS)
const { data } = await supabase
  .from("franchises")
  .select("*")
  .is("parent_franchise_id", null)
  .order("created_at", { ascending: false });
```

#### Novo tipo Lead para Super Admin

```typescript
type SaasLead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  city: string;
  status: string;
  created_at: string;
  updated_at: string;
};
```

#### Atualizar Edge Function para Salvar Telefone

Na edge function `assign-franqueadora-role`:
```typescript
const { data: franchise } = await supabaseAdmin
  .from('franchises')
  .insert({
    name: `Franquia de ${name}`,
    email: email,
    phone: phone, // Salvar telefone do usuario
    city: 'A definir',
    status: 'active',
    parent_franchise_id: null
  })
```

---

### Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/admin/Leads.tsx` | Buscar de `franchises` em vez de `clients` |
| `supabase/functions/assign-franqueadora-role/index.ts` | Salvar telefone ao criar franquia |

---

### Resultado Final

A pagina de Leads do Super Admin mostrara:
- Todos os clientes SaaS (franqueadoras cadastradas)
- Email e telefone de cada um para contato
- Botao para abrir WhatsApp diretamente
- Filtros por status (ativo, inativo, etc.)
- Busca por nome, email ou telefone
