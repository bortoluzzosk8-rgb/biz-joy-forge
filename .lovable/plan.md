

## Plano: Adicionar Ícone de Visualização no Campo "Confirmar Senha"

### Problema

O campo "Senha" possui o ícone de olhinho para mostrar/esconder a senha, mas o campo "Confirmar senha" não possui esse mesmo recurso.

### Solução

Adicionar o mesmo botão de toggle de visibilidade no campo "Confirmar senha", seguindo o mesmo padrão visual do campo "Senha".

---

### Alteração no Código

**Arquivo:** `src/pages/UserRegister.tsx`

Modificar o campo "Confirmar senha" (linhas 251-262) para incluir o wrapper `relative` e o botão de toggle:

**Antes:**
```typescript
<div className="space-y-2">
  <Label htmlFor="confirmPassword">Confirmar senha</Label>
  <Input
    id="confirmPassword"
    type={showPassword ? "text" : "password"}
    placeholder="Digite a senha novamente"
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    disabled={loading}
    autoComplete="new-password"
  />
</div>
```

**Depois:**
```typescript
<div className="space-y-2">
  <Label htmlFor="confirmPassword">Confirmar senha</Label>
  <div className="relative">
    <Input
      id="confirmPassword"
      type={showPassword ? "text" : "password"}
      placeholder="Digite a senha novamente"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      disabled={loading}
      autoComplete="new-password"
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
    >
      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  </div>
</div>
```

---

### Comportamento

- O mesmo state `showPassword` controla ambos os campos
- Ao clicar em qualquer um dos olhinhos, ambas as senhas ficam visíveis/ocultas simultaneamente
- Isso facilita a comparação visual das senhas digitadas

---

### Arquivo a Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/UserRegister.tsx` | Adicionar botão de toggle no campo "Confirmar senha" |

