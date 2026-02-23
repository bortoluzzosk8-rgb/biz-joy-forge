

## Plano: Atualizar chave do Resend API

### O que sera feito
Atualizar o secret `RESEND_API_KEY` com uma nova chave valida para que os emails voltem a funcionar.

### Passos
1. Abrir o formulario para voce colar a nova chave API do Resend
2. Redeployar a edge function `send-email` para garantir que use a chave atualizada
3. Testar o envio de email para confirmar que esta funcionando

### Como obter a chave
- Acesse https://resend.com/api-keys
- Copie a chave (comeca com `re_`)
- Cole no formulario que sera aberto

### Secao Tecnica
- Atualizar o secret `RESEND_API_KEY` via ferramenta de secrets
- Redeploy da edge function `send-email`
- Teste via curl para validar resposta 200

