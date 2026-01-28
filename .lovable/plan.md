

## Plano: Painel de Atualizacoes do Sistema

### Resumo

Criar um sistema de comunicados/atualizacoes do sistema onde:
- **Super Admin** pode criar, editar e excluir atualizacoes
- **Todos os usuarios** (franqueadoras, vendedores, motoristas) podem visualizar as atualizacoes
- Novo botao no menu ao lado de "Assinaturas" para acessar a pagina

---

### O Que Sera Criado

#### 1. Tabela no Banco de Dados

Nova tabela `system_updates` para armazenar as atualizacoes:

```sql
CREATE TABLE system_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  version text,
  published_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Campos:**
- `title`: Titulo da atualizacao (ex: "Nova funcionalidade de logistica")
- `description`: Descricao detalhada do que mudou
- `version`: Versao opcional (ex: "1.2.0")
- `published_at`: Data de publicacao
- `is_active`: Se esta visivel para usuarios

#### 2. Politicas de Seguranca (RLS)

- **Super Admin**: Pode criar, editar e excluir todas as atualizacoes
- **Usuarios autenticados**: Podem apenas visualizar atualizacoes ativas

```sql
-- Super Admin gerencia tudo
CREATE POLICY "Super Admin can manage all updates"
  ON system_updates FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Usuarios autenticados podem ver atualizacoes ativas
CREATE POLICY "Authenticated users can view active updates"
  ON system_updates FOR SELECT
  USING (is_active = true);
```

---

### Arquivos a Criar/Modificar

| Arquivo | Acao |
|---------|------|
| `supabase/migrations/xxx_create_system_updates.sql` | Criar tabela e RLS |
| `src/pages/admin/SystemUpdates.tsx` | Pagina para visualizar atualizacoes |
| `src/pages/admin/SuperAdminDashboard.tsx` | Adicionar secao para gerenciar atualizacoes |
| `src/pages/admin/AdminLayout.tsx` | Adicionar botao no menu |
| `src/App.tsx` | Adicionar rota `/admin/updates` |

---

### Layout das Paginas

#### Pagina de Visualizacao (todos os usuarios)

```
+--------------------------------------------------+
| Atualizacoes do Sistema                          |
+--------------------------------------------------+
| [Icone] v1.2.0 - Nova funcionalidade de logistica|
| Data: 28/01/2026                                 |
| Descricao: Agora voce pode arrastar entregas...  |
+--------------------------------------------------+
| [Icone] v1.1.0 - Melhorias no financeiro         |
| Data: 20/01/2026                                 |
| Descricao: Adicionamos graficos de despesas...   |
+--------------------------------------------------+
```

#### Secao de Gerenciamento no Super Admin Dashboard

```
+--------------------------------------------------+
| Gerenciar Atualizacoes do Sistema                |
+--------------------------------------------------+
| [+ Nova Atualizacao]                             |
+--------------------------------------------------+
| Lista de atualizacoes com opcoes de editar/excluir|
+--------------------------------------------------+
```

---

### Botao no Menu

Adicionar ao `clientMenuItems` no `AdminLayout.tsx`:

```typescript
{ value: "updates", label: "Atualizacoes", icon: Bell, roles: ["franqueadora", "vendedor", "motorista"] },
```

**Posicao:** Ao lado de "Assinaturas" (para franqueadoras) ou como ultimo item (para vendedores/motoristas)

---

### Funcionalidades

#### Para Super Admin:
- Formulario para criar nova atualizacao (titulo, descricao, versao)
- Lista de todas as atualizacoes com acoes de editar/excluir
- Toggle para ativar/desativar visibilidade

#### Para Usuarios:
- Lista de atualizacoes ordenadas por data (mais recente primeiro)
- Card com titulo, versao, data e descricao
- Visual limpo e informativo

---

### Fluxo de Uso

1. **Super Admin** acessa o Dashboard SaaS
2. Na secao "Gerenciar Atualizacoes", clica em "Nova Atualizacao"
3. Preenche titulo, descricao e versao opcional
4. Salva a atualizacao

5. **Usuario (franqueadora/vendedor/motorista)** ve o botao "Atualizacoes" no menu
6. Clica e visualiza todas as atualizacoes do sistema
7. Fica informado sobre mudancas e novidades

---

### Secao Tecnica

#### Hook para Buscar Atualizacoes

```typescript
const useSystemUpdates = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['system-updates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_updates')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
  
  return { updates: data, isLoading };
};
```

#### Componente de Card de Atualizacao

```typescript
<Card>
  <CardHeader>
    <div className="flex items-center justify-between">
      <CardTitle>{update.title}</CardTitle>
      {update.version && <Badge>{update.version}</Badge>}
    </div>
    <p className="text-sm text-muted-foreground">
      {format(new Date(update.published_at), "dd/MM/yyyy")}
    </p>
  </CardHeader>
  <CardContent>
    <p>{update.description}</p>
  </CardContent>
</Card>
```

---

### Icone Sugerido

Usar o icone `Bell` (sino) ou `Megaphone` do lucide-react para representar atualizacoes/notificacoes

---

### Resultado Esperado

1. Super Admin pode publicar atualizacoes do sistema de forma simples
2. Todos os usuarios tem acesso facil as novidades
3. Historico de atualizacoes fica disponivel permanentemente
4. Comunicacao clara entre administrador do SaaS e clientes

