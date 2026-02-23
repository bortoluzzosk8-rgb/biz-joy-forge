

## Unificar emails de cadastro em um unico email

### Problema atual
Quando o usuario se cadastra, recebe **dois emails**:
1. Email de confirmacao do Supabase Auth (com link de verificacao)
2. Email de boas-vindas enviado via Resend (edge function `send-email`)

### Solucao
Remover o envio do email de boas-vindas separado e personalizar o template do email de confirmacao do Supabase Auth para incluir a mensagem de boas-vindas junto com o link de confirmacao. Assim o usuario recebe **apenas um email** bonito, com design do PlayGestor, contendo boas-vindas + link de confirmacao.

### Passos

1. **Remover envio do email de boas-vindas no cadastro** (`src/pages/UserRegister.tsx`)
   - Remover as linhas 101-103 que chamam `send-email` com type `welcome`

2. **Atualizar o template de confirmacao do Supabase Auth**
   - Usar a ferramenta de configuracao de auth para definir um template HTML personalizado para o email de confirmacao (signup)
   - O template tera o design do PlayGestor com as cores #E53935 (vermelho) e #6C4DF6 (roxo), logo, e mensagem de boas-vindas integrada com o botao de confirmacao

3. **Design do email unificado**
   - Header com logo do PlayGestor
   - Mensagem de boas-vindas personalizada com o nome do usuario
   - Botao de confirmacao de email com destaque visual
   - Dicas sobre o que o usuario pode fazer no PlayGestor
   - Footer com link do site
   - Cores e fontes alinhadas com a identidade visual do sistema

4. **Limpar templates nao utilizados na edge function** (`supabase/functions/send-email/index.ts`)
   - Remover o template `welcome` e `verification` que nao serao mais necessarios
   - Manter apenas o template `password_reset` que ainda e usado

### Secao Tecnica

**Arquivo `src/pages/UserRegister.tsx`**: Remover bloco de linhas 100-103 (chamada fire-and-forget do send-email welcome).

**Auth template (signup confirmation)**: Configurar via ferramenta configure-auth com HTML customizado usando as variaveis do Supabase: `{{ .ConfirmationURL }}` para o link e `{{ .Email }}` para o email do usuario.

**Arquivo `supabase/functions/send-email/index.ts`**: Remover templates `getWelcomeTemplate` e `getVerificationTemplate`, manter `getPasswordResetTemplate`. Remover cases `welcome` e `verification` do switch.

**Arquivo `src/pages/VerifyEmail.tsx`**: Remover chamada ao send-email com type `verification` nas linhas 57-59, pois o reenvio ja e feito pelo `supabase.auth.resend()`.
