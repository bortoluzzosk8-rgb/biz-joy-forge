

## Alterar o título padrão do catálogo para "Título Principal"

### Problema
Quando um novo usuário é criado, o campo "Título Principal" do catálogo usa o valor padrão errado (atualmente "Catálogo ENGBRINK" no banco de dados). O usuário quer que o padrão seja "Título Principal".

### Alterações

**1. Migration SQL** — Alterar o valor padrão da coluna `catalog_header_title` na tabela `settings`:
```sql
ALTER TABLE public.settings 
  ALTER COLUMN catalog_header_title SET DEFAULT 'Título Principal';
```

**2. `src/pages/admin/Settings.tsx`** — Trocar o fallback de `"Catálogo"` para `"Título Principal"` na inicialização e no fetch, e atualizar o placeholder do input.

**3. `src/hooks/useSettings.tsx`** — Trocar os fallbacks de `catalogHeaderTitle` de `'Catálogo'` para `'Título Principal'`.

**4. `src/pages/PublicCatalog.tsx`** — Trocar o fallback de `"Catálogo"` para `"Título Principal"`.

