

## Fix: "Erro ao carregar unidades" — multiple user_franchises rows

### Root cause
The `assign-franqueadora-role` edge function runs multiple times (from AuthCallback + AuthContext auto-recovery), creating duplicate `user_franchises` and `franchises` entries. When `Franchises.tsx` calls `.maybeSingle()` on `user_franchises`, it throws `PGRST116` error because multiple rows are returned.

Example: user `23f96358` has 6 `user_franchises` entries, user `e1ea6e01` has 3.

### Fixes

**1. `src/pages/admin/Franchises.tsx`** (line 72-76)
- Replace `.maybeSingle()` with `.limit(1)` and take the first element from the array
- This prevents the crash immediately regardless of duplicate data

**2. `supabase/functions/assign-franqueadora-role/index.ts`** (line 88-93)
- Before creating a new franchise, check if user already has a `user_franchises` entry more robustly
- The current check uses `.maybeSingle()` which also fails with duplicates — change to `.limit(1)`

**3. `src/hooks/useTenantFranchises.ts`** (same fix)
- Also uses `.maybeSingle()` on `user_franchises` — change to `.limit(1)`

**4. Database cleanup** (migration)
- Remove duplicate `user_franchises` entries, keeping only the first one per user
- Remove orphan `franchises` entries that were created as duplicates

### Technical detail

```typescript
// Before (crashes with multiple rows):
const { data, error } = await supabase
  .from("user_franchises")
  .select("franchise_id")
  .eq("user_id", user.id)
  .maybeSingle();

// After (safe):
const { data: rows, error } = await supabase
  .from("user_franchises")
  .select("franchise_id")
  .eq("user_id", user.id)
  .limit(1);
const data = rows?.[0] || null;
```

