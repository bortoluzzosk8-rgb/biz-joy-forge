
## Plano: Adicionar Recuperação de Senha na Tela de Login

Vamos implementar um sistema completo de recuperação de senha que permite ao usuário solicitar um link para redefinir sua senha por email.

---

### Como Funciona

1. Usuário clica em "Esqueceu a senha?" na tela de login
2. Uma modal/formulário aparece pedindo o email
3. Sistema envia um link de recuperação para o email
4. Usuário clica no link e é redirecionado para uma página de redefinição
5. Usuário define a nova senha e faz login

---

### Arquivos a Criar/Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `src/pages/UserLogin.tsx` | Modificar | Adicionar link "Esqueceu a senha?" e modal para solicitar recuperação |
| `src/pages/ResetPassword.tsx` | Criar | Página para o usuário definir a nova senha após clicar no link do email |
| `src/App.tsx` | Modificar | Adicionar rota `/reset-password` |

---

### Fluxo Detalhado

```
Tela de Login
    └── Usuário clica "Esqueceu a senha?"
         └── Abre modal com campo de email
              └── Usuário digita email e clica "Enviar"
                   └── Supabase envia email automático com link
                        └── Usuário recebe email e clica no link
                             └── Abre página /reset-password
                                  └── Usuário digita nova senha
                                       └── Senha atualizada - redireciona para login
```

---

### Sobre Confirmação de Email

**Boa notícia**: O Supabase já tem sistema nativo de recuperação de senha que funciona da seguinte forma:

- Usa a função `supabase.auth.resetPasswordForEmail(email)`
- O Supabase envia automaticamente um email com link de recuperação
- O link redireciona para sua aplicação com um token especial
- A função `supabase.auth.updateUser({ password })` atualiza a senha

**Não é necessário** configurar SMTP ou criar edge functions para isso - o Supabase já faz automaticamente usando os templates de email nativos.

---

### Mudanças na Tela de Login

Vamos adicionar entre a senha e o botão "Entrar":

```
Senha
┌──────────────────────────────┐
│ ••••••••              👁     │
└──────────────────────────────┘
             Esqueceu a senha?  ← Link clicável

┌──────────────────────────────┐
│          → Entrar            │
└──────────────────────────────┘
```

---

### Modal de Recuperação

Quando clicar em "Esqueceu a senha?", aparece:

```
┌──────────────────────────────────────────┐
│         Recuperar Senha                  │
├──────────────────────────────────────────┤
│                                          │
│  Digite seu email para receber um        │
│  link de recuperação de senha.           │
│                                          │
│  Email                                   │
│  ┌────────────────────────────────────┐  │
│  │ seu@email.com                      │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │        Enviar Link                 │  │
│  └────────────────────────────────────┘  │
│                                          │
│              Voltar ao login             │
└──────────────────────────────────────────┘
```

---

### Página de Nova Senha

Após clicar no link do email, o usuário vai para `/reset-password`:

```
┌──────────────────────────────────────────┐
│              [LOGO]                      │
│                                          │
│       Definir Nova Senha                 │
│                                          │
│  Nova senha                              │
│  ┌────────────────────────────────────┐  │
│  │ ••••••••                       👁  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Confirmar nova senha                    │
│  ┌────────────────────────────────────┐  │
│  │ ••••••••                       👁  │  │
│  └────────────────────────────────────┘  │
│                                          │
│  ┌────────────────────────────────────┐  │
│  │      Atualizar Senha               │  │
│  └────────────────────────────────────┘  │
└──────────────────────────────────────────┘
```

---

### Detalhes Técnicos

**1. UserLogin.tsx - Função de recuperação:**

```typescript
const handleForgotPassword = async () => {
  if (!forgotEmail.trim()) {
    toast({
      title: "Email obrigatório",
      description: "Digite seu email para recuperar a senha.",
      variant: "destructive",
    });
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(
    forgotEmail.trim(),
    {
      redirectTo: `${window.location.origin}/reset-password`,
    }
  );

  if (error) {
    toast({
      title: "Erro",
      description: "Não foi possível enviar o email. Tente novamente.",
      variant: "destructive",
    });
  } else {
    toast({
      title: "Email enviado!",
      description: "Verifique sua caixa de entrada para redefinir sua senha.",
    });
    setShowForgotPassword(false);
  }
};
```

**2. ResetPassword.tsx - Atualização de senha:**

```typescript
const handleResetPassword = async () => {
  if (password !== confirmPassword) {
    toast({
      title: "Senhas diferentes",
      description: "As senhas não coincidem.",
      variant: "destructive",
    });
    return;
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    toast({
      title: "Erro",
      description: "Não foi possível atualizar a senha.",
      variant: "destructive",
    });
  } else {
    toast({
      title: "Senha atualizada!",
      description: "Faça login com sua nova senha.",
    });
    navigate('/login');
  }
};
```

**3. App.tsx - Nova rota:**

```typescript
import ResetPassword from "./pages/ResetPassword";

// Dentro de Routes
<Route path="/reset-password" element={<ResetPassword />} />
```

---

### Validações de Segurança

- Email é validado antes de enviar
- Senha mínima de 6 caracteres
- Confirmação de senha obrigatória
- Token do Supabase valida automaticamente se o link é válido
- Links expiram após um tempo definido pelo Supabase

---

### Resultado Final

Após implementar:
- Usuário que esqueceu a senha pode recuperá-la facilmente
- Processo seguro usando o sistema nativo do Supabase
- Experiência intuitiva com feedback visual em cada etapa
- Não precisa de configuração adicional de email (Supabase já envia)

