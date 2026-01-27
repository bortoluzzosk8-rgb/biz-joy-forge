

## Plano: Aplicar Identidade Visual PlayGestor

O sistema vai ser rebranded de "Engbrink" para **PlayGestor** com a nova paleta de cores e tipografia.

---

### Identidade Visual PlayGestor

| Elemento | Valor |
|----------|-------|
| **Nome** | PlayGestor |
| **Cor Primária** | #E53935 (Vermelho) |
| **Cor Secundária** | #6C4DF6 (Roxo/Violeta) |
| **Cor de Fundo Clara** | #F2F2F2 (Cinza claro) |
| **Cor de Fundo Escura** | #1F1F1F (Preto/Cinza escuro) |
| **Fonte** | Nunito Sans |

---

### Arquivos a Modificar

#### 1. Logo do PlayGestor
- Copiar a imagem enviada para `src/assets/logo-playgestor.png`
- Substituir todas as referências de `logo-engbrink.jpg` para o novo logo

#### 2. Atualizar Cores CSS (`src/index.css`)
Converter cores HEX para HSL:
- **#E53935** → `4 82% 55%` (vermelho - primária)
- **#6C4DF6** → `252 90% 64%` (roxo - secundária)
- **#F2F2F2** → `0 0% 95%` (cinza claro)
- **#1F1F1F** → `0 0% 12%` (cinza escuro)

#### 3. Adicionar Fonte Nunito Sans (`index.html`)
```html
<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

#### 4. Atualizar Tailwind Config (`tailwind.config.ts`)
- Trocar `font-poppins` para `font-nunito`

#### 5. Atualizar Componentes Landing Page
| Arquivo | Mudança |
|---------|---------|
| `Header.tsx` | Trocar logo para PlayGestor |
| `Footer.tsx` | Trocar logo e nome para PlayGestor |
| `Hero.tsx` | Ajustar textos se necessário |

#### 6. Atualizar Páginas de Auth
| Arquivo | Mudança |
|---------|---------|
| `UserLogin.tsx` | Trocar logo para PlayGestor |
| `UserRegister.tsx` | Trocar logo para PlayGestor |

---

### Paleta de Cores Final

```css
:root {
  --primary: 4 82% 55%;           /* #E53935 - Vermelho */
  --primary-foreground: 0 0% 100%; /* Branco */
  
  --secondary: 252 90% 64%;       /* #6C4DF6 - Roxo */
  --secondary-foreground: 0 0% 100%; /* Branco */
  
  --background: 0 0% 95%;          /* #F2F2F2 - Cinza claro */
  --foreground: 0 0% 12%;          /* #1F1F1F - Cinza escuro */
  
  --accent: 252 90% 64%;           /* Roxo como accent */
  --accent-foreground: 0 0% 100%;
}
```

---

### Resultado Visual Esperado

- **Header**: Logo PlayGestor no topo
- **Botões**: Vermelho (#E53935) como cor principal
- **Destaques**: Roxo (#6C4DF6) como cor secundária
- **Fundo**: Cinza claro (#F2F2F2) para áreas claras
- **Texto**: Preto/cinza escuro (#1F1F1F)
- **Fonte**: Nunito Sans em todo o sistema

---

### Arquivos Modificados

| Arquivo | Ação |
|---------|------|
| `src/assets/logo-playgestor.png` | Novo arquivo - logo PlayGestor |
| `src/index.css` | Atualizar variáveis de cores |
| `tailwind.config.ts` | Adicionar fonte Nunito Sans |
| `index.html` | Importar Google Fonts |
| `src/components/landing/Header.tsx` | Trocar logo |
| `src/components/landing/Footer.tsx` | Trocar logo e nome |
| `src/pages/UserLogin.tsx` | Trocar logo |
| `src/pages/UserRegister.tsx` | Trocar logo |

