

## Plano: Botao Catalogo no Menu + Link Publico para Clientes

### Resumo

Adicionar um botao "Catalogo" no menu administrativo (ao lado esquerdo de "Produtos") que permite:
1. Acessar o catalogo diretamente do painel
2. Quando dentro do catalogo, ter um botao "Voltar ao Sistema"
3. Ter um link compartilhavel para clientes verem o catalogo (sem precisar de login)

---

### O Que Sera Criado/Modificado

#### 1. Menu do Painel Administrativo

**Arquivo:** `src/pages/admin/AdminLayout.tsx`

Adicionar o item "Catalogo" no array `clientMenuItems`, posicionado ANTES de "Produtos":

```typescript
{ value: "catalog", label: "Catálogo", icon: ShoppingBag, roles: ["franqueadora", "vendedor"] },
{ value: "products", label: "Produtos", icon: Package, roles: ["franqueadora"] },
```

Modificar a funcao `handleTabChange` para tratar o caso especial do catalogo (redirecionar para `/catalog` ao inves de `/admin/catalog`).

---

#### 2. Botao "Voltar ao Sistema" no Catalogo

**Arquivo:** `src/pages/Catalog.tsx`

Adicionar um botao no header do catalogo que:
- So aparece quando o usuario vem do painel admin (verificar `isAdmin` do AuthContext)
- Redireciona para `/admin/dashboard`

```
+--------------------------------------------------+
| [Logo]  Catalogo ENGBRINK   [Voltar] [Copiar Link] [Sair] |
+--------------------------------------------------+
```

---

#### 3. Rota Publica do Catalogo

**Arquivos:**
- `src/App.tsx` - Adicionar nova rota `/catalogo/:franchiseId`
- `src/pages/PublicCatalog.tsx` - Nova pagina para visualizacao publica

A rota publica:
- NAO exige autenticacao
- Recebe o ID da franchise como parametro
- Carrega produtos e settings dessa franchise especifica
- Clientes podem ver os produtos sem precisar fazer login

---

#### 4. Botao "Copiar Link" no Catalogo

Quando o usuario admin esta no catalogo, mostrar um botao para copiar o link publico:

```typescript
// Gerar link publico
const publicLink = `${window.location.origin}/catalogo/${userFranchise?.id}`;

// Copiar para clipboard
navigator.clipboard.writeText(publicLink);
toast.success("Link copiado! Envie para seus clientes.");
```

---

### Layout Visual do Catalogo (para Admin)

```
+-----------------------------------------------------------+
| [Logo]  Catalogo ENGBRINK                                 |
|                           [Voltar] [Copiar Link] [Sair]   |
+-----------------------------------------------------------+
```

- **Voltar**: Retorna ao painel admin (`/admin/dashboard`)
- **Copiar Link**: Copia o link publico para enviar aos clientes
- **Sair**: Faz logout (comportamento atual)

---

### Layout Visual do Catalogo Publico (para Clientes)

```
+-----------------------------------------------------------+
| [Logo]  Catalogo ENGBRINK                                 |
|                                               [WhatsApp]  |
+-----------------------------------------------------------+
| Produtos...                                               |
+-----------------------------------------------------------+
```

- Sem botao de Voltar (cliente nao tem painel)
- Sem botao de Logout (cliente nao esta logado)
- Botao flutuante do WhatsApp para contato

---

### Fluxo de Uso

**Para o Admin/Franqueadora:**
1. Clica em "Catalogo" no menu do painel
2. Visualiza o catalogo com produtos
3. Clica em "Copiar Link" para obter o link publico
4. Envia o link para o cliente via WhatsApp/Email
5. Clica em "Voltar" para retornar ao painel

**Para o Cliente:**
1. Recebe o link do catalogo (ex: `seusite.com/catalogo/abc123`)
2. Abre o link no navegador
3. Visualiza os produtos sem precisar fazer login
4. Pode adicionar ao carrinho e finalizar compra

---

### Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/admin/AdminLayout.tsx` | Adicionar item "Catalogo" no menu |
| `src/pages/Catalog.tsx` | Adicionar botoes "Voltar" e "Copiar Link" |
| `src/pages/PublicCatalog.tsx` | Criar pagina publica do catalogo |
| `src/App.tsx` | Adicionar rota `/catalogo/:franchiseId` |

---

### Secao Tecnica

#### Nova Rota no App.tsx

```typescript
// Catalogo publico (sem autenticacao)
<Route path="/catalogo/:franchiseId" element={<PublicCatalog />} />
```

#### Botoes no Catalog.tsx

```typescript
// Importar useAuth
const { isAdmin, userFranchise } = useAuth();

// No header, apos o logo
{isAdmin && (
  <div className="flex items-center gap-2">
    <Button 
      variant="secondary" 
      size="sm"
      onClick={() => navigate('/admin/dashboard')}
    >
      <ArrowLeft className="w-4 h-4 mr-1" />
      Voltar
    </Button>
    
    {userFranchise && (
      <Button 
        variant="secondary" 
        size="sm"
        onClick={handleCopyLink}
      >
        <Link className="w-4 h-4 mr-1" />
        Copiar Link
      </Button>
    )}
  </div>
)}
```

#### Funcao para Copiar Link

```typescript
const handleCopyLink = () => {
  const publicLink = `${window.location.origin}/catalogo/${userFranchise?.id}`;
  navigator.clipboard.writeText(publicLink);
  toast.success("Link copiado! Envie para seus clientes.");
};
```

#### Hook para Carregar Produtos por Franchise

No `PublicCatalog.tsx`, carregar produtos da franchise especifica:

```typescript
const { franchiseId } = useParams();

// Carregar produtos da franchise
const { data: products } = await supabase
  .from('products')
  .select('*')
  .eq('franchise_id', franchiseId)
  .eq('visible', true)
  .order('display_order');

// Carregar settings da franchise
const { data: settings } = await supabase
  .from('settings')
  .select('*')
  .eq('franchise_id', franchiseId)
  .single();
```

---

### Icone Sugerido

Usar o icone `ShoppingBag` do lucide-react para representar o catalogo no menu

---

### Observacao sobre Settings

Atualmente a tabela `settings` nao tem `franchise_id`. Para o catalogo publico funcionar corretamente com configuracoes personalizadas por franchise, sera necessario:

**Opcao 1 (Simples):** Usar as settings globais para todos os catalogos

**Opcao 2 (Completa):** Adicionar `franchise_id` na tabela `settings` (requer migracao)

Recomendo comecar com a Opcao 1 e depois evoluir para a Opcao 2 se necessario.

---

### Resultado Esperado

1. Botao "Catalogo" aparece no menu ao lado de "Produtos"
2. Ao clicar, abre o catalogo com botoes "Voltar" e "Copiar Link"
3. O link publico pode ser compartilhado com clientes
4. Clientes acessam o catalogo sem precisar de login
5. Comunicacao mais facil entre admin e clientes

