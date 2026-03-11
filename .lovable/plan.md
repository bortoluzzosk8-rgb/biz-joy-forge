

## Diagnóstico: "Algo deu errado" ao logar

### Causa raiz identificada

Ao fazer login, o sistema executa `checkAdminStatus` **até 3 vezes simultaneamente**:

1. `onAuthStateChange` no AuthContext dispara via `setTimeout(0)`
2. `getSession().then()` no AuthContext dispara com `await`
3. `refreshRoles()` chamado no UserLogin.tsx

Essas chamadas concorrentes causam um "flapping" de estado:
- `checkingAdmin` alterna entre `true` e `false` de forma imprevisível
- `isAdmin` pode ficar brevemente `false` enquanto outra chamada ainda roda
- Isso pode causar montagem/desmontagem rápida de componentes pesados (Sales.tsx tem quase 4000 linhas com `@ts-nocheck`)
- Qualquer erro de renderização durante esse ciclo rápido dispara o ErrorBoundary global

Além disso, o Sales.tsx importa `isFranqueado` do AuthContext, que **não existe** — sempre retorna `undefined`. Não causa crash direto, mas indica fragilidade.

### Correções

**1. AuthContext — Serializar `checkAdminStatus`**

Adicionar um guard para evitar chamadas concorrentes. Se já houver uma chamada em andamento, a nova chamada aguarda ou é ignorada:

```typescript
const checkInProgressRef = useRef(false);

const checkAdminStatus = async (userId, userEmail?) => {
  if (checkInProgressRef.current) return;
  checkInProgressRef.current = true;
  setCheckingAdmin(true);
  try { /* ... lógica atual ... */ }
  finally {
    checkInProgressRef.current = false;
    setCheckingAdmin(false);
  }
};
```

**2. AuthContext — Remover `setTimeout(0)` do `onAuthStateChange`**

Trocar o `setTimeout` por chamada direta, mas protegida pelo guard acima. Isso evita disparar `checkAdminStatus` fora de sincronia.

**3. UserLogin — Não chamar `assign-franqueadora-role` redundantemente**

O `onAuthStateChange` no AuthContext já faz isso quando detecta usuário sem role. Remover a chamada duplicada no UserLogin e confiar no `refreshRoles()`.

**4. AdminLayout — Adicionar ErrorBoundary interno**

Envolver o `<Outlet />` em um ErrorBoundary local para que erros em páginas filhas (como Sales) não derrubem toda a aplicação, mostrando uma mensagem com botão de tentar novamente em vez da tela global de erro.

**5. Sales.tsx — Remover `isFranqueado` inexistente**

Remover todas as referências a `isFranqueado` que não existe no AuthContext, evitando comportamentos imprevisíveis.

