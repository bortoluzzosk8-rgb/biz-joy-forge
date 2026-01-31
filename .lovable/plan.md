

## Plano: Adicionar Upload de Imagem para Equipamentos no Estoque

### Objetivo

Adicionar a funcionalidade de upload de imagem nos modais de **criação** e **edição** de equipamentos na Gestão de Estoque.

---

### O que já funciona

| Componente | Status |
|------------|--------|
| Campo `image_url` na tabela `inventory_items` | ✅ Existe |
| Exibição de imagem no card (KanbanBoard) | ✅ Funciona |
| Upload de imagem no modal | ❌ Não existe |

---

### Mudanças Necessárias

#### 1. Criar Bucket de Storage

Criar um bucket público para armazenar as imagens dos equipamentos:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('inventory-images', 'inventory-images', true);

-- Política para usuários autenticados fazerem upload
CREATE POLICY "Authenticated users can upload inventory images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'inventory-images');

-- Política para acesso público às imagens
CREATE POLICY "Public can view inventory images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'inventory-images');

-- Política para usuários autenticados deletarem suas imagens
CREATE POLICY "Authenticated users can delete inventory images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'inventory-images');
```

#### 2. Adicionar Estados no Componente Stock.tsx

Novos estados para gerenciar as imagens:

```tsx
// Novo equipamento
const [equipImageUrls, setEquipImageUrls] = useState<string[]>([]);
const [uploadingImage, setUploadingImage] = useState(false);

// Edição
const [editImageUrls, setEditImageUrls] = useState<string[]>([]);
```

#### 3. Criar Função de Upload

```tsx
async function uploadImage(file: File): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `${fileName}`;
  
  const { error } = await supabase.storage
    .from('inventory-images')
    .upload(filePath, file);
  
  if (error) {
    toast.error('Erro ao fazer upload da imagem');
    return null;
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('inventory-images')
    .getPublicUrl(filePath);
  
  return publicUrl;
}
```

#### 4. Adicionar Campo de Upload nos Modais

**Modal de Novo Equipamento** (após campo Unidade):

```tsx
<div className="sm:col-span-2">
  <Label>Imagem do Equipamento</Label>
  <div className="mt-1 space-y-2">
    {equipImageUrls.length > 0 && (
      <div className="flex gap-2 flex-wrap">
        {equipImageUrls.map((url, idx) => (
          <div key={idx} className="relative">
            <img src={url} className="w-20 h-20 object-cover rounded border" />
            <button
              type="button"
              onClick={() => removeEquipImage(idx)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    )}
    <Input
      type="file"
      accept="image/*"
      onChange={handleEquipImageUpload}
      disabled={uploadingImage}
    />
    {uploadingImage && <span className="text-sm text-muted-foreground">Enviando...</span>}
  </div>
</div>
```

#### 5. Atualizar Funções de Salvamento

Incluir `image_url` no objeto salvo no banco:

```tsx
// addEquipment()
await supabase.from("inventory_items").insert({
  // ... outros campos
  image_url: equipImageUrls.length > 0 ? equipImageUrls : null,
});

// confirmEdit()
await supabase.from("inventory_items").update({
  // ... outros campos
  image_url: editImageUrls.length > 0 ? editImageUrls : null,
}).eq("id", editId);
```

#### 6. Atualizar Função openEdit

Carregar imagens existentes ao editar:

```tsx
function openEdit(eq: Equipment) {
  // ... outros campos
  setEditImageUrls(eq.imageUrl || []);
  setEditModalOpen(true);
}
```

#### 7. Atualizar resetEquipForm

Limpar estado de imagens:

```tsx
function resetEquipForm() {
  // ... outros campos
  setEquipImageUrls([]);
}
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/admin/Stock.tsx` | Adicionar estados, funções de upload e campos de imagem nos modais |
| **SQL Migration** | Criar bucket e políticas de storage |

---

### Resultado Esperado

1. Ao criar um novo equipamento, usuário pode selecionar uma imagem
2. Ao editar um equipamento, usuário vê a imagem atual e pode alterá-la
3. A imagem aparece no card do equipamento no Kanban (já funciona)
4. As imagens são armazenadas no Storage do Lovable Cloud

