

## Plano: Redesign Moderno da Landing Page PlayGestor

### Diagnóstico do Design Atual

O design atual apresenta os seguintes problemas:

| Problema | Impacto |
|----------|---------|
| Cores conflitantes | Vermelho + Roxo usados sem hierarquia clara, criando ruído visual |
| Fundo acinzentado | Background `hsl(0 0% 95%)` muito apagado, sem vida |
| Tipografia sem destaque | Nunito Sans usado uniformemente, sem variação de peso expressivo |
| Hero genérico | Mockup abstrato ao invés de preview real do produto |
| Seções monótonas | Todas as seções parecem iguais, sem ritmo visual |
| Gradientes fracos | Gradientes sutis demais, não criam impacto |

---

### Nova Paleta de Cores

Mantendo a identidade PlayGestor (vermelho + roxo), mas com aplicação estratégica:

```css
/* Nova paleta refinada */
--background: 0 0% 100%;           /* Fundo branco limpo */
--foreground: 240 10% 10%;          /* Texto quase preto, elegante */

--primary: 4 82% 56%;               /* Vermelho PlayGestor (botões primários) */
--primary-foreground: 0 0% 100%;

--secondary: 252 85% 62%;           /* Roxo PlayGestor (destaques/accent) */
--secondary-foreground: 0 0% 100%;

--accent: 252 85% 62%;              /* Roxo para elementos de destaque */
--accent-foreground: 0 0% 100%;

--muted: 240 5% 96%;                /* Cinza suave para backgrounds */
--muted-foreground: 240 5% 40%;

--card: 0 0% 100%;
--card-foreground: 240 10% 10%;

--border: 240 6% 90%;
```

---

### Nova Tipografia

Adicionar fonte Inter para títulos (mais moderna e impactante):

```html
<!-- index.html -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Nunito+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

```typescript
// tailwind.config.ts
fontFamily: {
  nunito: ['Nunito Sans', 'sans-serif'],
  inter: ['Inter', 'sans-serif'],
}
```

---

### Alterações por Componente

#### 1. Header.tsx
- Navegação com texto mais leve
- Botões com cores definidas: "LOGIN" ghost, "CRIAR CONTA" vermelho
- Header com blur mais suave no scroll

#### 2. Hero.tsx
- Título com gradiente vermelho → roxo
- Subtítulo com peso mais leve
- Botão principal vermelho vibrante com hover lift
- Botão secundário com borda roxa
- Substituir mockup genérico por preview real do sistema (screenshot ou imagem)
- Adicionar padrão de pontos sutil no fundo
- Animações de fade-in escalonadas

#### 3. Segments.tsx
- Cards com hover mais pronunciado (lift effect)
- Ícones com gradiente colorido
- Grid com espaçamento mais generoso

#### 4. Problems.tsx
- Fundo escuro (dark section) para contraste
- Cards com borda vermelha sutil
- Tipografia branca sobre fundo escuro

#### 5. Solutions.tsx
- Cards com glass effect (glassmorphism sutil)
- Ícones coloridos com gradiente
- Hover com glow roxo

#### 6. BeforeAfter.tsx
- Layout lado a lado com animação
- "ANTES" com fundo vermelho-escuro
- "DEPOIS" com fundo roxo-escuro
- Adicionar seta ou elemento de transição

#### 7. Plans.tsx
- Cards com bordas arredondadas maiores
- Plano destacado com glow roxo
- Badge "Mais popular" com gradiente
- Preços com tipografia maior e mais bold

#### 8. FAQ.tsx
- Accordion mais elegante
- Fundo limpo branco
- Animações suaves

#### 9. Footer.tsx
- Fundo com gradiente escuro (não preto puro)
- Logo atualizado (já corrigido)
- Links com hover colorido

---

### Novas Classes CSS (index.css)

```css
/* Gradiente de texto */
.text-gradient-brand {
  background: linear-gradient(135deg, hsl(4 82% 56%) 0%, hsl(252 85% 62%) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Glow effect */
.glow-primary {
  box-shadow: 0 0 60px -15px hsl(4 82% 56% / 0.4);
}

.glow-secondary {
  box-shadow: 0 0 60px -15px hsl(252 85% 62% / 0.4);
}

/* Glass card refinado */
.glass-card-modern {
  background: hsl(0 0% 100% / 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid hsl(0 0% 100% / 0.3);
}

/* Dark section */
.dark-section {
  background: linear-gradient(135deg, hsl(240 10% 8%) 0%, hsl(252 30% 12%) 100%);
}

/* Hover lift melhorado */
.hover-lift-strong {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift-strong:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px -12px hsl(var(--primary) / 0.25);
}
```

---

### Arquivos a Modificar

| Arquivo | Alterações |
|---------|------------|
| `index.html` | Adicionar fonte Inter |
| `tailwind.config.ts` | Adicionar font-family inter |
| `src/index.css` | Refinar paleta `.landing-theme`, adicionar novas classes utilitárias |
| `src/components/landing/Header.tsx` | Estilização refinada |
| `src/components/landing/Hero.tsx` | Título com gradiente, botões vibrantes, fundo com padrão |
| `src/components/landing/Segments.tsx` | Cards com hover lift, ícones coloridos |
| `src/components/landing/Problems.tsx` | Seção escura para contraste |
| `src/components/landing/Solutions.tsx` | Cards com glass effect e glow |
| `src/components/landing/BeforeAfter.tsx` | Cores mais vibrantes, transição visual |
| `src/components/landing/Plans.tsx` | Cards arredondados, glow no destaque |
| `src/components/landing/FAQ.tsx` | Estilização mais elegante |
| `src/components/landing/Footer.tsx` | Fundo gradiente escuro, logo correto |

---

### Resultado Visual Esperado

Após as alterações:
- Página com fundo branco limpo (não acinzentado)
- Títulos com gradiente vermelho-roxo chamativo
- Seções alternando entre claro e escuro para ritmo visual
- Cards com efeitos de hover modernos (lift + glow)
- Botões vibrantes com cores da marca
- Tipografia mais expressiva com variação de pesos
- Animações sutis mas impactantes
- Design profissional seguindo tendências SaaS 2026

