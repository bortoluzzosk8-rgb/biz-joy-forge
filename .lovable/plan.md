

## Restringir Sistema para Uso Exclusivo

### Objetivo
Bloquear acesso ao catálogo e todas as funcionalidades para visitantes não autenticados. Apenas usuários cadastrados por você poderão acessar o sistema.

---

### Fluxo Atual vs. Novo Fluxo

**Hoje:**
```
Visitante → Landing Page → Catálogo (livre) → Pode ver tudo
```

**Depois:**
```
Visitante → Tela de Login → [Precisa de conta] → Catálogo
```

---

### O que muda

| Rota | Antes | Depois |
|------|-------|--------|
| `/` | Landing page pública | Redireciona para login |
| `/catalog` | Acesso livre | Exige login |
| `/product/:id` | Acesso livre | Exige login |
| `/checkout` | Acesso livre | Exige login |
| `/contrato/:id` | Público (link WhatsApp) | **Permanece público** (cliente precisa ver) |
| `/admin-login` | Público | Público (é a tela de login) |
| `/admin/*` | Protegido | Protegido |

---

### Alterações Técnicas

#### 1. Atualizar ProtectedRoute.tsx

Adicionar opção para proteger rotas sem exigir role de admin:

```typescript
type ProtectedRouteProps = {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireAuth?: boolean;  // NOVO: apenas exige estar logado
};

const ProtectedRoute = ({ 
  children, 
  requireAdmin = false,
  requireAuth = false 
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin, checkingAdmin } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Se exige apenas autenticação (não admin)
  if (requireAuth && !user) {
    return <Navigate to="/admin-login" replace />;
  }

  // Se exige admin e não é admin
  if (requireAdmin && !isAdmin && !checkingAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
};
```

#### 2. Atualizar App.tsx

Envolver rotas do catálogo com `ProtectedRoute`:

```typescript
// Antes:
<Route path="/catalog" element={<Catalog />} />
<Route path="/product/:productId" element={<ProductDetail />} />
<Route path="/checkout" element={<Checkout />} />

// Depois:
<Route path="/catalog" element={
  <ProtectedRoute requireAuth>
    <Catalog />
  </ProtectedRoute>
} />
<Route path="/product/:productId" element={
  <ProtectedRoute requireAuth>
    <ProductDetail />
  </ProtectedRoute>
} />
<Route path="/checkout" element={
  <ProtectedRoute requireAuth>
    <Checkout />
  </ProtectedRoute>
} />
```

#### 3. Redirecionar Landing Page

Fazer a rota `/` verificar se há usuário logado:
- Se logado → vai para `/catalog`
- Se não logado → vai para `/admin-login`

```typescript
// App.tsx - rota raiz
<Route path="/" element={<AuthRedirect />} />

// Novo componente AuthRedirect
const AuthRedirect = () => {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  return user ? <Navigate to="/catalog" replace /> : <Navigate to="/admin-login" replace />;
};
```

---

### Resultado Final

**Para visitantes não logados:**
- Qualquer URL redireciona para `/admin-login`
- Não conseguem ver catálogo, produtos ou preços

**Para usuários logados (cadastrados por você):**
- Acesso normal ao catálogo e checkout
- Funciona como funciona hoje

**Exceção (mantida pública):**
- `/contrato/:saleId` - Link do contrato enviado por WhatsApp continua funcionando

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/ProtectedRoute.tsx` | Adicionar prop `requireAuth` |
| `src/App.tsx` | Proteger rotas `/catalog`, `/product/:id`, `/checkout` e redirecionar `/` |

---

### Observações

1. **Quem pode cadastrar usuários?** Apenas você (franqueadora) através do painel admin
2. **Clientes finais não terão conta** - Eles recebem apenas o link do contrato por WhatsApp
3. **O login será feito na mesma tela** `/admin-login` que já existe

