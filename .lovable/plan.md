
## Plano: Corrigir Erro 404 no /admin/dashboard

### Diagnóstico

O usuário está acessando `/admin/dashboard` que não existe no sistema. O Dashboard financeiro foi removido e não há redirecionamento para essa URL antiga.

**Rotas atuais definidas:**
- `/admin` → redireciona para `/admin/rentals`
- `/admin/dashboard` → **NÃO EXISTE** (causa 404)

### Causa Provável

O navegador pode ter:
- Cache antigo armazenado
- Bookmark salvo para `/admin/dashboard`
- Link direto para essa rota

### Solução

Adicionar um redirecionamento de `/admin/dashboard` para `/admin/rentals` no arquivo `App.tsx`.

---

### Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/App.tsx` | Adicionar rota de redirecionamento |

---

### Alteração

Adicionar nova linha dentro das rotas do admin:

```typescript
<Route path="/admin" element={...}>
  <Route index element={<Navigate to="rentals" replace />} />
  <Route path="dashboard" element={<Navigate to="rentals" replace />} />  // NOVA
  <Route path="products" element={<Products />} />
  // ... demais rotas
</Route>
```

---

### Resultado

- Usuários que acessarem `/admin/dashboard` serão automaticamente redirecionados para `/admin/rentals`
- Sem erro 404
- Compatibilidade com bookmarks e links antigos
