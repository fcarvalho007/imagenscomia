

# Rascunho de fatura — último pagamento + correcção de descrições

## Último pagamento encontrado
- **Cliente**: Jessica Castro (jessica@xistoazul.pt)
- **Plano**: `video-premium` (Sessão HD + Pack Apoio — Vídeo com IA)
- **Valor**: 15,00€ + IVA
- **Dados de faturação**: Não preenchidos (será emitida como "Consumidor Final", NIF 999999990)

## Alterações no `create-invoice/index.ts`

### 1. Actualizar `PLAN_LABELS` — remover "Gravação", começar sempre com "Formação"
```
premium:          "Formação — Premium Pass · Imagens com IA"
masterclass:      "Formação — Masterclass · Imagens com IA"
bundle:           "Formação — Premium + Masterclass · Imagens com IA"
gravacao:         "Formação — Sessão HD + Pack Apoio · Imagens com IA"
video-premium:    "Formação — Sessão HD + Pack Apoio · Vídeo com IA"
video-masterclass:"Formação — Masterclass · Vídeo com IA"
video-bundle:     "Formação — Masterclass + Sessão · Vídeo com IA"
```

### 2. Ajustar campo `description` do item
Actualmente: `"Formação online — ${itemDescription}"` → redundante porque o label já terá "Formação".

Novo: usar o label directamente como `name` e a `description` como um resumo curto:
- `name`: label completo (ex: "Formação — Sessão HD + Pack Apoio · Vídeo com IA")
- `description`: resumo do conteúdo (ex: "Acesso à sessão completa em HD + materiais de apoio")

Mapa de descrições por plano para o campo `description`:
```
premium:           "Acesso premium ao webinar Imagens com IA"
masterclass:       "Masterclass online de 3h · Imagens com IA"
bundle:            "Acesso premium + Masterclass · Imagens com IA"
gravacao:          "Sessão completa em HD + pack de apoio · Imagens com IA"
video-premium:     "Sessão completa em HD + pack de apoio · Vídeo com IA"
video-masterclass: "Masterclass online de 3h · Vídeo com IA"
video-bundle:      "Masterclass + sessão completa · Vídeo com IA"
```

### 3. Criar rascunho de teste
Após deploy, invocar a função com `draft_only: true` para o registo da Jessica Castro para verificar que os campos estão correctos no InvoiceExpress.

## Ficheiro a editar
- `supabase/functions/create-invoice/index.ts`

