

# Returning User Detection no /upgrade-video

## Problema actual

Existem dois cenarios problematicos:

1. **Com email no URL** (`?email=...`): O utilizador vai directamente para o Step 1, mesmo que ja tenha completado steps anteriores. Nao ha reconhecimento de que ja esta registado.

2. **Sem email no URL** (recovery screen): O ecra pede o email mas a mensagem e generica ("Retomar a sua compra"). Se o utilizador nao se lembra que ja se registou, a experiencia e confusa.

## Solucao proposta

Adicionar um **useEffect** que corre quando o utilizador chega com `email` no URL. Este effect consulta a base de dados e:

- Se o utilizador **ja esta registado** e **ja completou steps**: mostra um ecra de "Bem-vindo de volta" (novo step 0) com o nome do utilizador, indicando que a inscricao esta confirmada, e oferecendo duas opcoes:
  - "Continuar de onde parei" (avanca para o step seguinte ao ultimo completado)
  - "Recomecar do inicio" (vai para step 1)
  - Se ja completou o step 5, mostra opcao de "Ver as ofertas" (vai para step 3) ou ir directamente para a confirmacao

- Se o utilizador **nao esta registado**: continua normalmente no Step 1 sem interrupcao

Para a **recovery screen** (sem email no URL): manter como esta, mas melhorar a copy para "Introduza o email que usou para se inscrever" (ja esta assim).

## Alteracoes tecnicas

### 1. `src/pages/UpgradeVideo.tsx`

**Novo estado:**
```text
const [isReturning, setIsReturning] = useState(false)
const [returningData, setReturningData] = useState(null)
const [initialLoading, setInitialLoading] = useState(!!searchParams.get("email"))
```

**Novo useEffect (auto-check on mount):**
Quando `email` existe nos search params, fazer query a `registrations` com `.eq("email", email).eq("webinar", "video")`. Se encontrar registo:
- Guardar dados (nome, role, team_size, step_reached, plan_selected, paid_at)
- Se `step_reached >= 1`: marcar `isReturning = true`
- Restaurar estado (role, teamSize, orderState) a partir dos dados
- Se `paid_at` existe: marcar produtos como comprados

Se nao encontrar: continuar normalmente (step 1, sem interrupcao).

**Novo ecra de returning user (step 0):**
Renderizado quando `isReturning === true` e `step === 0`:

- Circulo com emoji de onda (wave) ou check verde
- "Ola de novo, {firstName}!" (28px, 700, #111827) -- mobile 24px
- "A tua inscricao no Webinar Video esta confirmada." (15px, #6b7280)
- Se ja comprou algo (paid_at): mostrar badge "checkmark Compra confirmada" em verde
- Se tem step_reached mas nao comprou: mostrar "Ficaste no passo {N} da ultima vez."

Botoes:
- **Primario**: "Continuar de onde parei ->" ou "Ver ofertas disponiveis ->" (se ja completou step 5)
  - Background: #1e40af, h-52, rounded-[28px], 16px/700
  - Avanca para `Math.min(step_reached + 1, 5)` se step_reached < 5
  - Avanca para step 3 se step_reached >= 5 (para rever ofertas)
- **Secundario**: "Recomecar do inicio"
  - Border: 1.5px #e5e7eb, h-48, rounded-[28px], 15px/500
  - Vai para step 1

- Se `paid_at` existe (ja pagou):
  - Primario: "Ver a minha confirmacao" -> vai para step 7
  - Sem secundario

**Loading state:**
Enquanto `initialLoading === true`, mostrar um spinner centrado no card (mesmo layout do card branco, com Loader2 a rodar). Desaparece quando a query resolve.

**Progress bar:**
Esconder no step 0 (mesmo comportamento do step 7).

**Header:**
Manter igual (ja mostra "Inscricao gratuita confirmada checkmark").

### 2. Fluxo completo actualizado

```text
Utilizador chega com ?email=...
  |
  v
Query DB (registrations WHERE email AND webinar='video')
  |
  +-- Nao encontrado --> Step 1 (normal, sem interrupcao)
  |
  +-- Encontrado, step_reached < 1 --> Step 1 (normal)
  |
  +-- Encontrado, step_reached >= 1 --> Step 0 (returning user screen)
       |
       +-- "Continuar" --> Step min(step_reached+1, 5)
       +-- "Recomecar" --> Step 1
       +-- (Se paid_at) "Ver confirmacao" --> Step 7
```

### 3. Recovery screen (sem email no URL)

A recovery screen actual ja faz a mesma logica de restaurar estado. Pequena melhoria: depois de encontrar o utilizador, em vez de ir directamente para o step, mostrar primeiro o step 0 (returning user screen) para dar contexto. Ajustar `handleRecovery` para fazer `setIsReturning(true)` e `setStep(0)` em vez de ir directamente para o step calculado.

## O que NAO muda

- Steps 1-5 (conteudo e logica inalterados)
- Step 6 (VideoConfirmation / checkout pago)
- Step 7 (confirmacao in-card)
- Logica de pagamento EuPago
- Supabase writes/reads (saveStepData)
- Nenhum outro ficheiro ou componente
- Recovery screen visual (so muda o destino apos encontrar registo)

## Mobile

- Step 0 segue o mesmo layout do card branco centrado
- Headline: 24px em mobile (max-sm:text-[24px])
- Botoes: full-width em mobile
- Sem novos componentes -- tudo inline no UpgradeVideo.tsx

