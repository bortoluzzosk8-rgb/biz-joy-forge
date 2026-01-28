

## Plano: Corrigir Problema de Cadastro de Unidades

### Diagnóstico Detalhado

O problema foi identificado e tem a seguinte cadeia de causa:

| Passo | Status | Problema |
|-------|--------|----------|
| 1. Buscar `user_franchises` do usuário | **Retorna vazio** | Usuário não tem vínculo |
| 2. `rootFranchiseId` fica `null` | Falha silenciosa | Não tem franquia raiz definida |
| 3. Nova unidade criada com `parent_franchise_id: null` | Comportamento incorreto | Cria como raiz, não como filha |
| 4. Listagem filtra por `parent_franchise_id = null` | Não encontra nada | Filtro não funciona com `null` |

**Evidência**: O usuário atual (`e162b3e7-f791-481a-bf6b-e8a7afe1d21a`) possui role `franqueadora` mas NÃO possui registro na tabela `user_franchises`.

---

### Solução em 2 Partes

#### Parte 1: Correção de Dados (Imediata)

Vincular o usuário à sua franquia raiz. Existem algumas franquias órfãs criadas recentemente:

```text
id: e8019f6e-fdbf-480b-916a-71f9cc52b2c6
name: PLAY GESTOR
city: CEDRAL
created_at: 2026-01-28 14:50:36
```

SQL para corrigir:
```sql
INSERT INTO user_franchises (user_id, franchise_id, name)
VALUES (
  'e162b3e7-f791-481a-bf6b-e8a7afe1d21a',
  'e8019f6e-fdbf-480b-916a-71f9cc52b2c6',
  'Play gestor'
);
```

---

#### Parte 2: Melhoria do Código (Preventiva)

Modificar o arquivo `src/pages/admin/Franchises.tsx` para:

1. **Detectar quando o usuário não tem franquia vinculada**
2. **Criar automaticamente o vínculo** usando a primeira franquia criada por ele
3. **Exibir mensagem informativa** caso não consiga recuperar automaticamente

---

### Alterações de Código

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/Franchises.tsx` | Adicionar lógica de auto-recuperação |

---

### Fluxo Melhorado

```text
1. Buscar user_franchises do usuário
2. SE vazio:
   a. Buscar franquias com parent_franchise_id = null
   b. SE encontrar uma franquia sem parent:
      - Criar vínculo automaticamente em user_franchises
      - Usar essa como rootFranchiseId
   c. SE não encontrar:
      - Exibir mensagem orientando o usuário
3. Continuar fluxo normal
```

---

### Resultado Esperado

Após as correções:
- Usuário verá sua franquia raiz listada
- Novas unidades serão criadas corretamente como filhas
- As unidades aparecerão nos selects de Estoque e Locações

