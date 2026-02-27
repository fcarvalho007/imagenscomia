

# Fixes focados nos Steps 3 e 4 -- spacing e mobile polish

## Estado actual

A maioria das alteracoes anteriores ja esta aplicada:
- Sticky bottom bar: OK (ambos componentes)
- Inline pill "Masterclass": OK (StepVideoPremium)
- Mobile header 44px: OK
- Progress label curto em mobile: OK
- `pt-2 sm:pt-4` para steps 3/4: OK

## O que falta corrigir

### 1. Reduzir card padding interno nos steps 3/4

**Ficheiro:** `src/pages/UpgradeVideo.tsx` (linhas 462-469)

O card tem `padding: "48px 40px"` para todos os steps. Para steps 3 e 4, o padding-top de 48px cria um gap grande entre o progress bar e o conteudo visivel.

**Alteracao:** Tornar o padding condicional:
- Steps 3, 4: `padding: "24px 40px"` desktop, `20px 20px` mobile
- Outros steps: manter `padding: "48px 40px"` desktop, `32px 20px` mobile

Implementacao: mudar o style inline para usar uma variavel:
```text
padding: [3, 4].includes(step) ? "24px 40px" : "48px 40px"
```

E actualizar o CSS mobile override para tambem ser condicional (ou adicionar uma classe extra para steps 3/4).

Abordagem pratica: adicionar uma classe condicional `upgrade-card-compact` para steps 3/4 e adicionar regra CSS correspondente.

### 2. Mobile card border-radius (16px top, 0 bottom)

**Ficheiro:** `src/pages/UpgradeVideo.tsx` (linhas 472-481)

Actualmente o CSS mobile override faz `border-radius: 0 !important`. Alterar para:
```text
border-radius: 16px 16px 0 0 !important;
```

Isto aplica-se a todos os steps em mobile, o que e aceitavel.

### 3. Back arrow posicionamento nos steps 3/4

**Ficheiro:** `src/pages/UpgradeVideo.tsx` (linhas 485-494)

O back arrow tem `mb-4` (16px margin-bottom). Com o padding reduzido, isto mantem-se correcto. Sem alteracao necessaria.

## Ficheiros alterados

1. **`src/pages/UpgradeVideo.tsx`** -- card padding condicional para steps 3/4, mobile border-radius 16px top

## O que NAO muda

- StepMasterclass.tsx (ja esta correcto)
- StepVideoPremium.tsx (ja esta correcto)
- Steps 1, 2, 5, 6, 7
- Logica de pagamento, Supabase, email triggers
- Sticky bar, pill badge, mobile header (ja implementados)

