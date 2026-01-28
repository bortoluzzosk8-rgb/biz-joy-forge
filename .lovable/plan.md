

## Plano: Corrigir Dropdown de Unidades na Pagina de Estoque

### Problema Identificado

A pagina de Estoque (`Stock.tsx`) tem o mesmo problema que o grafico de vendas:

1. **Carrega TODAS as franquias** do banco de dados sem isolamento multi-tenant
2. **Exibe `city || name`** o que mostra "A definir" quando city = "A definir"

Isso acontece em varios lugares:
- Botoes de filtro por unidade (linha 975-984)
- Helper function `franchiseNameById` (linha 93-94)
- Select de franquia no modal de adicionar equipamento (linha 1172)
- Select de franquia no modal de editar equipamento (linha 1256)

### Solucao

Aplicar o mesmo padrao usado no `SalesChart.tsx`:

1. **Usar `useTenantFranchises`** para carregar apenas as franquias do tenant atual
2. **Criar helper `getFranchiseDisplayName`** para exibir o nome corretamente

---

### Alteracoes no Codigo

**Arquivo:** `src/pages/admin/Stock.tsx`

#### 1. Importar o hook

```typescript
import { useTenantFranchises } from "@/hooks/useTenantFranchises";
```

#### 2. Substituir o state e carregamento de franchises

Remover:
```typescript
const [franchises, setFranchises] = useState<Franchise[]>([]);
```

Adicionar:
```typescript
const { franchises } = useTenantFranchises();
```

#### 3. Criar helper function

```typescript
const getFranchiseDisplayName = (franchise: Franchise) => {
  return franchise.city && franchise.city !== "A definir" 
    ? franchise.city 
    : franchise.name;
};
```

#### 4. Atualizar o franchiseCityMap

```typescript
const franchiseCityMap = useMemo(() => 
  new Map(franchises.map((f) => [f.id, getFranchiseDisplayName(f)])), 
  [franchises]
);
```

#### 5. Atualizar exibicao nos botoes de filtro

```typescript
{franchises.map((f) => (
  <Button ...>
    {getFranchiseDisplayName(f)}
  </Button>
))}
```

#### 6. Atualizar exibicao nos selects dos modais

```typescript
{franchises.map((f) => (
  <SelectItem key={f.id} value={f.id}>
    {getFranchiseDisplayName(f)}
  </SelectItem>
))}
```

#### 7. Remover carregamento manual de franchises no loadData()

A secao que faz query de franchises na funcao `loadData()` deve ser removida, ja que o hook cuida disso.

---

### Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/admin/Stock.tsx` | Usar `useTenantFranchises` + corrigir exibicao |

---

### Resultado Esperado

**Antes:**
```
[A definir] [A definir] [A definir] [A definir] [A definir] [Todas]
```

**Depois:**
```
[Sua Unidade Principal] [Todas]
```

O usuario vera apenas sua unidade e suas sub-unidades, com os nomes corretos exibidos.

---

### Secao Tecnica

A migracao segue o mesmo padrao aplicado em `SalesChart.tsx`:

1. O hook `useTenantFranchises` ja implementa:
   - Busca a franchise_id do usuario logado via `user_franchises`
   - Carrega a franquia raiz E sub-unidades (`parent_franchise_id`)
   - Filtra apenas franquias ativas
   
2. O helper `getFranchiseDisplayName` prioriza:
   - `city` se existir e nao for "A definir"
   - `name` caso contrario

3. Todas as exibicoes de nome de franquia usarao este helper de forma consistente.

