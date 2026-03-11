

## Corrigir bug de arredondamento nos campos Frete e Desconto

### Problema
Os campos "Valor do Frete" e "Desconto" usam `Math.round(parseFloat(value) * 100) / 100` para arredondar. Isso causa erro de precisão de ponto flutuante — por exemplo, `30.00 * 100` pode resultar em `2999.9999...`, que arredonda para `2999`, e ao dividir por 100 resulta em `29.99`.

### Solução
Remover o `Math.round(...*100)/100` e usar apenas `parseFloat(e.target.value) || 0`. Como o input já é `type="number"` com `step="0.01"`, o navegador já controla a precisão. A conversão simples com `parseFloat` mantém o valor exato digitado pelo usuário.

### Arquivo alterado
**`src/pages/admin/Sales.tsx`** — Linhas 2852 e 2868:
- `freight_value: Math.round((parseFloat(e.target.value) || 0) * 100) / 100` → `freight_value: parseFloat(e.target.value) || 0`
- `discount_value: Math.round((parseFloat(e.target.value) || 0) * 100) / 100` → `discount_value: parseFloat(e.target.value) || 0`

