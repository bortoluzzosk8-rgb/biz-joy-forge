

## Corrigir erro ao criar motorista + trocar "Franquia" por "Unidade"

### Problemas identificados

1. **Erro ao criar motorista**: A edge function `create-driver` usa `supabase.auth.admin.createUser()` que verifica senhas contra o banco de dados HaveIBeenPwned. Se a senha estiver nessa lista, retorna erro. Precisamos desabilitar essa verificação na criação do usuário via edge function, ou capturar e ignorar o erro de "leaked password".

2. **Terminologia**: O label "Franquia" aparece em 4 lugares na página de Motoristas — precisa ser trocado por "Unidade" (conforme preferência já registrada).

### Correções

**`supabase/functions/create-driver/index.ts`**
- Adicionar opção para ignorar verificação de senha comprometida no `createUser`, ou tratar o erro adequadamente. Na API admin do Supabase, não há flag direta para isso, então a abordagem será capturar erros de "leaked/pwned" e tentar novamente ou simplesmente informar que a senha foi aceita.
- Na verdade, o problema pode ser resolvido pela configuração de auth que já foi feita (desabilitar HIBP). Preciso verificar se a config foi aplicada.

**`src/pages/admin/Drivers.tsx`** — Trocar todas as ocorrências de "Franquia" por "Unidade":
- Linha 446: Label `Franquia` → `Unidade`
- Linha 498: TableHead `Franquia` → `Unidade`  
- Linha 582: Label `Franquia` → `Unidade`

### Sobre o erro de criação
O erro provavelmente é causado pela verificação de senha vazada (HIBP) na criação do auth user. A configuração de auth já foi atualizada para desabilitar isso, mas a edge function `create-driver` pode ainda estar recebendo o erro. Vou adicionar tratamento no frontend (`Drivers.tsx`) para capturar e exibir mensagens de erro mais claras, e também verificar/garantir que a config de auth está correta.

