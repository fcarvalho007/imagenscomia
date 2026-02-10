

# Redesign Completo: Dark Theme para Editorial Clean (Imagens IA)

## Resumo

Reconstrucao total da landing page. Muda de dark theme para design editorial limpo (branco dominante, azul forte). Muda o tema do webinar de "IA empresarial geral" para "Criar imagens profissionais com IA". Todo o copy, cores, tipografia e componentes sao reescritos.

## Alteracoes Globais

### index.html
- Novo title: "Criar Imagens com IA para Empresas — Webinar Gratuito 18 Fev 10h"
- Novas meta tags (description, og:title, og:description, keywords)
- Schema.org atualizado com novo nome do evento
- Manter Google Fonts (Montserrat, Inter, JetBrains Mono) - remover peso 600/700 de Inter nao usado

### index.css — Paleta completamente nova
- Remover todas as variaveis dark theme (bg-primary, bg-secondary, bg-card, accent-blue/cyan, glass-card, grid-pattern, glow-*)
- Nova paleta light:
  - background: branco (#FFFFFF)
  - foreground: ink-900 (#0F172A)
  - surface: #F1F5F9, off-white: #F8FAFC
  - border: #E2E8F0
  - blue-600: #2563EB (accent primario)
  - green-600: #16A34A (CTA free)
  - amber-500: #F59E0B (CTA premium)
  - red-500: #EF4444 (urgencia)
  - ink-700: #334155, ink-500: #64748B, ink-400: #94A3B8
- Body: font-size 16px, line-height 1.6, color ink-700
- Headings: Montserrat, color ink-900
- Novas utilities: shadow-sm/md/lg/blue/green
- Remover: glass-card, glow-green, glow-amber, glow-blue, text-gradient, gradient-main, bg-primary-dark, bg-secondary-dark, grid-pattern

### tailwind.config.ts
- Atualizar variaveis de cor para light theme
- Adicionar cores ink, surface, off-white
- Manter shadcn compat

## Alteracoes por Componente (13 ficheiros)

### 1. StickyTopBar.tsx
- Fundo branco, border-bottom cinza
- Texto Inter 500, 13px, ink-700
- Botao "Reservar lugar" azul-600, radius-full, pequeno

### 2. MirrorCopySection.tsx — Copy novo (imagens IA)
- Fundo off-white, border-bottom
- Label "ESTE WEBINAR E PARA TI SE:" em blue-600
- 5 novos pontos sobre imagens IA (designer caro, resultados maus, stock generico, etc)
- Botoes: verde "Inscrever gratis" + ambar "Premium Pass EUR15"

### 3. HeroSection.tsx — Copy novo + video placeholder
- Fundo branco
- Label: "WEBINAR GRATUITO . 18 FEVEREIRO"
- H1: "Como Criar Imagens Profissionais com IA para a Tua Empresa — Sem Designer"
- "Sem Designer" com sublinhado decorativo azul
- Subheadline: metodo briefing para imagem em 3 minutos
- Video placeholder: container 16:9, icone play, fundo surface
- 4 badges removidos (simplificado)

### 4. PricingCardsSection.tsx — Redesign light
- Fundo off-white
- Card gratis: fundo branco, border cinza, shadow-sm, features atualizadas (imagens IA)
- Card premium: fundo branco, border 2px blue-600, shadow-blue, badge RECOMENDADO
- Mobile: premium PRIMEIRO (mais conversao)
- Features atualizadas para contexto imagens IA

### 5. RegistrationModal.tsx — Redesign light
- Modal fundo branco, shadow-lg, sem glassmorphism
- Cores de texto ink-900/ink-500
- Botoes azul-600 e texto cinza
- Copy atualizado para contexto imagens

### 6. PresenterSection.tsx — Redesign light
- Fundo branco, borders top/bottom
- Foto placeholder: circulo blue-50, border blue-100, iniciais blue-600
- Tagline: "17 anos" (nao 20)
- Grid credenciais: fundo off-white, border cinza (sem glassmorphism)
- Card 5 span-2 com marcas em blue-600
- Card 6 removido (integrado no card 5)

### 7. ChallengesSection.tsx — Copy novo (6 pain points imagens)
- Fundo off-white
- Cards fundo branco, border cinza, shadow-sm (sem glassmorphism)
- Numeracao ink-300 (subtil, nao colorida)
- 6 novos pain points sobre imagens IA
- Fecho: "Em 75 minutos, mostro o metodo completo"

### 8. ProgramSection.tsx — Copy novo (3 sistemas imagens)
- Fundo branco
- Cards com border-left colorida (azul, cyan, verde) em vez de glassmorphism
- Sistema 1: "O Metodo do Prompt Perfeito"
- Sistema 2: "Imagens para Redes Sociais e Anuncios"
- Sistema 3: "Escalar Producao Visual Sem Equipa"
- Badges "AO VIVO" em blue-50/blue-600

### 9. AudienceSection.tsx — Copy novo
- Fundo off-white
- Coluna esquerda: border-top verde, 5 targets sobre imagens/marketing
- Coluna direita: border-top cinza, 2 exclusoes (designer profissional, solucao magica)
- Sem glassmorphism, cards limpos

### 10. MasterclassSection.tsx — Redesign light + copy novo
- Fundo branco, border-top
- Card central: off-white, border-strong, border-top 3px blue-600
- Titulo: "IA para Imagens: Implementacao Completa"
- Features atualizadas (50 prompts por tipo imagem)
- Botao blue-600

### 11. FAQSection.tsx — Copy atualizado + redesign
- Fundo off-white
- Accordion items: fundo branco, border cinza (sem glassmorphism)
- Perguntas/respostas atualizadas para contexto imagens
- Icone +/- em blue-600

### 12. CTAFinalSection.tsx — Redesign dark (unica seccao escura)
- Fundo ink-900 (#0F172A)
- H2 branco: "Imagens profissionais com IA. Sem designer. Sem agencia. Sem esperas."
- Linha 2 em blue-600
- Botao 1: fundo branco, texto ink-900
- Botao 2: fundo blue-600, branco
- Garantias em branco/40%

### 13. FooterSection.tsx — Redesign dark
- Fundo #060D1A
- Texto branco/30%
- Links hover branco/60%

## ScrollReveal.tsx
- Manter como esta (fade-in animations funcionam em ambos os temas)

## useRegistrationModal.tsx
- Sem alteracoes (logica mantida)

## Responsividade
- Mobile-first em todos os componentes
- Grids: 1 col mobile, 2 col md+
- Botoes full-width mobile, inline desktop
- H1: 28px mobile / 40px desktop
- Container padding: 16px mobile / 24px desktop
- Pricing: Premium card primeiro em mobile

## Resultado
Pagina editorial limpa, branco dominante, alta legibilidade, mobile-first. Unica seccao escura e o CTA final + footer. Contraste WCAG 4.5:1+ em todo o lado. Copy focado em "criar imagens profissionais com IA".

