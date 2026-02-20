

# Refinamentos Hero + Consistencia de cores + Agenda cinematografica

## Resumo

4 alteracoes na pagina /video:

1. Hero: reduzir font-size do subtitulo para caber numa linha, actualizar data/horario/duracao, mudar icon do "Investimento", aumentar CTA, mudar texto do CTA
2. Agenda: redesign mais cinematografico
3. Revisao de consistencia de cores em toda a pagina

---

## 1. Hero — Subtitulo numa so linha

### Subtitulo menor
- Linha 300: reduzir font-size de `text-[18px] lg:text-[22px]` para `text-[15px] lg:text-[18px]`
- Texto ja esta correcto: "Sais com um sistema, ferramentas e templates prontos (briefing -> gerar -> rever -> publicar)"
- Aumentar `max-w` de 900px para 960px para garantir que cabe numa linha em desktop

### Info boxes actualizados
- Linha 324-327: actualizar valores:
  - DATA: "3 de Marco" (ja esta)
  - HORARIO: de "21h00" para "10h00"
  - DURACAO: de "45-60 min" para "45 min"
  - INVESTIMENTO: "Gratuito" (ja esta) — mudar icon de `GraduationCap` para `Layers` (ou `Gift` se disponivel — usar `Layers` que ja esta importado, ou importar `Sparkles`)
- Importar `Sparkles` de lucide-react para o icon de investimento (mais adequado que GraduationCap)

### CTA maior
- Linha 348-349: aumentar padding de `20px 48px` para `22px 56px`, font-size de `text-lg` para `text-[20px]`
- Texto: ja esta "Sim, quero inscrever-me gratis" (correcto)

---

## 2. Agenda — redesign cinematografico

A seccao actual (linhas 616-681) tem o layout basico correcto mas precisa de mais impacto visual:

### Layout e estrutura
- Manter o fundo `#0a0a0f` com gradient radial e noise
- Substituir a lista plana por cards individuais com fundo subtil para cada item da agenda
- Cada card: `rounded-xl`, `p-5 md:p-6`, fundo `rgba(255,255,255,0.03)`, border `rgba(255,255,255,0.06)`
- Grid de 2 colunas em desktop (2x2), 1 coluna em mobile

### Numeros grandes decorativos
- Numeros (001-004) como elementos grandes semi-transparentes (font-size 48px, opacity 0.08) no canto superior direito de cada card — semelhante ao estilo dos cards da seccao 1
- Numero visivel em gradient roxo-verde

### Titulo de cada item
- Font-size: 16px (em vez de 15px)
- Cor: branca (`rgba(255,255,255,0.85)`)
- Font-weight: 600

### Tags
- CORE e AO VIVO: manter verde mas com border mais visivel e font-size 9px

### Hover
- Border muda para roxo subtil
- Background fica ligeiramente mais claro
- A barra decorativa lateral roxa ganha glow

### Linha decorativa
- Manter a linha gradient roxo-verde entre titulo e items

---

## 3. Consistencia de cores

Revisao geral:
- Palette principal: roxo (`#a855f7`) para acentos decorativos, verde (`#4ade80` / `#16A34A`) para CTAs e tags positivos, azul (`#60A5FA`) para info boxes, ciano (`#22d3ee`) para glitch
- Verificar que todas as seccoes dark usam `#020617` ou `#0a0a0f` de forma consistente
- Eyebrows: roxo na seccao "Para quem e", verde na Agenda — manter esta diferenciacao intencional
- Borders: uniformizar em `rgba(255,255,255,0.08)` para todas as seccoes dark

---

## Detalhes tecnicos

### Ficheiro: `src/pages/Video.tsx`

1. **Linha 2**: adicionar import de `Sparkles` do lucide-react
2. **Linha 300**: reduzir font-size do subtitulo e aumentar max-w
3. **Linhas 324-327**: actualizar horario para 10h00, duracao para 45 min, icon investimento para Sparkles
4. **Linhas 348-349**: aumentar padding e font-size do CTA
5. **Linhas 616-681**: redesenhar Agenda com cards em grid 2x2, numeros decorativos, hover effects melhorados

