

## Corrigir tela branca apos criacao de conta

### Problema identificado

Apos o usuario criar a conta e confirmar o email, o link de confirmacao redireciona para a raiz do site (`/`). O Supabase JS v2 usa o fluxo PKCE, onde o redirect inclui um parametro `?code=xxx` na URL. Se o processamento desse codigo falhar silenciosamente ou demorar, a pagina pode ficar em branco porque:

1. **Sem Error Boundary**: Se qualquer componente React lanca um erro durante o processamento da sessao (ex: ao trocar o code por sessao e imediatamente tentar verificar roles), nao existe Error Boundary para capturar o erro - o React simplesmente mostra uma tela branca.

2. **Race condition no AuthContext**: Quando a sessao e criada apos o callback, `onAuthStateChange` dispara `checkAdminStatus`. Se a franquia ainda nao foi criada (o `assign-franqueadora-role` nao foi chamado porque o signup original nao tinha sessao), o `checkAdminStatus` tenta atribuir a role automaticamente mas pode falhar, causando estado inconsistente.

3. **Redirect pos-confirmacao vai para LandingPage**: O usuario confirma o email, chega na LandingPage (`/`), e nao sabe onde ir. Se o processamento do token falha, fica preso na tela branca.

### Solucao

1. **Adicionar Error Boundary global** para capturar erros React e mostrar uma tela amigavel em vez da tela branca.

2. **Criar rota de callback** (`/auth/callback`) que processa o codigo de confirmacao e redireciona o usuario para o local correto (`/admin/rentals`).

3. **Atualizar `emailRedirectTo`** para apontar para a rota de callback em vez da raiz.

4. **Adicionar logs de debug** no fluxo de cadastro para identificar exatamente onde o problema ocorre.

### Passos de implementacao

1. **Criar componente `ErrorBoundary`** (`src/components/ErrorBoundary.tsx`)
   - Captura erros React e exibe mensagem amigavel com botao "Tentar novamente"
   - Envolve o App inteiro

2. **Criar pagina `AuthCallback`** (`src/pages/AuthCallback.tsx`)
   - Rota: `/auth/callback`
   - Detecta o parametro `code` na URL
   - Chama `supabase.auth.exchangeCodeForSession(code)` se necessario
   - Apos sessao criada, chama `assign-franqueadora-role` se o usuario nao tem roles
   - Redireciona para `/admin/rentals`

3. **Atualizar `emailRedirectTo`** em todos os locais:
   - `src/pages/UserRegister.tsx` (linhas 74 e 107): mudar de `window.location.origin` para `window.location.origin + '/auth/callback'`
   - `src/pages/VerifyEmail.tsx` (linha 45): mesmo ajuste

4. **Registrar rota no App.tsx**
   - Adicionar `<Route path="/auth/callback" element={<AuthCallback />} />`

5. **Envolver App com ErrorBoundary** (`src/main.tsx`)

### Secao Tecnica

**ErrorBoundary.tsx** - Componente de classe React (error boundaries precisam ser class components):
```typescript
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('React Error Boundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return /* UI de erro amigavel com botao reload */;
    }
    return this.props.children;
  }
}
```

**AuthCallback.tsx** - Pagina de processamento do callback:
```typescript
export default function AuthCallback() {
  useEffect(() => {
    const handleCallback = async () => {
      // O Supabase client detecta automaticamente os tokens/code na URL
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Atribuir role se necessario
        await supabase.functions.invoke('assign-franqueadora-role', {
          body: { user_id: session.user.id }
        });
        navigate('/admin/rentals');
      } else {
        navigate('/login');
      }
    };
    handleCallback();
  }, []);
  return /* Tela de loading */;
}
```

**emailRedirectTo atualizado**:
```typescript
// UserRegister.tsx e VerifyEmail.tsx
emailRedirectTo: `${window.location.origin}/auth/callback`
```

