

## Plano: Adicionar Gerenciamento de Atualizacoes para Super Admin

### Resumo

Modificar a pagina de Atualizacoes do Sistema (`/admin/updates`) para que o Super Admin possa adicionar, editar e excluir atualizacoes diretamente. Os demais usuarios continuarao vendo apenas a lista de atualizacoes.

---

### Situacao Atual

- O componente `SystemUpdatesManager` ja existe com CRUD completo
- Ele esta sendo usado no `SuperAdminDashboard`
- A pagina `SystemUpdates.tsx` mostra apenas visualizacao para todos

### Solucao

Modificar `SystemUpdates.tsx` para:
1. Verificar se o usuario logado e Super Admin via `useAuth()`
2. Se for Super Admin: mostrar o `SystemUpdatesManager` (com CRUD)
3. Se nao for: mostrar a visualizacao atual (somente leitura)

---

### Alteracoes no Codigo

**Arquivo:** `src/pages/admin/SystemUpdates.tsx`

#### 1. Importar dependencias necessarias

```typescript
import { useAuth } from "@/contexts/AuthContext";
import SystemUpdatesManager from "@/components/admin/SystemUpdatesManager";
```

#### 2. Verificar role do usuario

```typescript
const { isSuperAdmin } = useAuth();
```

#### 3. Renderizar componente correto

```typescript
// Se for Super Admin, mostra o gerenciador
if (isSuperAdmin) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Megaphone className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Atualizacoes do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie as atualizacoes que aparecem para todos os usuarios
          </p>
        </div>
      </div>
      <SystemUpdatesManager />
    </div>
  );
}

// Para outros usuarios, mostra a visualizacao normal
return (
  // ... codigo atual
);
```

---

### Arquivos a Modificar

| Arquivo | Acao |
|---------|------|
| `src/pages/admin/SystemUpdates.tsx` | Adicionar verificacao de Super Admin e renderizar componente correto |

---

### Fluxo de Uso

**Para o Super Admin:**
1. Acessa "Atualizacoes" no menu
2. Ve a lista de todas as atualizacoes (ativas e ocultas)
3. Pode criar nova atualizacao clicando em "Nova Atualizacao"
4. Pode editar, excluir ou ocultar/mostrar cada atualizacao
5. Mudancas aparecem imediatamente para todos os usuarios do SaaS

**Para outros usuarios (Franqueadoras, Vendedores, etc):**
1. Acessam "Atualizacoes" no menu
2. Veem apenas as atualizacoes ativas (is_active = true)
3. Nao tem opcao de editar ou excluir

---

### Resultado Esperado

**Tela do Super Admin:**
```
+----------------------------------------------------------+
| [Megaphone] Atualizacoes do Sistema                      |
| Gerencie as atualizacoes que aparecem para todos         |
+----------------------------------------------------------+
| Gerenciar Atualizacoes          [+ Nova Atualizacao]     |
+----------------------------------------------------------+
| [x] Nova funcionalidade v1.2  [Visivel] [Edit] [Delete]  |
| [x] Correcao de bugs v1.1.5   [Visivel] [Edit] [Delete]  |
| [ ] Teste interno v0.9        [Oculto]  [Edit] [Delete]  |
+----------------------------------------------------------+
```

**Tela dos demais usuarios:**
```
+----------------------------------------------------------+
| [Megaphone] Atualizacoes do Sistema                      |
| Confira as ultimas novidades e melhorias                 |
+----------------------------------------------------------+
| [Card] Nova funcionalidade v1.2                          |
|        12 de janeiro de 2026                             |
|        Descricao da atualizacao...                       |
+----------------------------------------------------------+
| [Card] Correcao de bugs v1.1.5                          |
|        10 de janeiro de 2026                             |
|        Descricao da atualizacao...                       |
+----------------------------------------------------------+
```

---

### Secao Tecnica

O componente `SystemUpdatesManager` ja inclui:
- Formulario com campos: Titulo, Versao (opcional), Descricao
- Listagem de todas as atualizacoes (ativas e inativas)
- Toggle para ativar/desativar visibilidade
- Botoes de editar e excluir
- Validacao de campos obrigatorios
- Feedback via toast ao criar/editar/excluir

As policies RLS da tabela `system_updates` precisam permitir que o Super Admin faca INSERT, UPDATE e DELETE. Vou verificar se isso ja esta configurado.

