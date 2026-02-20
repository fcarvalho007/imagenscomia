

# Upgrade cinematografico — 3 seccoes da pagina /video

## Resumo

Refinar 3 seccoes: (1) cards + titulo com glitch effect e icones roxos, (2) "Para quem e" com melhor UX/UI, (3) Agenda mais cinematografica.

---

## 1. Seccao "Video e o formato que o mercado exige"

### Titulo com efeito Glitch

Aplicar CSS glitch effect no titulo completo (ou apenas em "mercado exige"). O efeito usa pseudo-elementos `::before` e `::after` com `data-text` para criar separacao de cor (vermelho/ciano) com animacoes de skew e translate subtis. Activar ao hover e tambem com animacao idle muito suave.

Cores do glitch: `::before` em `#a855f7` (roxo) e `::after` em `#22d3ee` (ciano) — alinhado com a paleta do site em vez de vermelho.

### Icons roxos nos cards

Alterar a cor dos icones dos 4 cards de verde (`#4ade80`) para roxo (`#a855f7`). Manter o hover dos cards em verde para contraste.

### Numeros de fundo dos cards

Alterar a cor dos numeros grandes (01, 02, 03, 04) para um tom roxo muito subtil (`rgba(168,85,247,0.08)`) em vez do branco actual.

### Hover dos cards

Manter border verde no hover mas adicionar um subtil glow roxo nos icones ao hover.

---

## 2. Seccao "Para quem e — e para quem nao e"

### Layout melhorado

- Adicionar eyebrow "PUBLICO-ALVO" em roxo acima do titulo
- Titulo: manter texto, adicionar gradient roxo/azul em "para quem nao e"
- Cards: fundo com gradiente subtil (nao flat), borders mais visiveis
- "Certo para": icones verdes com check marks mais vistosos, texto mais legivel (opacity 0.75 em vez de 0.65)
- "Nao e para": manter mais apagado mas com melhor contraste
- Adicionar numeracao subtil nos items "Certo para" (01, 02, 03, 04) do lado esquerdo
- Hover nos cards: border glow subtil
- Spacing: mais padding interno (p-7 em vez de p-6)

---

## 3. Seccao Agenda — mais cinematografica

### Fundo com profundidade

- Manter fundo `#0a0a0f` mas adicionar um gradient radial roxo/azul muito subtil ao centro (opacity ~5%) para profundidade
- Adicionar grain/noise overlay igual ao hero

### Items da agenda

- Numeros (001-004): gradient roxo-verde em vez de verde flat
- Aumentar font-size do titulo de cada item de 13px para 15px
- Aumentar padding vertical dos items (py-5 em vez de py-3.5)
- Adicionar icone ou barra lateral decorativa roxa do lado esquerdo
- Tags (CORE, AO VIVO): manter verde mas com borda mais visivel
- Hover: background mais pronunciado com borda lateral roxa

### Linha decorativa

Adicionar uma linha horizontal decorativa com gradient roxo-verde entre o titulo e os items da agenda.

---

## Detalhes tecnicos

### Ficheiro: `src/pages/Video.tsx`

#### Glitch CSS (novo bloco `<style>`)
Adicionar keyframes `glitch-1`, `glitch-2`, `glitch-3` com pseudo-elementos. O titulo tera um wrapper `<span>` com `className="glitch"` e `data-text="mercado exige"`. Cores adaptadas: `#a855f7` e `#22d3ee`.

#### Edicoes:
1. **Linhas 410-415**: Redesenhar titulo com glitch effect em "mercado exige"
2. **Linhas 433, 452**: Alterar cor dos icones de `#4ade80` para `#a855f7`
3. **Linhas 430, 449**: Alterar cor dos numeros de fundo para `rgba(168,85,247,0.08)`
4. **Linhas 462-473**: Actualizar CSS `.pain-card` com hover roxo nos icones
5. **Linhas 476-509**: Redesenhar seccao "Para quem e" com eyebrow, melhor spacing, numeracao, hover effects
6. **Linhas 512-562**: Redesenhar Agenda com gradient de fundo, numeros com gradient, items maiores, decoracao roxa
7. Adicionar novo bloco `<style>` com keyframes do glitch

