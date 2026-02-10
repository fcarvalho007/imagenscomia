
# Primeira Dobra e Modal — Redesign Visual Premium

## Resumo

Elevar visualmente a primeira dobra (StickyTopBar + MirrorCopy + Hero) e o modal de registo com tecnicas de UX/UI de alta conversao: melhor hierarquia visual, micro-interacoes, espacamento, e um modal mais polido e profissional.

---

## 1. StickyTopBar — Mais impactante

**Atual:** Fundo branco plano com borda fina, pouco contraste.

**Proposta:**
- Fundo com gradiente subtil (`bg-gradient-to-r from-ink-900 to-blue-700`) com texto branco — cria contraste imediato e destaque
- Ponto vermelho com animacao `animate-pulse` para reforcar urgencia ("AO VIVO")
- Botao CTA com fundo branco e texto blue-600 (inversao) para se destacar do fundo escuro
- Padding ligeiramente maior em mobile para melhor toque

---

## 2. MirrorCopySection — Editorial elegante

**Atual:** Fundo off-white cinzento, setas azuis simples, visualmente "flat".

**Proposta:**
- Remover fundo off-white — usar `bg-background` (branco) para continuidade visual com o hero
- Remover a border-b inferior
- Cada ponto recebe um card subtil: fundo `bg-blue-50` com `border border-blue-100 rounded-lg p-4` — cria profundidade sem peso
- Substituir seta `->` por numeros circulares azuis (01, 02, 03) para ritmo visual
- Meta row (data/hora) com icones pequenos (Calendar, Clock, Users) para tornar a informacao mais scannable
- Aumentar espacamento vertical entre pontos

---

## 3. HeroSection — Impacto visual maximo

**Atual:** Titulo + subtitulo + placeholder de video + 2 botoes. Funcional mas sem drama visual.

**Proposta:**
- Remover o label "WEBINAR GRATUITO - 18 FEVEREIRO" (redundante com sticky bar e mirror copy)
- Titulo com gradiente no "Sem Designer": `bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent` em vez do underline — mais moderno
- Subtitulo com tamanho ligeiramente maior (`text-xl`) e `text-ink-600` para melhor leitura
- Video placeholder com hover effect: escala 1.02 + sombra aumentada ao passar o rato, cursor pointer — convida a interacao
- Botoes CTA com icones: check icon no gratuito, sparkles/star no premium — guiam a acao
- Adicionar badge de social proof abaixo dos botoes: "127 lugares reservados" com avatar stack (3 circulos sobrepostos) — urgencia social

---

## 4. Modal de Registo — Polimento premium

### 4a. Upsell (primeira tela do modal)

**Atual:** Titulo direto, lista com X vermelhos, caixa vermelha. Funcional mas visualmente agressivo.

**Proposta:**
- Animacao de entrada mais sofisticada: `scale: 0.95 -> 1` com `spring` transition
- Titulo reformulado: "Antes de continuar..." (menos confrontacional)
- Subtitulo mais suave: "Com a versao gratuita, vais perder acesso a:"
- Cada item perdido num mini-card com fundo `bg-red-50/50` e `border-l-2 border-red-400` — menos agressivo que X vermelho puro
- Substituir icone X por `MinusCircle` (lucide) em `text-red-400` — menos alarmante
- Caixa de urgencia: trocar fundo vermelho por `bg-amber-50 border-amber-200` com icone `Clock` — urgencia sem alarme
- Botao premium com gradiente: `bg-gradient-to-r from-blue-600 to-blue-700` + icone `Sparkles`
- Botao "continuar gratis" com sublinhado ao hover em vez de mudanca de cor

### 4b. Formulario (segunda tela)

**Atual:** Inputs basicos + botao verde. Simples.

**Proposta:**
- Adicionar icone decorativo no topo: emoji ou icone `Ticket` com fundo `bg-green-50 rounded-full p-3`
- Inputs com icones internos: `User` no nome, `Mail` no email (dentro do input, lado esquerdo)
- Botao submit com icone `ArrowRight` apos o texto
- Progress dots no fundo do modal (2 pontos, indicando step 2/2) para contexto de navegacao

### 4c. Confirmacao (terceira tela)

**Atual:** Emoji + texto. Basico.

**Proposta:**
- Animacao de confetti ou checkmark animado (circulo verde com check que escala com spring)
- Texto de confirmacao com destaque visual no email (pill azul com fundo blue-50)
- Adicionar botao "Adicionar ao calendario" como acao secundaria util

---

## 5. Detalhes tecnicos

### Ficheiros alterados:
- `src/components/landing/StickyTopBar.tsx` — fundo escuro, pulse dot, CTA invertido
- `src/components/landing/MirrorCopySection.tsx` — cards azuis, numeros circulares, icones meta
- `src/components/landing/HeroSection.tsx` — gradiente titulo, video hover, icones CTA, social proof
- `src/components/landing/RegistrationModal.tsx` — redesign completo das 3 telas

### Dependencias:
- Nenhuma nova — usa apenas lucide-react (ja instalado) e framer-motion (ja instalado)

### Icones novos utilizados (lucide-react):
- `Calendar`, `Clock`, `Users`, `Check`, `Sparkles`, `ArrowRight`, `MinusCircle`, `Mail`, `User`, `Ticket`
