

## Plano: Reorganizar Header Mobile do Painel Admin

### Problemas Identificados

1. **Banner do trial** quebra em múltiplas linhas de forma confusa
2. **Logo muito grande** para telas pequenas (h-14 = 56px)
3. **Layout do cabeçalho desorganizado** - email, ícones e botão Sair ficam amontoados
4. **Botão "Sair"** parece cortado e com espaçamento inadequado

---

### Solução

Criar um layout responsivo que reorganiza os elementos no mobile:

**Mobile:**
- Banner do trial em layout vertical/compacto
- Logo menor (h-10 ao invés de h-14)
- Layout em duas linhas: logo + botão Sair na primeira, info do usuário na segunda
- Botões de ação (Atualizações, Assinaturas) apenas como ícones

**Desktop:**
- Mantém o layout atual

---

### Arquivo a Modificar

`src/pages/admin/AdminLayout.tsx`

---

### Alterações Detalhadas

#### 1. Banner do Trial (linhas 85-101)

**Antes:** Texto longo em uma única linha horizontal
**Depois:** Layout vertical no mobile com texto empilhado

```tsx
<div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2">
  <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-amber-600 dark:text-amber-400 text-sm text-center">
    <div className="flex items-center gap-1">
      <Clock className="h-4 w-4 shrink-0" />
      <span>
        Você tem <strong>{subscriptionStatus.trialDaysLeft} dias</strong> restantes
      </span>
    </div>
    <Button variant="link" size="sm" className="...">
      Gerenciar assinatura
    </Button>
  </div>
</div>
```

#### 2. Header Principal (linhas 126-173)

**Antes:** Uma linha horizontal com tudo junto
**Depois:** Layout empilhado no mobile

```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
  {/* Linha 1: Logo + Botões de ação */}
  <div className="flex items-center justify-between">
    <img 
      src={logoPlaygestor} 
      alt="PlayGestor" 
      className="h-10 sm:h-14 w-auto"
    />
    <div className="flex items-center gap-1 sm:gap-2">
      <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3">
        <Megaphone className="w-4 h-4" />
        <span className="hidden sm:inline ml-1">Atualizações</span>
      </Button>
      
      {isFranqueadora && (
        <Button variant="ghost" size="icon" className="w-8 h-8 sm:w-auto sm:h-auto sm:px-3">
          <CreditCard className="w-4 h-4" />
          <span className="hidden sm:inline ml-1">Assinaturas</span>
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleLogout}
        className="border-[#E53935] text-[#E53935] px-2 sm:px-4"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline ml-1">Sair</span>
      </Button>
    </div>
  </div>
  
  {/* Linha 2: Info do usuário */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-0.5">
    <p className="text-xs sm:text-sm text-muted-foreground truncate">{user?.email}</p>
    {userFranchise && (
      <p className="text-xs sm:text-sm font-medium text-primary">
        📍 {userFranchise.name} - {userFranchise.city}
      </p>
    )}
  </div>
</div>
```

---

### Comparação Visual

```text
ANTES (Mobile):                      DEPOIS (Mobile):
┌─────────────────────────────┐      ┌─────────────────────────────┐
│ ⏰ Você tem 7 dias          │      │ ⏰ Você tem 7 dias restantes │
│ ⏰ restantes do período de  │      │    Gerenciar assinatura     │
│    teste.  Gerenciar...     │      ├─────────────────────────────┤
├─────────────────────────────┤      │ [Logo]      [📢][💳][Sair] │
│ [Logo Grande]               │      │ user@email.com              │
│ user@email.com [📢][💳]    │      │ 📍 PLAY GESTOR - CEDRAL     │
│ 📍 PLAY GESTOR    [ Sair ] │      ├─────────────────────────────┤
│                    ^cortado │      │ [Locações ▼]                │
├─────────────────────────────┤      └─────────────────────────────┘
│ [Locações ▼]                │      
└─────────────────────────────┘      Logo menor, layout organizado
                                     Botão Sair completo
Confuso e desorganizado              Botões de ação como ícones
```

---

### Resumo das Mudanças

| Elemento | Mobile Antes | Mobile Depois |
|----------|--------------|---------------|
| Logo | h-14 (56px) | h-10 (40px) |
| Banner trial | Texto quebrado | Layout vertical centralizado |
| Botão Sair | Cortado | Apenas ícone (ou ícone + texto) |
| Botões Atualizações/Assinaturas | Escondidos | Ícones pequenos visíveis |
| Info usuário | Junto com logo | Linha separada abaixo |

---

### Resultado Esperado

- Header mais limpo e organizado no mobile
- Logo com tamanho adequado
- Banner do trial legível
- Todos os botões visíveis e clicáveis
- Informações do usuário bem posicionadas
- Desktop permanece igual

