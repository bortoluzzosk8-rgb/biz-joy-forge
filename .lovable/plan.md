

## Remover "Forma de Pagamento" do contrato

Remover as linhas que exibem "Forma de Pagamento" nos templates de contrato e recibo em `src/lib/documentHelpers.ts`, mantendo apenas o "Valor Total".

### Alterações

**`src/lib/documentHelpers.ts`**
- Remover o bloco `payment-row` da "Forma de Pagamento" no template de contrato (linhas ~219-222)
- Remover o mesmo bloco no template de recibo (linhas ~476-479)
- Manter o tag disponível na lista de variáveis caso seja usado em templates customizados

