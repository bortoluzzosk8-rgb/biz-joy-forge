

## Corrigir ultimo `.single()` em user_franchises

### Problema
O `AuthContext.tsx` linha 100 ainda usa `.single()` ao buscar `user_franchises`. Se um usuario com duplicatas (anteriores a constraint unique) faz login, o `.single()` retorna erro PGRST116. Apesar de estar dentro de try/catch, isso pode interagir mal com o state update e causar o crash do ErrorBoundary em cenarios especificos de timing.

O `useSubscriptionStatus.ts` linha 36 tambem usa `.maybeSingle()` que tem o mesmo risco.

### Correcoes

**1. `src/contexts/AuthContext.tsx` (linha 96-100)**
- Trocar `.single()` por `.limit(1)` e pegar o primeiro elemento do array
```typescript
const { data: franchiseRows } = await supabase
  .from('user_franchises')
  .select('franchise_id, franchises(id, name, city)')
  .eq('user_id', userId)
  .limit(1);
const franchiseData = franchiseRows?.[0] || null;
```

**2. `src/hooks/useSubscriptionStatus.ts` (linha 32-36)**
- Trocar `.maybeSingle()` por `.limit(1)` e pegar o primeiro elemento
```typescript
const { data: ufRows } = await supabase
  .from('user_franchises')
  .select('franchise_id')
  .eq('user_id', userId)
  .limit(1);
const ufData = ufRows?.[0] || null;
```

Isso alinha esses dois arquivos com a mesma correcao ja aplicada em `Franchises.tsx` e `useTenantFranchises.ts`.

