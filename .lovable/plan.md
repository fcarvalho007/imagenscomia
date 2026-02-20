

# Fix hero /video — 3 alteracoes

## Problema

1. O headline quebra em 4 linhas porque o container pai tem `maxWidth: 1040px`, limitando o H1 mesmo com `max-w-[1100px]`
2. O subtitulo "Sais com um sistema..." quebra em 2 linhas porque tem `max-w-[700px]`
3. O botao CTA precisa de ser maior e com texto diferente

## Alteracoes em `src/pages/Video.tsx`

### 1. Alargar container pai do hero (linha 251)

Alterar `maxWidth: 1040` para `maxWidth: 1200` no div container interior do hero. Isto permite que o H1 se expanda.

### 2. Subtitle numa linha (linha 300)

Alterar `max-w-[700px]` para `max-w-[900px]` para que o texto caiba numa unica linha no desktop.

### 3. Botao CTA maior + novo texto (linhas 346-353)

- Texto: "Garantir inscricao gratuita" para "Sim, quero inscrever-me gratis"
- Padding: `16px 32px` para `20px 48px`
- Font-size: adicionar `text-lg`
- maxWidth: `400` para `480`

## Ficheiro unico

`src/pages/Video.tsx` — 3 edicoes pontuais.

