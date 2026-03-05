

# Corrigir mapeamento de tags E-goi para webinar Vídeo

## Problema identificado

A screenshot mostra a Tag 35 (`premium_pass_webinar_video_com_ia_5_março`) com **0 contactos** no E-goi. Isto porque:

### Mapeamento actual das tags E-goi

| Tag ID | Nome | Webinar |
|--------|------|---------|
| 31 | webinar_imagens_com_ia_18_fev | Imagens (inscrição) |
| 32 | premium_pass_webinar_imagens | Imagens (premium) |
| 33 | masterclass_webinar_imagens | Imagens (masterclass) |
| 34 | webinar_video_com_ia_5_março | Vídeo (inscrição) |
| **35** | **premium_pass_webinar_video** | **Vídeo (premium)** ← vazia |

### O que está errado

1. **`eupago-webhook`** — **correcto**: já usa `{ imagens: { premium: 32 }, video: { premium: 35 } }`. Mas se nenhum pagamento de vídeo passou por aqui, a tag nunca foi aplicada.

2. **`grant-premium-egoi`** — **errado**: usa sempre Tag 32 (imagens), mesmo para registos do webinar vídeo. Não distingue o webinar.

3. **`bulk-tag-egoi`** — **errado**: usa sempre Tag 32 para premium, ignora o webinar. Deveria usar Tag 35 para registos de vídeo.

## Alterações

### 1. `supabase/functions/grant-premium-egoi/index.ts`
- Buscar também o campo `webinar` do registo (além do `email`)
- Se `webinar === 'video'` → aplicar Tag 35
- Se `webinar === 'imagens'` ou outro → aplicar Tag 32

### 2. `supabase/functions/bulk-tag-egoi/index.ts`
- Buscar o campo `webinar` de cada registo
- Usar mapeamento: `{ imagens: { premium: 32, masterclass: 33 }, video: { premium: 35, masterclass: 33 } }`
- Aplicar a tag correcta conforme o webinar

### 3. `src/hooks/useInscritos.ts`
- Actualizar o comentário (linha 363) de "Tag 32" para "Tag premium (32 ou 35)"

### Ficheiros a editar (3)
- `supabase/functions/grant-premium-egoi/index.ts`
- `supabase/functions/bulk-tag-egoi/index.ts`
- `src/hooks/useInscritos.ts` (apenas comentário)

### Nota
Após o deploy, será necessário correr o `bulk-tag-egoi` para aplicar retroactivamente a Tag 35 aos compradores de vídeo premium que ficaram sem tag.

