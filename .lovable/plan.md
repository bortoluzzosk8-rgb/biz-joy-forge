

## Plano: Edge Function para Envio de Emails via Resend + Teste

### Resumo
Criar uma edge function `send-email` que usa a API do Resend para enviar emails personalizados (boas-vindas, verificacao, recuperacao de senha). Integrar essa funcao nos fluxos de cadastro e login para que os emails sejam enviados via `suporte@playgestor.com.br`.

### Etapas

1. **Criar edge function `send-email`**
   - Recebe tipo de email (welcome, verification, password_reset) + dados do destinatario
   - Usa a API do Resend com a chave ja configurada (`RESEND_API_KEY`)
   - Remetente: `PlayGestor <suporte@playgestor.com.br>`
   - Templates HTML bonitos para cada tipo de email

2. **Integrar no fluxo de cadastro (`UserRegister.tsx`)**
   - Apos criar o usuario com sucesso, chamar a edge function para enviar email de boas-vindas
   - O email de verificacao continuara sendo enviado pelo sistema de autenticacao (via SMTP do Resend se configurado, ou via a edge function como fallback)

3. **Integrar no fluxo de recuperacao de senha (`UserLogin.tsx`)**
   - Apos solicitar recuperacao de senha, enviar email customizado via edge function com instrucoes

4. **Integrar no reenvio de verificacao (`VerifyEmail.tsx`)**
   - Manter o fluxo atual do `supabase.auth.resend()` que usa o SMTP configurado
   - Adicionar chamada a edge function como complemento para garantir entrega

5. **Testar criando um usuario novo**
   - Validar que o email de boas-vindas chega na caixa de entrada

### Secao Tecnica

**Nova edge function `supabase/functions/send-email/index.ts`:**
```text
- POST endpoint que recebe: { type, to, name, data }
- Tipos suportados: "welcome", "verification", "password_reset"
- Usa fetch para chamar https://api.resend.com/emails
- Headers: Authorization: Bearer RESEND_API_KEY
- From: "PlayGestor <suporte@playgestor.com.br>"
- Templates HTML inline para cada tipo de email
- Validacao de JWT para seguranca
```

**`supabase/config.toml`:**
```text
[functions.send-email]
verify_jwt = false
```

**Alteracoes em `src/pages/UserRegister.tsx`:**
```text
- Apos signup com sucesso (linha ~99-107), chamar:
  supabase.functions.invoke('send-email', {
    body: { type: 'welcome', to: email, name: name }
  })
- Chamada fire-and-forget (nao bloqueia o fluxo)
```

**Alteracoes em `src/pages/UserLogin.tsx`:**
```text
- Apos resetPasswordForEmail com sucesso, chamar:
  supabase.functions.invoke('send-email', {
    body: { type: 'password_reset', to: email, name: '' }
  })
```

**Templates de email incluidos:**
- Boas-vindas: saudacao com nome, breve explicacao do PlayGestor
- Recuperacao de senha: instrucoes para verificar caixa de entrada com link do Supabase
- Verificacao: lembrete para confirmar o email

### Resultado Esperado
Ao criar um usuario novo, ele recebera um email de boas-vindas bonito vindo de `suporte@playgestor.com.br`. Emails de recuperacao de senha tambem serao enviados pelo mesmo remetente. Poderemos testar imediatamente apos a implementacao.
