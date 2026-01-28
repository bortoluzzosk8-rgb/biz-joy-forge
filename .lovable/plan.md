

## Plano: Adicionar Botão "Assinaturas" no Menu do Painel Administrativo

### O Que Será Feito

Adicionar um novo item de menu chamado **"Assinaturas"** ao lado de "Config" na barra de navegação do painel administrativo. Esse botão vai redirecionar para a página `/assinatura` que já existe.

### Localização

O botão ficará logo após "Config" (último item atual), visível apenas para usuários com role **franqueadora**.

### Layout Visual

```
[Dashboard] [Locações] [Estoque] ... [Relatório] [Config] [Assinaturas]
                                                              ↑ NOVO
```

### Alteração Necessária

**Arquivo:** `src/pages/admin/AdminLayout.tsx`

1. Importar o ícone `CreditCard` do lucide-react (representa bem assinaturas/pagamentos)

2. Adicionar novo item no array `clientMenuItems`:
```typescript
{ value: "subscription", label: "Assinaturas", icon: CreditCard, roles: ["franqueadora"] },
```

3. Como a rota `/assinatura` está **fora** do `/admin/*`, o `handleTabChange` precisa ser ajustado para navegar corretamente para essa rota especial

### Tratamento Especial

Como a página de assinatura está em `/assinatura` (e não `/admin/subscription`), será necessário:
- Verificar se o valor clicado é "subscription"
- Se sim, navegar para `/assinatura` em vez de `/admin/subscription`

### Resultado Esperado

- Botão "Assinaturas" aparece no menu para franqueadoras
- Ao clicar, usuário é redirecionado para a página de gerenciamento de assinatura
- Funciona tanto no desktop (tabs) quanto no mobile (select dropdown)

