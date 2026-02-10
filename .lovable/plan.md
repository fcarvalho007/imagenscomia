

# Adicionar Countdown Visual a StickyTopBar + Lazy Loading

---

## Alteracoes

### 1. StickyTopBar.tsx -- Adicionar countdown visual

A barra sticky actualmente mostra texto estatico "AO VIVO . QUARTA 18 FEV . 10H00 . GRATUITO". Substituir parte do texto por um countdown dinamico usando o hook `useCountdown` que ja existe.

Layout actualizado:
- Esquerda: ponto vermelho + "AO VIVO . 18 FEV . 10H00"
- Centro/Direita: countdown em blocos (DD:HH:MM:SS) com labels "dias/horas/min/seg"
- Botao CTA mantido

O countdown usa `useCountdown(new Date('2026-02-18T10:00:00'))` -- o mesmo hook ja existente no projecto.

Estilo dos blocos countdown:
- Cada unidade: fundo branco/10%, rounded, px-2 py-1
- Numero: Montserrat 700, 14px, branco
- Label: Inter 400, 9px, branco/60%
- Separador ":" entre blocos

### 2. PresenterSection.tsx -- Lazy loading na imagem

Adicionar `loading="lazy"` a tag `img` do Frederico Carvalho.

### 3. HeroSection.tsx -- Lazy loading no placeholder video

Nao ha imagem real no placeholder do video (e um div com icone Play), portanto nao ha alteracao necessaria aqui.

---

## Ficheiros alterados

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/StickyTopBar.tsx` | Adicionar countdown dinamico com useCountdown hook |
| `src/components/landing/PresenterSection.tsx` | Adicionar loading="lazy" a imagem |

Nenhuma dependencia nova. Nenhum ficheiro novo.

