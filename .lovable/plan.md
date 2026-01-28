

## Plano: Reposicionar Botões "Assinaturas" e "Atualizações"

### Situação Atual

Os botões estão misturados com os itens de navegação do sistema (Dashboard, Locações, Estoque, etc.), o que não faz sentido visualmente porque:
- São funcionalidades de **conta/perfil** do usuário
- Não controlam a operação da unidade

### Mudança Proposta

Mover os botões para a área do cabeçalho, ao lado do botão "Sair", com tamanho reduzido.

### Layout Visual

**Antes:**
```
+--------------------------------------------------+
| 🏢 Painel Administrativo              [ Sair ]   |
| email@exemplo.com                                |
+--------------------------------------------------+
| [Dashboard][Locações][...][Config][Assinaturas][Atualizações] |
+--------------------------------------------------+
```

**Depois:**
```
+----------------------------------------------------------+
| 🏢 Painel Administrativo    [Assinaturas][Atualizações][ Sair ] |
| email@exemplo.com                                        |
+----------------------------------------------------------+
| [Dashboard][Locações][Estoque][...][Config]              |
+----------------------------------------------------------+
```

### Detalhes da Implementação

**Arquivo:** `src/pages/admin/AdminLayout.tsx`

1. **Remover** "Assinaturas" e "Atualizações" dos arrays `clientMenuItems` e `superAdminMenuItems`

2. **Adicionar** botões separados na área do header, ao lado do botão "Sair":
   - Botões menores usando `size="sm"` e `variant="ghost"`
   - Ícones pequenos (CreditCard e Megaphone)
   - Visíveis conforme o role do usuário

3. **Estrutura do Header**:
```
<div className="flex items-center gap-2">
  {/* Botão Atualizações - visível para todos */}
  <Button variant="ghost" size="sm" onClick={() => navigate('/admin/updates')}>
    <Megaphone className="w-4 h-4" />
    <span className="hidden sm:inline ml-1">Atualizações</span>
  </Button>
  
  {/* Botão Assinaturas - apenas franqueadora */}
  {isFranqueadora && (
    <Button variant="ghost" size="sm" onClick={() => navigate('/assinatura')}>
      <CreditCard className="w-4 h-4" />
      <span className="hidden sm:inline ml-1">Assinaturas</span>
    </Button>
  )}
  
  {/* Botão Sair */}
  <Button variant="outline" onClick={handleLogout}>
    <LogOut className="w-4 h-4 mr-2" />
    Sair
  </Button>
</div>
```

### Comportamento no Mobile

- Em telas pequenas, os botões mostram apenas o ícone (sem texto)
- O texto aparece em telas maiores (`sm:inline`)
- Mantém a área compacta e funcional

### Visibilidade por Role

| Botão | Franqueadora | Vendedor | Motorista | Super Admin |
|-------|--------------|----------|-----------|-------------|
| Atualizações | ✅ | ✅ | ✅ | ✅ |
| Assinaturas | ✅ | ❌ | ❌ | ❌ |

### Resultado Esperado

- Menu de navegação mais limpo, focado na gestão da unidade
- Botões de conta/perfil agrupados logicamente no canto superior direito
- Visual mais organizado e intuitivo
- Mantém funcionalidade em mobile

