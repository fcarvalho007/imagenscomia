

## 5 Correcoes ao Hero e LogoMarquee

### Ficheiros afectados

| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/HeroSection.tsx` | H1 em 2 linhas, espacamentos |
| `src/components/landing/LogoMarquee.tsx` | Titulo, logo Gemini |
| `src/assets/logos/gemini.png` | Substituir pelo novo logo |

---

### 1. H1 em 2 linhas

O problema e que o `<br />` esta a partir "Aprende a Criar Imagens" / "Profissionais com Inteligencia Artificial", mas no desktop o texto "Profissionais com Inteligencia Artificial" e demasiado longo e parte para uma terceira linha.

Solucao: mudar a quebra para depois de "Profissionais":

```text
Aprende a Criar Imagens Profissionais
com Inteligencia Artificial
```

Linha 1 fica mais longa mas cabe no max-width de 820px com o font-size actual (clamp 32-46px). O `<br />` move-se para depois de "Profissionais".

### 2. Logo Gemini

Substituir `src/assets/logos/gemini.png` pelo novo logo fornecido (`Google_Gemini_logo_2025.svg.png`). Este logo tem o texto "Gemini" incluido e e mais reconhecivel.

### 3. Espacamentos da primeira dobra

Pela imagem, ha demasiado espaco entre o badge "WEBINAR GRATUITO" e o H1, e entre o subheadline e os spec badges. Ajustes:

- Badge: `mb-4` passa a `mb-3` (reduzir gap para o H1)
- Subheadline: `marginTop: 16` fica, `marginBottom: 28` passa a `24` (reduzir gap para os badges)
- Spec badges: `mb-8` passa a `mb-6` (reduzir gap para o CTA)
- Padding geral: `pt-12 pb-14` passa a `pt-10 pb-12` em mobile; `md:pt-[60px] md:pb-[72px]` em desktop (ligeiramente mais compacto)

### 4. Titulo do LogoMarquee

Alterar "Plataformas abordadas no webinar" para "Plataformas a considerar".

### 5. ColorBends — ja esta activo

O componente ColorBends.tsx e ColorBends.css ja existem no projecto e estao importados no HeroSection. O efeito esta visivel na screenshot (o gradiente azul/roxo no fundo do hero). A opacidade esta a 0.4, o que e intencional para nao competir com o texto. Nao e necessaria nenhuma alteracao aqui — o efeito esta a funcionar correctamente.

### Resumo tecnico

| Correcao | Detalhe |
|---|---|
| H1 | `Aprende a Criar Imagens Profissionais<br />com Inteligencia Artificial` |
| Gemini | Copiar novo logo para `src/assets/logos/gemini.png` |
| Espacamentos | Reduzir paddings e margins no hero (~10-15% mais compacto) |
| Titulo marquee | "Plataformas a considerar" |
| ColorBends | Sem alteracao — ja activo e visivel |

