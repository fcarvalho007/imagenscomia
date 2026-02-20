

# Reestruturar seccao "Video e o formato que o mercado exige" + remover blocos + upgrade Agenda

## Resumo

3 alteracoes principais na pagina /video:

1. Substituir video de fundo da seccao por novo MP4 rosa, redesenhar layout dos 4 cards (2 esquerda + 2 direita com video ao centro), remover subtitulos e "Quando isto faz sentido"
2. Remover bloco "O que muda depois de te inscreveres" (seccao inteira, linhas 511-542)
3. Tornar seccao Agenda mais cinematografica (fundo escuro em vez de claro)

---

## 1. Seccao "Video e o formato que o mercado exige" (linhas 403-474)

### Video de fundo
- Copiar `user-uploads://4_rosa_video_webinar_frederico.mp4` para `public/videos/rosa-video.mp4`
- Substituir `splash-branco.mp4` por `rosa-video.mp4` como source do video de fundo

### Remover textos
- Remover os 3 paragrafos ("O pedido e quase sempre o mesmo...", "O bloqueio tambem...", "A IA ajuda...")
- Remover o bloco "Quando isto faz sentido" (linha decorativa verde + subtitulo h3)

### Novo layout dos cards — 2 | video | 2
- Manter o titulo "Video e o formato que o mercado exige" centrado no topo
- Abaixo, criar um layout de 3 colunas no desktop:
  - Coluna esquerda: cards 1 e 2 empilhados verticalmente
  - Centro: espaco vazio (o video de fundo e visivel — a "bola rosa" fica no meio)
  - Coluna direita: cards 3 e 4 empilhados verticalmente
- Em mobile: grid de 2 colunas simples (2x2)
- Ajustar overlay para ser mais subtil no centro (gradient radial transparente ao centro) para que o video sobressaia entre os cards

### CSS grid
```
Desktop: grid-cols-[1fr_1.2fr_1fr] com gap-6
Tablet: grid-cols-2
Mobile: grid-cols-1
```

---

## 2. Remover seccao "O que muda depois de te inscreveres" (linhas 511-542)

Remover toda a seccao, incluindo:
- Titulo "O que muda depois de te inscreveres"
- Cards "Template de Briefing de Video" e "Checklist publicavel vs rascunho"
- Texto "Serao referidas opcoes gratuitas e pagas..."

Tambem remover o array `deliverables` (linhas 137-140) e os imports nao utilizados (FileText, CheckSquare).

---

## 3. Seccao Agenda mais cinematografica (linhas 544-587)

- Fundo: de `#f8f9fa` (claro) para fundo escuro (`#0a0a0f`) com estilo consistente com o resto da pagina
- Eyebrow "Agenda · 45 min": cor verde (#4ade80) em vez de azul
- Titulo "O que acontece durante a sessao": branco
- Numeros (001, 002...): cor verde
- Texto dos items: branco/cinza claro
- Tags (CORE, AO VIVO): manter verde
- Bordas dos items: `rgba(255,255,255,0.08)` em vez de `rgba(0,0,0,0.06)`
- Adicionar um subtle glow/border nos items ao hover

---

## Detalhes tecnicos

### Ficheiros
- Copiar: `user-uploads://4_rosa_video_webinar_frederico.mp4` para `public/videos/rosa-video.mp4`
- Editar: `src/pages/Video.tsx`

### Edicoes em Video.tsx
1. Linhas 137-140: remover array `deliverables`
2. Imports: remover `FileText`, `CheckSquare` se nao utilizados noutro lado
3. Linhas 403-474: reestruturar seccao completa (novo layout 2|centro|2, novo video, remover subtitulos)
4. Linhas 511-542: remover seccao "O que muda"
5. Linhas 544-587: redesign da Agenda para tema escuro cinematografico

