

## Sessão Única por Usuário + Remover Aviso de Senha Vazada

### Problema
1. O sistema exibe uma mensagem de "senha vazada" (verificação HaveIBeenPwned do backend de autenticação) — o usuário quer desativar isso.
2. O sistema permite login simultâneo em vários dispositivos — o usuário quer que só um dispositivo fique conectado por vez, com aviso de confirmação.

### Solução

#### 1. Desativar verificação de senha vazada
Configurar o backend de autenticação para não verificar senhas contra bancos de dados de vazamentos.

#### 2. Tabela `user_sessions` para rastrear sessões ativas

```sql
CREATE TABLE public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text NOT NULL,
  device_info text,
  logged_in_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  UNIQUE(user_id)  -- apenas 1 sessão por usuário
);

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Usuários autenticados podem gerenciar sua própria sessão
CREATE POLICY "Users can manage own session"
  ON public.user_sessions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role pode gerenciar todas (para a edge function)
CREATE POLICY "Service can manage all sessions"
  ON public.user_sessions FOR ALL TO service_role
  USING (true) WITH CHECK (true);
```

#### 3. Edge Function `check-active-session`
- Recebe `email` do usuário
- Consulta se existe sessão ativa para esse email
- Retorna `{ hasActiveSession: true/false }`

#### 4. Fluxo no Login (`UserLogin.tsx` e `AdminLogin.tsx`)

```text
Usuário preenche email/senha
        │
        ▼
Chama edge function check-active-session(email)
        │
        ▼
  Sessão ativa?
   ┌────┴────┐
   Não      Sim
   │         │
   ▼         ▼
 Login    Dialog: "Já existe uma sessão ativa.
 normal   Deseja continuar e desconectar o outro dispositivo?"
              │
         ┌────┴────┐
         Não      Sim
         │         │
         ▼         ▼
       Cancela   Login + signOut({ scope: 'others' })
                 + upsert user_sessions
```

#### 5. Manter sessão atualizada
No `AuthContext`, ao detectar sessão ativa, fazer `upsert` na tabela `user_sessions` com o token atual. Ao fazer `signOut`, deletar o registro.

#### 6. Detectar desconexão no outro dispositivo
No `AuthContext`, usar `onAuthStateChange` — quando o evento `SIGNED_OUT` ou `TOKEN_REFRESHED` falhar, o usuário desconectado verá a tela de login automaticamente. O listener já existente cuida disso.

### Arquivos alterados
- **Nova migration**: criar tabela `user_sessions`
- **Nova edge function**: `check-active-session`
- **`src/pages/UserLogin.tsx`**: adicionar verificação + dialog de confirmação antes do login
- **`src/pages/AdminLogin.tsx`**: mesmo fluxo
- **`src/contexts/AuthContext.tsx`**: upsert/delete na `user_sessions` ao logar/deslogar
- **Configuração auth**: desativar verificação de senha vazada

