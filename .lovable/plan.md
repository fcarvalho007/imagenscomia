
# Mobile-First Audit: /video e /upgrade-video

Correcoes pontuais para ecras 375px-430px. Nenhuma alteracao ao layout desktop.

---

## Ficheiros a modificar

| Ficheiro | Fixes |
|---|---|
| `src/pages/Video.tsx` | FIX 1, 2, 3, 4 |
| `src/pages/UpgradeVideo.tsx` | FIX 5, 8, 9 |
| `src/components/upgrade/StepVideoPremium.tsx` | FIX 6, 7 |
| `src/components/upgrade/StepMasterclass.tsx` | FIX 6, 7 |

---

## PAGE 1 -- /video (Video.tsx)

### FIX 1 -- Hero badge pill (linhas 282-290)

O pill "WEBINAR GRATUITO . AO VIVO . 5 MARCO, 10H" parte em 2 linhas no mobile.

**Solucao:** Reduzir font-size para 10px no mobile e adicionar `whitespace-nowrap` + `max-width: 90vw`. Manter o pill intacto em vez de dividir (mais limpo).

```tsx
<span className="inline-flex items-center gap-2 font-heading text-[10px] sm:text-[11px] font-semibold uppercase tracking-[1.5px] sm:tracking-[2px] px-3 sm:px-4 py-1.5 rounded-full mb-6 whitespace-nowrap max-w-[90vw]" style={{...}}>
```

### FIX 2 -- Hero CTA button (linhas 357-367)

O texto "Sim, quero inscrever-me gratis" parte no mobile.

**Solucao:** Usar texto mais curto no mobile via classes `hidden`/`sm:hidden`:

```tsx
<button ...
  className="font-heading text-white text-[16px] sm:text-[20px] transition-all duration-200 cursor-pointer hover:scale-[1.02] w-full whitespace-nowrap"
  style={{ background: "#16A34A", fontWeight: 700, padding: "16px 20px", borderRadius: 10, maxWidth: 500, minWidth: 0 }}
>
  <span className="hidden sm:inline">Sim, quero inscrever-me gratis</span>
  <span className="sm:hidden">Inscrever-me gratuitamente</span>
</button>
```

Reducoes no mobile: font-size 16px, padding 16px 20px, minWidth 0 (remover o `minWidth: 300` que forca overflow).

### FIX 3 -- Agenda subtitle (linhas 626-628)

Texto denso numa so linha no mobile.

**Solucao:** Usar `<span className="block">` para separar cada frase com line-height 1.7:

```tsx
<p className="text-[17px] text-ink-500 text-center mb-12 max-w-lg mx-auto leading-[1.7]">
  <span className="block">3 blocos praticos.</span>
  <span className="block italic">Demos ao vivo.</span>
  <span className="block">Resultados no dia seguinte.</span>
</p>
```

### FIX 4 -- Espacamento geral mobile

- **Page wrapper** (linha 215): Adicionar `overflow-x-hidden` para prevenir scroll horizontal
- **Info boxes grid** (linha 334): Mudar `gap-3` para `gap-2 sm:gap-3` para 375px
- **Section title h2** (componente SectionTitle, linha 111): Adicionar `max-sm:text-[26px]` para limitar tamanho
- **Agenda section padding** (linha 618): Ja tem `px-4`, verificar que nenhum conteudo toca as margens

---

## PAGE 2 -- /upgrade-video (UpgradeVideo.tsx)

### FIX 5 -- Step content padding (UpgradeVideo.tsx)

O content area (linha ~187) ja tem `px-4`. Confirmar que nao ha overflow adicionando `overflow-x-hidden` ao wrapper do conteudo.

### FIX 8 -- Sidebar no mobile

A sidebar ja esta `hidden lg:flex` (linha 144). O mobile summary bar ja existe (linhas 134-139, `lg:hidden`). Verificar que nao causa whitespace extra — actualmente parece correcto. Nenhuma alteracao necessaria alem de confirmar.

### FIX 9 -- Progress bar label (linhas 178-181)

No mobile < 480px, o texto "Passo 2/4 -- Gravacao Video (opcional)" e demasiado longo.

**Solucao:** Usar logica condicional com classe `hidden`/`inline`:

```tsx
<p className="text-right text-[14px] text-ink-400 font-medium mt-1.5">
  Passo {step}/{totalSteps}
  {step === 2 && (
    <>
      <span className="hidden min-[480px]:inline"> — Gravacao Video (opcional)</span>
      <span className="min-[480px]:hidden"> — Gravacao</span>
    </>
  )}
  {step === 3 && (
    <>
      <span className="hidden min-[480px]:inline"> — Masterclass Video (opcional)</span>
      <span className="min-[480px]:hidden"> — Masterclass</span>
    </>
  )}
</p>
```

---

## StepVideoPremium.tsx

### FIX 6 -- Date box mobile

O date box (linhas 70-76) ja usa `flex items-start gap-2.5`. Reduzir padding e icon size no mobile:

```tsx
<div className="flex items-start gap-2 sm:gap-2.5 rounded-lg p-2 sm:p-2.5 mb-3" style={{...}}>
  <span className="text-[16px] sm:text-[18px] leading-none">...</span>
  <div>
    <p className="text-[11px] sm:text-[12px] font-bold" ...>...</p>
    <p className="text-[11px] sm:text-[12px]" ...>...</p>
  </div>
</div>
```

### FIX 7 -- CTA button mobile

O botao (linhas 93-98) ja tem `w-full`. Garantir min-height 52px e white-space normal:

```tsx
<button
  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-heading font-bold text-[15px] sm:text-[16px] py-3.5 sm:py-4 rounded-xl transition-colors shadow-blue min-h-[52px]"
  style={{ whiteSpace: "normal" }}
>
```

Adicionar `mb-4` antes do separador "ou".

---

## StepMasterclass.tsx

### FIX 6 -- Date box mobile (mesmo padrao)

Linhas 73-79: Mesmas reducoes de padding e font-size que StepVideoPremium.

### FIX 7 -- CTA button mobile (mesmo padrao)

Linhas 103-111: Mesmas alteracoes de min-height, font-size e whitespace.

---

## Resumo de alteracoes

| Fix | Ficheiro | Tipo |
|---|---|---|
| 1 | Video.tsx | Pill badge: whitespace-nowrap + font 10px mobile |
| 2 | Video.tsx | CTA: texto curto mobile + padding reduzido |
| 3 | Video.tsx | Agenda subtitle: block spans com line-height 1.7 |
| 4 | Video.tsx | overflow-x-hidden + gap ajustado nos info boxes |
| 5 | UpgradeVideo.tsx | overflow-x-hidden no content wrapper |
| 6 | StepVideoPremium/Masterclass | Date boxes: padding e font menores |
| 7 | StepVideoPremium/Masterclass | CTAs: min-h-52px + font 15px mobile |
| 8 | UpgradeVideo.tsx | Sidebar ja oculta -- sem alteracao |
| 9 | UpgradeVideo.tsx | Progress label: "(opcional)" oculto < 480px |

## O que NAO muda

- Layout desktop (todas as alteracoes usam breakpoints mobile-only)
- Texto/copy (excepto CTA hero encurtado no mobile)
- Funcionalidade, formularios, dados
- Outras paginas
- Navegacao ou autenticacao
