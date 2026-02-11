

# Melhorias UX/UI dos Passos 1-4 do Upsell

## Ficheiros a editar (5)

| Ficheiro | Alteracoes |
|----------|-----------|
| `Upsell.tsx` | Progress bar max-w 560px, container max-w |
| `StepQualification.tsx` | max-w 560px, line-height, skip mais discreto |
| `StepPersonalization.tsx` | max-w 560px, caixa azul compacta, skip discreto |
| `StepPremium.tsx` | max-w 620px, card 560px, badge min-w/nowrap, skip discreto |
| `StepMasterclass.tsx` | max-w 620px, card 560px, bullets curtos, remover Max 30, badge nowrap, skip discreto |

---

## 1. Layout global (Upsell.tsx)

- Progress bar: `max-w-[480px]` para `max-w-[560px]` (acompanhar a largura dos cards)
- Sidebar ja esta a 280px (ok, manter)

## 2. Passos 1-2 (Qualification + Personalization)

### StepQualification.tsx
- `max-w-[480px]` para `max-w-[560px]`
- Skip link: reduzir para `text-[13px]` e `text-ink-300` (mais discreto)

### StepPersonalization.tsx
- `max-w-[480px]` para `max-w-[560px]`
- Caixa azul: reduzir padding de `p-3` para `p-2.5`, remover `mb-5` para `mb-4`
- Subtitulo: juntar as 2 linhas (remover `<br />`) para ser mais compacto
- Skip link: `text-[13px]` e `text-ink-300`

## 3. Passo 3 — StepPremium.tsx

- Container: `max-w-[560px]` para `max-w-[620px]`
- Card: `max-w-[520px]` para `max-w-[560px]`
- Badge early bird: adicionar `whitespace-nowrap` e `min-w-[160px]` para evitar que "+ IVA" quebre de linha
- Preco grande (€15): reduzir de `text-[40px]` para `text-[36px]` para consistencia com Masterclass
- Bullets: adicionar `leading-[1.5]` ao microcopy para melhor leitura
- Skip link: `text-[13px]` e `text-ink-300`

## 4. Passo 4 — StepMasterclass.tsx

- Container: `max-w-[560px]` para `max-w-[620px]`
- Card: `max-w-[520px]` para `max-w-[560px]`
- Bullets encurtados (titulos mais curtos):
  1. "Imagem → video: do estatico ao clip" / "Fluxo pratico para gerar video utilizavel."
  2. "Ferramentas certas (sem confusao)" / "Curadoria por objetivo: gratuitas e pagas."
  3. "Prompts para video (reutilizaveis)" / "Estruturas para consistencia e controlo."
  4. "Gravacao incluida" / "Rever e replicar quando necessario."
- Rodape icones: remover "👥 Max. 30", manter apenas `["💻 Online", "⏱ 3 horas"]`
- Badge early bird: adicionar `whitespace-nowrap`
- Skip link: `text-[13px]` e `text-ink-300`

## 5. SummaryPanel.tsx

- Linha da Masterclass: "3h · Online · Max. 30" para "3h · Online" (remover Max. 30)

