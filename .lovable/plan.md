

## Plano: Configurar Resend SMTP para Emails de Verificacao

### Resumo
Configurar o provedor Resend como SMTP customizado para envio dos emails de verificacao de conta, garantindo entrega rapida e confiavel. O remetente sera `suporte@playgestor.com.br`.

### Etapas

1. **Salvar a chave API do Resend como secret do projeto**
   - Armazenar `RESEND_API_KEY` nos secrets do backend para uso seguro

2. **Configurar SMTP no backend (Lovable Cloud)**
   - O SMTP para emails de autenticacao (verificacao, recuperacao de senha) precisa ser configurado no painel do backend. As credenciais do Resend sao:
     - **Host**: `smtp.resend.com`
     - **Porta**: `465`
     - **Usuario**: `resend`
     - **Senha**: a chave API do Resend
     - **Remetente**: `suporte@playgestor.com.br`
   - Essa configuracao sera feita via as ferramentas de configuracao de autenticacao do projeto

3. **Melhorar a pagina de verificacao de email (`src/pages/VerifyEmail.tsx`)**
   - Adicionar timer de cooldown de 60 segundos no botao "Reenviar e-mail" para evitar spam
   - Melhorar mensagens orientando o usuario a verificar caixa de spam/promocoes
   - Adicionar indicacao visual do tempo restante para reenvio

### Secao Tecnica

**Configuracao SMTP (via configure-auth):**
- SMTP host: `smtp.resend.com`
- SMTP port: `465`
- SMTP user: `resend`
- SMTP pass: chave API do Resend
- Sender name: `PlayGestor`
- Sender email: `suporte@playgestor.com.br`

**Alteracoes em `src/pages/VerifyEmail.tsx`:**
```text
- Estado: cooldown (number) para controlar timer de 60s
- useEffect com setInterval para decrementar o cooldown
- Botao desabilitado durante cooldown, mostrando segundos restantes
- Texto adicional orientando verificar pasta de spam/promocoes
```

**Secret a ser adicionado:**
- `RESEND_API_KEY` com o valor fornecido

### Resultado Esperado
Emails de verificacao e recuperacao de senha serao enviados instantaneamente via Resend, sem os atrasos do servico padrao. O remetente aparecera como `suporte@playgestor.com.br`.

