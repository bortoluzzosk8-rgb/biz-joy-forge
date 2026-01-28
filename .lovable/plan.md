

## Plano: Remover Seção de Divisão de Lucros do Formulário de Unidades

### Contexto

A seção "Configuração de Divisão de Lucros" com os campos % Franqueado, % Franqueadora e Equilíbrio Inicial não é mais necessária no sistema SaaS simplificado.

---

### Alterações Necessárias

| Arquivo | Ação |
|---------|------|
| `src/pages/admin/Franchises.tsx` | Remover seção de divisão de lucros do formulário e do estado |

---

### Seção Técnica

#### O que será removido:

1. **Do tipo Franchise** (linhas 29-31):
   - `franqueado_percentage`
   - `franqueadora_percentage`
   - `equilibrio_inicial`

2. **Do estado formData** (linhas 58-60):
   - Remover campos de percentuais e equilíbrio

3. **Do handleSubmit/franchiseData** (linhas 131-133):
   - Remover campos do objeto enviado ao banco

4. **Do handleEdit** (linhas 177-179):
   - Remover campos ao carregar dados para edição

5. **Do resetForm** (linhas 214-216):
   - Remover campos do reset

6. **Do JSX** (linhas 371-409):
   - Remover completamente a `<div>` com a seção de configuração de divisão de lucros

---

### Resultado Esperado

O formulário de cadastro/edição de unidades terá apenas:
- Nome da Unidade
- Cidade
- Estado
- Telefone
- E-mail
- Status
- Endereço
- CNPJ
- CEP

Sem nenhuma referência a divisão de lucros ou percentuais.

