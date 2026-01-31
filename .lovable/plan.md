

## Plano: Remover Logo Padrão do Catálogo

### Problema Atual

Quando o cliente não configura nenhum logo em "Aparência do Catálogo", o sistema exibe automaticamente o logo do PlayGestor como fallback.

**Comportamento desejado:** O catálogo não deve exibir nenhum logo até que o cliente faça upload de um arquivo.

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/hooks/useSettings.tsx` | Mudar valor padrão de `logoUrl` para string vazia |
| `src/pages/Catalog.tsx` | Renderizar logo condicionalmente |
| `src/pages/PublicCatalog.tsx` | Renderizar logo condicionalmente |

---

### Alterações Detalhadas

#### 1. `src/hooks/useSettings.tsx`

**Estado inicial (linha 30):**
```tsx
// Antes:
logoUrl: '/src/assets/logo-playgestor-novo.png',

// Depois:
logoUrl: '',
```

**Fallback na função loadSettings (linha 70):**
```tsx
// Antes:
logoUrl: data.logo_url || '/src/assets/logo-playgestor-novo.png',

// Depois:
logoUrl: data.logo_url || '',
```

---

#### 2. `src/pages/Catalog.tsx`

**Header com logo (linhas 229-233):**
```tsx
// Antes:
<img 
  src={settings.logoUrl} 
  alt="Logo" 
  className="h-10 sm:h-14 md:h-16 object-contain shrink-0"
/>

// Depois (renderização condicional):
{settings.logoUrl && (
  <img 
    src={settings.logoUrl} 
    alt="Logo" 
    className="h-10 sm:h-14 md:h-16 object-contain shrink-0"
  />
)}
```

---

#### 3. `src/pages/PublicCatalog.tsx`

**Header com logo (linhas 250-254):**
```tsx
// Antes:
<img 
  src={settings.logoUrl} 
  alt="Logo" 
  className="h-10 sm:h-14 md:h-16 object-contain shrink-0"
/>

// Depois (renderização condicional):
{settings.logoUrl && (
  <img 
    src={settings.logoUrl} 
    alt="Logo" 
    className="h-10 sm:h-14 md:h-16 object-contain shrink-0"
  />
)}
```

---

### Resultado Esperado

- Sem configuração: Header exibe apenas o título do catálogo, sem logo
- Com configuração: Header exibe o logo personalizado + título

### Layout Visual

```text
[ ANTES - sem config ]          [ DEPOIS - sem config ]
+---------------------------+    +---------------------------+
| [Logo PG] Catálogo        |    |          Catálogo         |
+---------------------------+    +---------------------------+

[ COM logo configurado - permanece igual ]
+---------------------------+
| [Logo Cliente] Catálogo   |
+---------------------------+
```

