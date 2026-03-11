

## Duas correções solicitadas

### 1. Remover aba "Leads" do menu para franqueadoras

O menu lateral/topo inclui "Leads" para o papel `franqueadora` em `AdminLayout.tsx` (linha 58). Será removido desse array, mantendo apenas o "Leads SaaS" para super_admin.

**Arquivo:** `src/pages/admin/AdminLayout.tsx`
- Remover a linha `{ value: "leads", label: "Leads", icon: UserPlus, roles: ["franqueadora"] }` do array `clientMenuItems`

### 2. Corrigir preview de logo nas Configurações para novos usuários

Na imagem enviada, a área de logo mostra um conteúdo estranho (card de "Diferença +R$ 0,00"). Isso pode acontecer porque o container de preview é renderizado mesmo quando `logo_url` é uma string vazia `""` (que é truthy). O `settings.logoUrl` recebe `data.logo_url || ""` — uma string vazia passa na condição `logoPreview || settings.logoUrl`.

**Arquivo:** `src/pages/admin/Settings.tsx`
- Na condição da linha 353, trocar `{(logoPreview || settings.logoUrl) && (` para verificar strings não-vazias explicitamente
- Garantir que `logoUrl` default seja `""` e que a condição não renderize o container `<img>` quando a URL está vazia
- Adicionar `onError` handler na tag `<img>` para esconder a imagem caso a URL seja inválida

