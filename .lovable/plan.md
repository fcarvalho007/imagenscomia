

# Redesign /upgrade-video — Layout centrado com card unico

## Resumo

Substituir o layout actual (sidebar esquerda 280px + area de conteudo) por um layout full-width centrado: header fixo no topo, barra de progresso full-width, e card branco centrado sobre fundo cinzento. Steps 1-2 recebem novo design com chips; steps 3-5 mantem conteudo existente mas dentro do novo wrapper.

## Ficheiros a alterar

### 1. `src/pages/UpgradeVideo.tsx` (rewrite do layout principal)

**Remover:**
- Barra mobile sticky top (linhas 208-213)
- Sidebar `<aside>` desktop inteira (linhas 217-271)
- Grid `lg:grid lg:grid-cols-[280px_1fr]`
- Banners de confirmacao (masterclass/premium) entre steps
- Mobile sticky footer (linhas 422-440)
- Dependencia de `framer-motion` para step transitions (usar CSS puro)
- Imports: `AnimatePresence`, `motion`, `CheckCircle2`

**Adicionar:**
- Header fixo 56px: emoji webinar + data + confirmacao verde
- Barra de progresso 3px full-width abaixo do header, com label "Passo N/5"
- Container centrado `flex items-center justify-center` com fundo `#f3f4f6`
- Card branco `max-w-[600px]`, `rounded-3xl`, `shadow`, padding 48/40
- Mobile: card sem border-radius, sem shadow, min-height `calc(100vh - 56px)`
- Transicao CSS entre steps: translateX + opacity (sem framer-motion)
- Estado `direction` (1 ou -1) para controlar direcao da animacao
- Botao voltar (seta) no topo do card a partir do step 2

**Step variants (CSS puro):**
- Classe `.step-enter-right`: translateX(20px) -> 0, opacity 0 -> 1 (250ms)
- Classe `.step-enter-left`: translateX(-20px) -> 0, opacity 0 -> 1 (250ms)
- Usar `key` no div do step para forcar re-render

**Recovery screen:** manter como esta (nao faz parte do redesign).

**Progress bar labels:**
- Steps 1-2: "Passo 1/5", "Passo 2/5"
- Step 3+: "Passo 3/5 -- Masterclass Video", "Passo 4/5 -- Gravacao", "Passo 5/5 -- Checkout"

### 2. `src/components/upgrade/StepQualification.tsx` (redesign step 1 + step 2)

Este componente actualmente tem role + teamSize juntos. No novo design, role e teamSize sao steps separados (step 1 e step 2). Ha duas abordagens:

**Abordagem escolhida:** Criar dois novos componentes inline no UpgradeVideo ou separar a logica:
- **Step 1** mostra so role (chips centrados, auto-advance 400ms)
- **Step 2** mostra so teamSize (chips centrados, auto-advance 400ms, back arrow)

Na pratica, o mais limpo e **nao usar StepQualification** para steps 1-2 e em vez disso renderizar o conteudo directamente no UpgradeVideo (ou criar dois sub-componentes simples). Isto evita alterar StepQualification que pode ser usado noutros sitios.

**Novo Step 1 (role) -- inline ou novo componente:**
- Label: "Passo 1 de 5" centrado, 12px, #9ca3af
- Titulo: "{firstName}, espera..." -- 32px, 700
- Sub: "So duas perguntas rapidas." -- 16px, #6b7280
- Chips pill: flex-wrap, centrados, gap 10px
- Chip: border 1.5px #e5e7eb, rounded-full, padding 12px 20px, 14px 500
- Selected: border 2px #1e40af, bg #eff6ff, color #1e40af, 600
- Auto-advance: setTimeout 400ms apos seleccao
- CTA "Proximo" full-width 52px como fallback

**Novo Step 2 (teamSize):**
- Back arrow top-left: ArrowLeft, 20px, #6b7280, tap target 44x44
- Label: "Passo 2 de 5" centrado
- Titulo em duas linhas: "Quantas pessoas trabalham / em marketing na tua organizacao?"
- Sub: "(selecciona uma opcao)" italico
- Mesmos chips, auto-advance 400ms

### 3. Steps 3, 4, 5 -- sem alteracao de conteudo

Os componentes `StepMasterclass`, `StepVideoPremium`, `StepDuvida`, `VideoConfirmation` nao sao alterados internamente. Sao renderizados dentro do novo card wrapper com:
- Back arrow no topo
- Mesma barra de progresso
- Mesma card centrada

O `max-w-[620px]` / `max-w-[560px]` interno destes componentes fica contido pelo card de 600px, funcionando naturalmente.

## Estrutura do layout final

```text
+--------------------------------------------------+
| HEADER FIXO (56px, branco, border-bottom)        |
| "Webinar Video"  "5 Marco 10h"  "Confirmada"    |
+--------------------------------------------------+
| PROGRESS BAR (3px, full-width)         Passo 1/5 |
+--------------------------------------------------+
|                                                  |
|           FUNDO CINZENTO (#f3f4f6)               |
|                                                  |
|         +----------------------------+           |
|         | CARD BRANCO (max 600px)    |           |
|         |                            |           |
|         |  [conteudo do step]        |           |
|         |                            |           |
|         +----------------------------+           |
|                                                  |
+--------------------------------------------------+
```

## Mobile (< 640px)

- Header: 2 linhas se necessario (webinar+data na 1a, confirmacao na 2a)
- Card: border-radius 0, shadow none, min-height calc(100vh - 56px - 3px)
- Chips longos: full-width, text wrap
- CTA: sempre full-width
- Back arrow: 44x44 tap target

## O que NAO muda

- Logica de pagamento / EuPago (`handlePayment`, `create-payment`)
- Queries Supabase (`saveStepData`, `handleRecovery`)
- Dados de qualificacao (role, team_size)
- Email automation triggers
- Routing / navegacao entre paginas
- Recovery screen
- WhatsAppSupportButton
- Componentes de outros pages

## Detalhes tecnicos

- Remover `framer-motion` do UpgradeVideo (usar CSS transitions com classes)
- Manter `framer-motion` nos child components que ja a usam (VideoConfirmation tem `motion.div`)
- CSS transitions: adicionar keyframes no proprio componente via style tag ou classes Tailwind com `animate-[]`
- Auto-advance: `useEffect` que observa `role`/`teamSize` e faz setTimeout 400ms
- Direction state: `const [direction, setDirection] = useState(1)` -- usado para escolher classe de animacao

