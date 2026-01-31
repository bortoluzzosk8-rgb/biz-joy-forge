
## Plano: Isolar Configurações por Tenant (Settings Multi-Tenant)

### Problema Identificado

A tabela `settings` **não possui** coluna `franchise_id`, fazendo com que todas as franqueadoras compartilhem as mesmas configurações - incluindo o logo da empresa. Quando um usuário de outra conta acessa o sistema, ele vê o logo configurado por outro tenant (PlayGestor).

**Estado atual:**
```
settings (1 registro global)
├── logo_url: "https://...logo-1769874702434.png" (logo do PlayGestor)
├── company_name: "PlayGestor"
└── ... (compartilhado por todos)
```

---

### Solução

#### 1. Migração SQL - Adicionar `franchise_id` à Tabela Settings

```sql
-- Adicionar coluna franchise_id
ALTER TABLE public.settings 
ADD COLUMN franchise_id UUID REFERENCES public.franchises(id) ON DELETE CASCADE;

-- Criar índice para performance
CREATE INDEX idx_settings_franchise_id ON public.settings(franchise_id);

-- Garantir unicidade (cada franquia só pode ter 1 registro de settings)
ALTER TABLE public.settings 
ADD CONSTRAINT settings_franchise_unique UNIQUE (franchise_id);
```

#### 2. Atualizar Políticas RLS

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Admins and franqueadora can insert settings" ON settings;
DROP POLICY IF EXISTS "Admins and franqueadora can update settings" ON settings;
DROP POLICY IF EXISTS "Settings are viewable by everyone" ON settings;

-- Política SELECT: ver apenas settings da própria franquia
CREATE POLICY "Franqueadora can view own settings"
ON public.settings FOR SELECT TO authenticated
USING (belongs_to_user_tenant(franchise_id));

-- Política INSERT: inserir apenas para própria franquia
CREATE POLICY "Franqueadora can insert own settings"
ON public.settings FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'franqueadora'::app_role) 
  AND belongs_to_user_tenant(franchise_id)
);

-- Política UPDATE: atualizar apenas settings da própria franquia
CREATE POLICY "Franqueadora can update own settings"
ON public.settings FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'franqueadora'::app_role) 
  AND belongs_to_user_tenant(franchise_id)
)
WITH CHECK (
  has_role(auth.uid(), 'franqueadora'::app_role) 
  AND belongs_to_user_tenant(franchise_id)
);

-- Política pública para catálogo (filtrado por franchise_id do parâmetro)
CREATE POLICY "Public can view settings for catalog"
ON public.settings FOR SELECT TO anon
USING (true);
```

#### 3. Atualizar Hook useSettings

**Arquivo:** `src/hooks/useSettings.tsx`

Modificar para filtrar por `franchise_id` do usuário logado:

```tsx
// Antes
const { data } = await supabase
  .from('settings')
  .select('*')
  .limit(1)
  .maybeSingle();

// Depois
const { data: userData } = await supabase
  .from('user_franchises')
  .select('franchise_id')
  .single();

const { data } = await supabase
  .from('settings')
  .select('*')
  .eq('franchise_id', userData?.franchise_id)
  .maybeSingle();
```

#### 4. Atualizar Página Settings.tsx

**Arquivo:** `src/pages/admin/Settings.tsx`

- Ao carregar: filtrar por `franchise_id`
- Ao salvar: incluir `franchise_id` no insert/update

```tsx
// No fetchSettings
const { data, error } = await supabase
  .from("settings")
  .select("*")
  .eq("franchise_id", userFranchise?.id)
  .maybeSingle();

// No handleSave (insert)
const { data, error } = await supabase
  .from("settings")
  .insert({
    ...updateData,
    franchise_id: userFranchise?.id  // Adicionar franchise_id
  })
  .select()
  .single();
```

#### 5. Atualizar PublicCatalog.tsx

**Arquivo:** `src/pages/PublicCatalog.tsx`

Já recebe `franchiseId` como parâmetro da rota, então precisa filtrar:

```tsx
// Antes
const { data } = await supabase
  .from("settings")
  .select("*")
  .maybeSingle();

// Depois
const { data } = await supabase
  .from("settings")
  .select("*")
  .eq("franchise_id", franchiseId)
  .maybeSingle();
```

---

### Arquivos a Modificar

| Arquivo | Tipo de Mudança |
|---------|-----------------|
| **SQL Migration** | Adicionar `franchise_id`, RLS policies |
| `src/hooks/useSettings.tsx` | Filtrar por franchise_id do usuário |
| `src/pages/admin/Settings.tsx` | Carregar/salvar com franchise_id |
| `src/pages/PublicCatalog.tsx` | Filtrar por franchise_id da URL |
| `src/pages/Checkout.tsx` | Filtrar por franchise_id |
| `src/pages/PublicContract.tsx` | Filtrar por franchise_id |

---

### Resultado Esperado

| Cenário | Antes | Depois |
|---------|-------|--------|
| Nova conta | Vê logo do PlayGestor | Sem logo (campo vazio) |
| Configurar logo | Afeta todos os tenants | Afeta apenas própria franquia |
| Catálogo público | Mostra logo global | Mostra logo da franquia específica |

---

### Benefício Principal

Cada tenant terá suas **próprias configurações completamente isoladas**:
- Logo personalizado
- Cores do catálogo
- WhatsApp
- Dados da empresa
- Templates de documentos

Contas novas começarão **sem logo** até que o cliente faça upload do seu próprio.
