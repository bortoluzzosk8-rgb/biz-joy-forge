

## Plano: Adicionar Logo PlayGestor no Header do Painel Administrativo

### Objetivo

Substituir o título textual do painel (ex: "🏢 Painel Administrativo") pelo logo oficial do PlayGestor no header. O logo será visível para todos os tipos de usuários (franqueadora, vendedor, motorista, super admin).

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/assets/logo-playgestor-header.png` | Copiar o novo logo enviado |
| `src/pages/admin/AdminLayout.tsx` | Adicionar imagem do logo no header |

---

### 1. Copiar Logo para o Projeto

Copiar o arquivo do logo enviado para a pasta de assets:

```
user-uploads://ChatGPT_Image_28_de_jan._de_2026_11_57_31.png 
→ src/assets/logo-playgestor-header.png
```

---

### 2. Modificar AdminLayout.tsx

**Adicionar import do logo** no início do arquivo:

```typescript
import logoPlaygestor from "@/assets/logo-playgestor-header.png";
```

**Substituir o título textual** (linhas 133-138) pelo logo:

```text
ANTES:
<div className="flex items-center gap-2">
  <h1 className="text-2xl font-bold text-foreground">
    {getPanelTitle()}
  </h1>
</div>

DEPOIS:
<div className="flex items-center gap-3">
  <img 
    src={logoPlaygestor} 
    alt="PlayGestor" 
    className="h-10 w-auto"
  />
</div>
```

**Remover a função `getPanelTitle`** (linhas 79-86) pois não será mais necessária.

---

### Resultado Visual

- O logo do PlayGestor aparecerá no canto superior esquerdo do header
- O email do usuário e a franquia atual continuarão aparecendo abaixo do logo
- Tamanho do logo: altura de 40px (h-10), largura proporcional automática
- Funciona para todos os tipos de usuários (franqueadora, vendedor, motorista, super admin)

---

### Layout Final do Header

```text
┌─────────────────────────────────────────────────────────┐
│ [LOGO PlayGestor]              [Atualizações] [Sair]    │
│ playgestor26@gmail.com                                  │
│ 📍 Nome da Franquia - Cidade                            │
├─────────────────────────────────────────────────────────┤
│ [Locações] [Estoque] [Logística] [Clientes] ...         │
└─────────────────────────────────────────────────────────┘
```

