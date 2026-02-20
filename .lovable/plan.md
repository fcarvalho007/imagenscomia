
# Nova pagina /live-video — Duplicar /live adaptada ao contexto de video

## Resumo

Criar uma nova rota `/live-video` que duplica o layout da `/live` mas adaptada ao webinar de video (3 de Marco). Nao altera nada na `/live` existente.

---

## Ficheiros a criar

### 1. `src/components/webinar/videoWebinarConfig.ts`

Configuracao dedicada ao webinar de video:
- `title`: "Cria Video Profissional com IA"
- `metaLine`: "Segunda-feira, 3 de Marco · 10h00 (Portugal)"
- `summary`: "De briefing a clip publicavel em minutos — com metodo e exemplos reais."
- `startDate`: `new Date("2026-03-03T10:00:00+00:00")` (March in Portugal = UTC)
- `durationMinutes`: 60
- `isLive`: false
- `YOUTUBE_VIDEO_ID`: placeholder (mesmo ID ou vazio)
- `masterclassDate`: `new Date("2026-03-05T10:00:00+00:00")` — para o countdown da Masterclass
- `INSTAGRAM_URL`: mesmo URL existente

### 2. `src/components/webinar/VideoWebinarSidebar.tsx`

Duplicar `WebinarSidebar.tsx` com estas alteracoes:

**Card 1 — Premium Pass (EUR 15 + IVA):**
- Manter estrutura, preco e estilo accent
- Novos bullets:
  1. "Sessao extra de Q&A em grupo (30 min)" (icone Headphones)
  2. "Lista das melhores ferramentas por objetivo (curadoria pratica)" (icone FileText)
  3. "Manual de apoio ao conhecimento em video (passo a passo)" (icone FileText)
- CTA: "Garantir Premium Pass"

**Card 2 — Masterclass Imagem → Video (EUR 47 + IVA):**
- Manter estrutura existente
- Adicionar countdown inline (dias/horas/minutos) contando ate 5 de Marco, 10h00, Europe/Lisbon
- Formato: "Comeca em: 12d 04h 18m"
- Se expirado: mostrar "A decorrer agora"
- Countdown renderizado dentro do card, entre o dateLine e o CTA

### 3. `src/components/webinar/VideoWebinarVideoArea.tsx`

Duplicar `WebinarVideoArea.tsx` mas sempre mostrar o estado "upcoming" (nao live, nao ended):

- Badge: "A sessao comeca em breve" (icone Clock animado)
- Countdown para 3 de Marco 10h00 Europe/Lisbon (reutilizar `useCountdown`)
- Texto de apoio: "Webinar gratuito — Video com IA. Duracao aproximada: 60 min."
- Botao "Guardar no Google Calendar":
  - Abre link Google Calendar com campos preenchidos
  - URL format: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=...&dates=...&details=...&location=Online&ctz=Europe/Lisbon`
  - Evento: 3 Mar 2026, 10:00-11:00, Europe/Lisbon
  - Titulo: "Webinar gratuito — Video com IA"
  - Descricao: "Sessao gratuita ao vivo. Apos inscricao, o acesso e informacoes serao enviados por email."
- Estilo: mesmo dark container com grid pattern do VideoArea original, botao primary azul

### 4. `src/components/webinar/VideoWebinarContent.tsx`

Duplicar `WebinarContent.tsx` com bullets adaptados ao video:
- "Como escolher a ferramenta certa para criar video com IA"
- "Processo pratico: do briefing ao primeiro clip"
- "Checklist para manter consistencia sem complicar"

### 5. `src/pages/WebinarLiveVideo.tsx`

Duplicar `WebinarLive.tsx` usando os novos componentes:
- Importar `videoWebinarConfig` em vez de `WEBINAR_CONFIG`
- Usar `VideoWebinarVideoArea`, `VideoWebinarSidebar`, `VideoWebinarContent`
- Reutilizar `WebinarFooter` e `WhatsAppSupportButton`
- Wrap com `RegistrationModalProvider`
- Titulo H1 e summary vindos do config de video
- Meta title: "Cria Video Profissional com IA — DIGITALFC"

---

## Ficheiros a modificar

### 6. `src/App.tsx`

- Importar `WebinarLiveVideo` de `./pages/WebinarLiveVideo`
- Adicionar rota: `<Route path="/live-video" element={<WebinarLiveVideo />} />`

---

## Detalhes tecnicos

### Google Calendar URL

Construir a URL programaticamente:

```text
https://calendar.google.com/calendar/render
  ?action=TEMPLATE
  &text=Webinar+gratuito+—+Vídeo+com+IA
  &dates=20260303T100000/20260303T110000
  &details=Sessão+gratuita+ao+vivo.+Após+inscrição,+o+acesso+e+informações+serão+enviados+por+email.
  &location=Online
  &ctz=Europe/Lisbon
```

O botao abre num novo tab (`target="_blank"`).

### Countdown da Masterclass (Card 2)

Usar `useCountdown(new Date("2026-03-05T10:00:00+00:00"))` e formatar como:
- `Comeca em: ${days}d ${hours}h ${minutes}m`
- Se `isExpired`: mostrar "A decorrer agora" com badge verde

### Ficheiros que NAO sao alterados

- `src/pages/WebinarLive.tsx` — intocado
- `src/components/webinar/WebinarSidebar.tsx` — intocado
- `src/components/webinar/WebinarVideoArea.tsx` — intocado
- `src/components/webinar/webinarConfig.ts` — intocado

---

## Resumo de ficheiros

| Ficheiro | Accao |
|---|---|
| `src/components/webinar/videoWebinarConfig.ts` | Criar |
| `src/components/webinar/VideoWebinarSidebar.tsx` | Criar |
| `src/components/webinar/VideoWebinarVideoArea.tsx` | Criar |
| `src/components/webinar/VideoWebinarContent.tsx` | Criar |
| `src/pages/WebinarLiveVideo.tsx` | Criar |
| `src/App.tsx` | Modificar (nova rota) |
