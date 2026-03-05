

# Transformar `/video` em página de venda da gravação (post-evento)

## Contexto
A mesma estratégia usada no webinar de imagens: a landing page de inscrição gratuita transforma-se numa página de venda do pack de gravação, agora que o evento já aconteceu.

## Alterações

### 1. Criar `/video-lp` — Arquivo da landing page original
- Copiar `src/pages/Video.tsx` para `src/pages/VideoLP.tsx`
- Exportar como `VideoLPPage`
- Adicionar rota `/video-lp` no `App.tsx`

### 2. Transformar `/video` — De inscrição gratuita para venda da gravação
Adaptar o conteúdo existente (mantendo o design dark/cinemático do vídeo) com estas mudanças:

**Hero:**
- Badge: "WEBINAR GRATUITO · AO VIVO · 5 MARÇO" → "GRAVAÇÃO DISPONÍVEL"
- Remover countdown
- Headline mantém "Aprende a criar vídeos com IA" mas subtítulo muda para "O webinar já aconteceu — acede agora à gravação completa + pack de apoio"
- CTA: "Garantir inscrição gratuita" → "Garantir acesso (15 €)" ou "Garantir acesso (27 €)" (dinâmico)

**Preço dinâmico:**
- Até 5 Março 23:59 (hoje): €15+IVA — badge "Early Bird — só hoje"
- A partir de 6 Março: €27+IVA

**Sticky bars:**
- Top bar: remover countdown, mostrar "GRAVAÇÃO DISPONÍVEL" + preço + CTA
- Mobile bottom CTA: actualizar texto e preço

**Secções mantidas (com ajustes mínimos):**
- Logo marquee (igual)
- "O mercado exige Vídeo" (igual)
- "Para quem é / Não é para" (igual)
- Agenda "O que acontece durante a sessão" (igual — descreve o conteúdo da gravação)
- Testemunhos (igual)
- FAQ (actualizar "assistir ao vivo" → já está gravado)
- Presenter/Frederico (igual)

**Secção nova: Pack incluído** (antes do CTA final)
- Lista dos entregáveis: gravação HD ~60min, guia de prompts, sessão Q&A (10 Março 14h30)
- Inspirado na secção de pack da `/gravacao`

**Fluxo de compra:**
- Clicar no CTA abre modal de registo (nome + email + whatsapp + termos)
- Após registo: redireciona para `/upgrade-video` (funil existente com checkout)
- `registrationSource: "video"` mantido

### 3. Actualizar `App.tsx`
- Adicionar rota `/video-lp` → `VideoLPPage`

### Ficheiros alterados
- `src/pages/VideoLP.tsx` — **novo** (cópia do Video.tsx actual)
- `src/pages/Video.tsx` — transformado em página de venda
- `src/App.tsx` — nova rota `/video-lp`

