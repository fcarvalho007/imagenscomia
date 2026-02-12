

## Actualizacoes da Homepage, Duracao e Modal EuPago

### 1. Presenter Section — Texto actualizado

**Ficheiro:** `src/components/landing/PresenterSection.tsx` (linha 53)

Substituir:
> "20 anos a implementar marketing digital e IA em empresas portuguesas"

Por:
> "20 anos de experiencia em marketing digital para empresas"

---

### 2. Hero Section — Remover video e actualizar conteudo

**Ficheiro:** `src/components/landing/HeroSection.tsx`

**a) Substituir "WEBINAR GRATUITO . 18 FEVEREIRO . 10H00"** (linhas 36-40) por apenas "WEBINAR GRATUITO" dentro de uma caixa elegante com fundo branco e brilho neon sutil (box-shadow com cor azul/roxa brilhante, border arredondado).

**b) Caixa "Ao vivo -- 18 Fevereiro"** (linha 59) passa a ter duas linhas:
- Linha 1: "ONLINE & AO VIVO" (bold, uppercase)
- Linha 2: "18 Fev." (texto mais pequeno)

**c) "75 minutos"** (linha 61) passa a **"60 minutos"**

**d) Remover bloco de video** (linhas 72-83) — o placeholder com o botao Play e eliminado por completo.

---

### 3. Duracao 75min -> 60min em toda a aplicacao

Actualizar todas as referencias de 75 para 60 minutos:

| Ficheiro | Linha | Alteracao |
|---|---|---|
| `src/components/landing/HeroSection.tsx` | 61 | "60 minutos" |
| `src/components/landing/ProgramSection.tsx` | 51 | "O que se aprende em 60 minutos" |
| `src/components/landing/CTAFinalSection.tsx` | 27 | "60 minutos. Sem custo..." |
| `src/components/landing/PricingCardsSection.tsx` | 7 | "Webinar ao vivo (60 min)" |
| `src/components/webinar/WebinarContent.tsx` | 14 | "(em 60 min)" |
| `src/components/webinar/webinarConfig.ts` | 9 | `durationMinutes: 60` |
| `src/components/webinar/webinarConfig.ts` | 28 | `endTime: "11:00"` |

---

### 4. Modal EuPago — Redesign mais elegante

**Ficheiro:** `src/components/upgrade/StepConfirmation.tsx` (linhas 82-97)

Redesign do `RedirectOverlay`:
- Animacao de entrada suave (scale + fade com framer-motion)
- Icone de cadeado (Shield ou Lock) em vez do spinner inicial, seguido do spinner
- Texto simplificado: apenas "Redirecionando para pagamento seguro..." e um subtexto discreto "Vais receber confirmacao por email"
- Visual: card com border radius maior, sombra mais pronunciada, gradiente subtil no fundo
- Remover excesso de texto e emojis

---

### Resumo de ficheiros a editar

| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/PresenterSection.tsx` | Texto "20 anos de experiencia..." |
| `src/components/landing/HeroSection.tsx` | Caixa neon "WEBINAR GRATUITO", caixa "ONLINE & AO VIVO / 18 Fev.", 60min, remover video |
| `src/components/landing/ProgramSection.tsx` | 60 minutos |
| `src/components/landing/CTAFinalSection.tsx` | 60 minutos |
| `src/components/landing/PricingCardsSection.tsx` | 60 min |
| `src/components/webinar/WebinarContent.tsx` | 60 min |
| `src/components/webinar/webinarConfig.ts` | durationMinutes: 60, endTime: "11:00" |
| `src/components/upgrade/StepConfirmation.tsx` | Redesign do modal pre-redirect |
