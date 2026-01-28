

## Plano: Anexar Comprovante ao Adicionar Pagamento (Opcional)

### Situação Atual

Atualmente, o fluxo é:
1. Adicionar pagamento → Pagamento criado como "Pendente"
2. Clicar em "Comprovante" na lista → Anexar comprovante
3. Clicar em "Confirmar" → **Só funciona se tiver comprovante**

O usuário quer poder:
- Anexar comprovante **diretamente** ao adicionar o pagamento
- Confirmar pagamento **com ou sem** comprovante (opcional)

---

### Arquivos a Modificar

| Arquivo | Ação |
|---------|------|
| `src/components/admin/PaymentManager.tsx` | Adicionar campo de upload no formulário + tornar comprovante opcional |
| `src/components/admin/QuickPaymentDrawer.tsx` | Adicionar campo de upload no formulário + tornar comprovante opcional |

---

### Alterações Detalhadas

#### 1. PaymentManager.tsx

**Adicionar estado para arquivo no formulário:**
```typescript
const [newPaymentFile, setNewPaymentFile] = useState<File | null>(null);
const [newPaymentPreview, setNewPaymentPreview] = useState<string | null>(null);
```

**Adicionar seção de upload no formulário de novo pagamento (após "Observações"):**
- Área de drag & drop ou clique para selecionar imagem
- Preview da imagem selecionada
- Botão para remover o arquivo se quiser

**Modificar `handleAddPayment` para:**
- Se tiver arquivo selecionado, fazer upload para storage
- Salvar pagamento já com `receipt_url` preenchido
- Limpar estado do arquivo após adicionar

**Tornar comprovante opcional:**
- Remover validação que exige `receipt_url` em `handleMarkAsPaid`
- Remover validação que exige `localReceiptPreview` em `handleLocalMarkAsPaid`
- Manter o botão "Comprovante" visível para quem quiser anexar depois

**Remover mensagens de "Anexe o comprovante":**
- Remover a mensagem "⚠️ Anexe o comprovante" da lista de pagamentos
- O botão "Confirmar" ficará sempre habilitado (sem `disabled`)

---

#### 2. QuickPaymentDrawer.tsx

Mesmas alterações:

**Adicionar estado para arquivo:**
```typescript
const [newPaymentFile, setNewPaymentFile] = useState<File | null>(null);
const [newPaymentPreview, setNewPaymentPreview] = useState<string | null>(null);
```

**Adicionar área de upload no formulário de adicionar pagamento**

**Modificar `handleAddPayment`:**
- Fazer upload se tiver arquivo
- Salvar com `receipt_url` se aplicável

**Tornar comprovante opcional em `handleMarkAsPaid`:**
- Remover a verificação `if (!payment?.receipt_url)`

---

### Interface do Campo de Upload

O campo de upload no formulário ficará assim:

```text
┌─────────────────────────────────────────────────┐
│  📎 Comprovante (opcional)                      │
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │   [Ícone Upload]                          │  │
│  │   Arraste uma imagem ou clique            │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  (ou se tiver preview)                          │
│  ┌──────┐                                       │
│  │ img  │  [X] Remover                          │
│  └──────┘                                       │
└─────────────────────────────────────────────────┘
```

---

### Resultado Esperado

Após as alterações:
- Ao adicionar um pagamento, haverá um campo opcional para anexar comprovante
- Se anexar, o pagamento já será salvo com o comprovante
- Se não anexar, pode confirmar o pagamento do mesmo jeito
- O botão "Comprovante" na lista continua disponível para anexar depois, se quiser
- Não haverá mais bloqueio ou mensagem de erro pedindo comprovante

