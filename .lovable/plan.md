

# Correcoes ao Hero e consistencia da pagina /video

## Resumo

Corrigir a data do webinar (2 Marco → 3 Marco, 21h), alargar o headline para caber em 2 linhas, remover "2 MARCO" do badge pill, e actualizar horarios em toda a pagina.

---

## Ficheiro unico a modificar

`src/pages/Video.tsx`

---

## Alteracoes

### 1. Data e hora — de 2 Marco para 3 Marco as 21h

Actualizar TODAS as referencias:

- **Linha 267** — meta title: "2 Março 2026" → "3 Março 2026"
- **Linha 272** — countdown target: `"2026-03-02T10:00:00"` → `"2026-03-03T21:00:00"`
- **Linha 285** — sticky bar label: `"AO VIVO · 2 MAR · A DEFINIR HORA"` → `"AO VIVO · 3 MAR · 21H00"`
- **Linha 394** — info box DATA value: `"2 de Março"` → `"3 de Março"`
- **Linha 395** — info box HORARIO value: `"A definir"` → `"21h00"`
- **Linha 998** — final CTA text: `"2 de Março de 2026"` → `"3 de Março de 2026"`

### 2. Badge pill — remover "2 MARCO"

- **Linha 326** — texto do badge: `"WEBINAR GRATUITO · AO VIVO · 2 MARÇO"` → `"WEBINAR GRATUITO · AO VIVO"`

### 3. Headline em 2 linhas — alargar max-width

O titulo actualmente espalha-se por 4-5 linhas porque o container e estreito (780px) e o font-size e grande.

- **Linha 318** — alterar maxWidth do container hero de `780` para `960`
- **Linha 333** — alterar font-size clamp de `clamp(38px, 6vw, 72px)` para `clamp(36px, 5.5vw, 62px)` para melhor equilibrio em 2 linhas
- **Linha 341** — mover o `<br />` para depois de "Inteligência Artificial" em vez de depois de "com", para forcar exactamente 2 linhas:
  - Linha 1: "Aprende a criar vídeos com Inteligência Artificial"
  - Linha 2: "para marketing"

  Alternativa mais equilibrada (se o user preferir):
  - Linha 1: "Aprende a criar vídeos com"
  - Linha 2: "Inteligência Artificial para marketing"

  Vou implementar a segunda opcao (manter `<br />` apos "com") mas aumentar o max-width para 960px para que cada linha caiba sem quebrar adicionalmente.

### 4. Consistencia de tamanhos de letra

Rever e uniformizar os tamanhos tipograficos da pagina para hierarquia clara:

- Headline hero: `clamp(36px, 5.5vw, 62px)` (ajustado para 2 linhas)
- Titulos de seccao (`SectionTitle`): manter `26px/32px` — esta consistente
- Eyebrow labels: manter `13px` — esta consistente
- Body text / card text: verificar que nao ha inconsistencias (actualmente consistente)

Nenhuma outra alteracao tipografica necessaria — os tamanhos existentes ja estao bem hierarquizados.

---

## Resumo tecnico

| Localizacao | Alteracao |
|---|---|
| meta title (L267) | "2 Março" → "3 Março" |
| countdown (L272) | `03-02T10:00` → `03-03T21:00` |
| sticky bar (L285) | "2 MAR · A DEFINIR HORA" → "3 MAR · 21H00" |
| badge pill (L326) | remover " · 2 MARÇO" |
| hero max-width (L318) | 780 → 960 |
| headline font-size (L333) | clamp ajustado para 62px max |
| info box DATA (L394) | "2 de Março" → "3 de Março" |
| info box HORARIO (L395) | "A definir" → "21h00" |
| final CTA text (L998) | "2 de Março" → "3 de Março" |

