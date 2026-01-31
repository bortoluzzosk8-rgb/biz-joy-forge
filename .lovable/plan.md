

## Plano: Melhorar Design da Seção Hero

### Problemas Identificados na Imagem

| Problema | Impacto |
|----------|---------|
| Benefícios empilhados verticalmente no mobile | Ocupa muito espaço, "estica" a página |
| Lista de benefícios com fundo cinza genérico | Parece "flat", sem profundidade |
| Falta de elementos visuais de destaque | Seção parece simples demais |
| Espaçamento excessivo entre elementos | Página fica longa no mobile |
| Mockup muito baixo na página | Usuário precisa rolar muito |

---

### Melhorias Propostas

#### 1. Benefícios em Layout Compacto
- No mobile: 2 colunas ao invés de lista vertical
- Cards com borda colorida ao invés de fundo cinza
- Ícones mais expressivos com gradiente

#### 2. Visual Mais Impactante
- Orbs de gradiente mais visíveis
- Adicionar elemento decorativo animado (círculos flutuantes)
- Título com tamanho ajustado para mobile

#### 3. Espaçamento Otimizado
- Reduzir padding vertical no mobile
- Aproximar elementos para menos scroll

#### 4. Botões Mais Expressivos
- Botão principal com gradiente vermelho-roxo
- Efeito de brilho no hover
- WhatsApp com cor verde característica

#### 5. Frase de Reforço Destacada
- Borda decorativa ou ícone de aspas
- Background sutil

---

### Alterações Detalhadas

**Hero.tsx - Mudanças principais:**

```tsx
// Benefícios: layout em grid 2 colunas no mobile
<ul className="mt-8 grid grid-cols-2 md:flex md:flex-wrap md:justify-center gap-3 md:gap-4">
  {benefits.map((benefit, index) => (
    <li
      key={index}
      className="flex items-start gap-2 text-sm text-foreground bg-gradient-to-br from-white to-muted/50 border border-secondary/20 px-3 py-3 rounded-xl shadow-sm"
    >
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
        <Check className="w-3 h-3 text-white" />
      </div>
      <span className="font-medium leading-snug">{benefit}</span>
    </li>
  ))}
</ul>

// Botão principal com gradiente
<Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 ...">

// WhatsApp com cor característica
<button className="... text-green-600 hover:text-green-700">
  <MessageCircle className="w-5 h-5 fill-current" />
  
// Frase de reforço com destaque visual
<div className="mt-8 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 px-6 py-4 rounded-2xl border border-primary/10">
  <p className="text-lg font-semibold text-foreground font-inter">
    "Você tem a operação. Nós organizamos o controle."
  </p>
</div>
```

---

### Espaçamentos Otimizados

| Elemento | Antes | Depois |
|----------|-------|--------|
| Padding top seção | `pt-24` | `pt-20` |
| Margin benefícios | `mt-10` | `mt-8` |
| Margin frase | `mt-10` | `mt-8` |
| Margin CTAs | `mt-10` | `mt-8` |
| Margin mockup | `mt-12` | `mt-10` |

---

### Elementos Visuais Adicionais

1. **Orbs de gradiente maiores e mais visíveis**
2. **Círculos decorativos flutuantes com animação sutil**
3. **Ícone de aspas estilizado na frase de reforço**

---

### Arquivo a Modificar

| Arquivo | Alterações |
|---------|------------|
| `src/components/landing/Hero.tsx` | Refatorar layout, espaçamentos, estilos e adicionar elementos visuais |

---

### Resultado Esperado

Após as alterações:
- Benefícios em grid compacto (2 colunas no mobile)
- Cards com borda colorida e gradiente sutil
- Botões mais vibrantes com gradiente
- WhatsApp com cor verde característica
- Frase de reforço destacada com background
- Menos espaço vertical, menos scroll
- Visual mais premium e moderno

