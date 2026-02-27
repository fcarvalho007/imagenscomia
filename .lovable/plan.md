
# Redesign Step 5 + Mobile polish + Confirmacao in-card

## Resumo

Redesign do StepDuvida (Step 5) com novo visual de checkboxes e layout de botoes. Adicionar estado de confirmacao in-card para utilizadores sem compra (substituir redirect para `/confirmacao`). Aplicar mobile polish global ao UpgradeVideo.tsx e sub-componentes.

## Ficheiros a alterar

### 1. `src/components/upgrade/StepDuvida.tsx` — Rewrite completo

**Manter:** Props interface (`duvida`, `setDuvida`, `onNext`, `onSkip`, `userName`), logica de multi-select (toggle, buildDuvida, otherText), serializacao para string com `;`.

**Novo visual:**
- Step label centrado: "Passo 5 de 5 -- A tua duvida" (12px, #9ca3af)
- Headline: "{firstName}, uma ultima pergunta" (28px, 700, #111827) -- mobile: 24px
- Subheadline: "Isto ajuda-nos a preparar o conteudo para ti." (15px, #6b7280)
- Question: "Qual a maior duvida..." (17px, 600, #111827)
- Hint: "(pode seleccionar mais de uma)" (13px, #9ca3af, italic)
- Checkbox rows full-width: min-height 52px, border 1.5px #e5e7eb, rounded-[12px], padding 14px 16px
- Custom checkbox: 20x20px, rounded-[6px], unselected: border 2px #d1d5db, selected: bg #1e40af com tick branco
- Selected row: border #1e40af, bg #eff6ff, text #1e40af, font-weight 600
- "Outro" com input text (font-size 16px para iOS)
- Botoes: "Finalizar" (bg #1e40af, h-52, rounded-[28px], 16px/700, min-w-160px) + "Saltar" (inline link, #9ca3af, underline dotted)
- Mobile: botoes empilhados verticalmente, Finalizar full-width, Saltar centrado abaixo

### 2. `src/pages/UpgradeVideo.tsx` — Mobile polish + confirmacao

**Header mobile:** Colapsar para uma unica linha "Webinar Video . 5 Mar check" em < 640px. Esconder texto "Inscricao gratuita confirmada" em mobile, manter so o check verde.

**Progress bar label mobile:** Em < 480px, mostrar so "Passo N/5" sem o subtitulo.

**Card overrides mobile:**
- `overscroll-behavior: none` no card
- `padding-top: env(safe-area-inset-top)` no header
- `overflow-x: hidden` no wrapper principal

**Confirmacao in-card (step 7 visual, para free users):**
Quando `goToFreeConfirmation()` e chamado actualmente, em vez de redirect, fazer `goForward(7)` e renderizar um novo bloco inline no step === 7:
- Circulo verde 64px com tick 32px (#16a34a sobre #dcfce7)
- "Estas inscrito, {firstName}." (28px, 700) -- mobile 24px
- "Webinar Video com IA . 5 de Marco . 10h00" (15px, #6b7280)
- Info box verde (#f0fdf4, border #bbf7d0): "Vais receber um email de confirmacao..."
- Se orderState tem compras: summary com badges + precos
- CTA "Voltar ao inicio": border #e5e7eb, h-48, rounded-[28px], navega para /video
- Animacao: fade-in com scale no circulo (300ms, ease-out)

**Nota:** Para paid users (step 6 = VideoConfirmation), o fluxo permanece inalterado -- redirect para EuPago.

**Actualizar `goToFreeConfirmation`:** Em vez de `window.location.href = /confirmacao...`, fazer `goForward(7)`.

**Progress bar:** Esconder no step 7 (confirmacao). Ou manter em 100%.

**totalSteps:** Manter visual em 5 (step 7 nao conta para a barra).

### 3. Mobile polish nos sub-componentes (StepRole, StepTeamSize, StepMasterclass, StepVideoPremium)

Alteracoes minimas, apenas responsive:

**StepRole.tsx:**
- Headline ja tem `max-sm:text-[26px]` -- OK
- Chips ja tem `max-sm:w-full` -- OK
- Sem alteracoes necessarias

**StepTeamSize.tsx:**
- Headline ja tem `max-sm:text-[22px]` -- OK
- Sem alteracoes necessarias

**StepMasterclass.tsx:**
- Headline 28px -- adicionar `max-sm:text-[24px]` via className
- Price ja tem `max-sm:text-[40px]` -- reduzir para `max-sm:text-[38px]`
- Sem outras alteracoes

**StepVideoPremium.tsx:**
- Mesmas alteracoes que StepMasterclass (headline e price mobile)

### 4. CSS global no UpgradeVideo.tsx

Adicionar ao style tag existente:
- `.upgrade-card-inner { overscroll-behavior: none; }`
- Header: `padding-top: env(safe-area-inset-top)` no estilo inline
- Wrapper: `overflow-x: hidden` (ja inline)
- Confirmacao: keyframes `confirmFadeIn` e `confirmScaleIn`
- Mobile header: media query < 640px para colapsar a single line

## O que NAO muda

- Steps 1-4 (conteudo e logica inalterados, so mobile polish minimo)
- VideoConfirmation (step 6) -- checkout pago inalterado
- Logica de pagamento EuPago
- Supabase writes/reads (saveStepData, handleRecovery)
- Email automation
- Routing / outras paginas
- WhatsAppSupportButton

## Fluxo final

1. Step 1: Role (chips, auto-advance)
2. Step 2: TeamSize (chips, auto-advance)
3. Step 3: Masterclass (pricing card purple)
4. Step 4: Gravacao (pricing card blue)
5. Step 5: Duvida (checkboxes, redesigned)
6. Step 6: VideoConfirmation (checkout pago -- so se tem compras)
7. Step 7: Confirmacao in-card (free users -- novo)

Free path: 1 -> 2 -> 3(skip) -> 4(skip) -> 5 -> 7 (confirmacao in-card)
Paid path: 1 -> 2 -> 3/4(select) -> 5 -> 6(checkout) -> EuPago redirect
