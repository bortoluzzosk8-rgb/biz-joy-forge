

## 🚀 Plano: Migrar Landing Page do PlayGestor

Vou integrar a landing page do outro projeto Lovable neste projeto, mantendo toda a estrutura administrativa já existente.

---

### 📦 O que será migrado

A landing page completa com **9 componentes**:
1. **Header** - Menu de navegação com logo e links
2. **Hero** - Seção principal com título, benefícios e CTAs
3. **Segments** - Grid de segmentos atendidos (festas, móveis, equipamentos, etc.)
4. **Problems** - Problemas que o sistema resolve
5. **Solutions** - Funcionalidades do sistema
6. **BeforeAfter** - Comparação antes/depois de usar o sistema
7. **Plans** - Cards de planos (Básico, Pro, Multiusuário)
8. **FAQ** - Perguntas frequentes com accordion
9. **Footer** - Rodapé com links e contato WhatsApp

---

### 🔧 Adaptações necessárias

- **Logo**: O Header e Footer usam `logo-playgestor.png` - vou verificar se existe no projeto atual ou usar o logo existente (`logo-engbrink.jpg`)
- **Hook useAdmin**: O Header original usava um hook `useAdmin` que não existe. Vou adaptar para usar o `useAuth` que já existe neste projeto
- **Navegação**: Os botões "Acessar sistema" e "Criar conta" serão linkados às rotas existentes (`/admin-login` e `/catalog`)
- **WhatsApp**: Configurar o número real de WhatsApp para contato

---

### 🎯 Resultado esperado

- **Página inicial (/)**: Landing page completa e profissional
- **Login admin (/admin-login)**: Mantido como está
- **Demais rotas**: Inalteradas
- Visitantes veem a landing page e podem se cadastrar ou fazer login
- Usuários logados podem acessar diretamente o painel administrativo

