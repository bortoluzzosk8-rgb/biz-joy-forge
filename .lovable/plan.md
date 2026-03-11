

## Redirecionar motorista para Logística ao entrar no painel

### Problema
Quando o motorista acessa `/admin`, ele é redirecionado automaticamente para `/admin/rentals` (Locações), mas deveria ir direto para `/admin/logistics` (Logística) — que é a única aba que ele tem acesso.

### Alterações

**`src/App.tsx`** (linha 93)
- Substituir o redirect fixo `<Navigate to="rentals" />` por um componente que verifica o role do usuário:
  - Se `isMotorista` → redireciona para `logistics`
  - Se `isSuperAdmin` → redireciona para `leads`
  - Caso contrário → redireciona para `rentals`

**`src/pages/admin/AdminLayout.tsx`**
- Adicionar um `useEffect` que redireciona o motorista para `/admin/logistics` caso ele tente acessar qualquer outra rota que não seja logistics. Isso garante que mesmo digitando a URL manualmente, ele só veja a logística.

