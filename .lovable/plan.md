

## Plano: Corrigir Dropdown de Unidades no Gráfico de Vendas

### Problema Identificado

O dropdown "Unidade" no componente `SalesChart.tsx` está mostrando várias opções "A definir" porque:

1. **Carrega TODAS as franquias** do banco de dados, sem respeitar o isolamento multi-tenant
2. **Exibe `city` em vez de `name`** quando city = "A definir" (valor existe, não é null)

Dados atuais no banco:
| Nome | Cidade |
|------|--------|
| Franquia de gg | A definir |
| Franquia de Oompa Brink | A definir |
| Franquia de Rat | A definir |
| Franquia Principal | A definir |
| sad | A definir |

### Solução

Corrigir o `SalesChart.tsx` para:

1. **Usar isolamento multi-tenant** - substituir a query direta ao banco pelo hook `useTenantFranchises`
2. **Melhorar exibição do nome** - mostrar `name` quando `city` for "A definir" ou vazia

---

### Alterações no Código

**Arquivo:** `src/components/sales/SalesChart.tsx`

#### 1. Importar o hook de tenant

```typescript
import { useTenantFranchises } from "@/hooks/useTenantFranchises";
```

#### 2. Substituir o carregamento de franchises

**Antes:**
```typescript
const [franchises, setFranchises] = useState<Franchise[]>([]);

useEffect(() => {
  const loadFranchises = async () => {
    const { data } = await supabase
      .from("franchises")
      .select("id, name, city")
      .eq("status", "active")
      .order("name");
    
    if (data) setFranchises(data);
  };
  loadFranchises();
}, []);
```

**Depois:**
```typescript
const { franchises } = useTenantFranchises();
```

#### 3. Melhorar lógica de exibição do nome

**Antes:**
```typescript
{franchise.city || franchise.name}
```

**Depois:**
```typescript
{franchise.city && franchise.city !== "A definir" 
  ? franchise.city 
  : franchise.name}
```

Aplicar a mesma lógica em todos os lugares onde se exibe o nome da unidade:
- Dropdown (linha 329)
- Labels do gráfico (linha 181)
- Tabela detalhada

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/sales/SalesChart.tsx` | Usar `useTenantFranchises` + corrigir exibição do nome |

---

### Resultado Esperado

**Antes:**
```
Unidade: [Todas as Unidades ▼]
          ✓ Todas as Unidades
            A definir
            A definir
            A definir
            A definir
            A definir
```

**Depois:**
```
Unidade: [Todas as Unidades ▼]
          ✓ Todas as Unidades
            Sua Unidade Principal
```

O usuário verá apenas:
- A franquia raiz à qual está vinculado
- As sub-unidades dessa franquia (se houver)
- Com o nome correto (não "A definir")

