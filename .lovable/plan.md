

# Email pós-evento para novos inscritos

## Problema
Quem se inscreve agora (após 5 de Março) recebe o email de confirmação original com links de calendário e "Até dia 5 de Março" — que já não faz sentido porque o evento já aconteceu.

## Solução
Modificar a `send-video-confirmation` para detectar se o webinar já decorreu e enviar um template diferente.

### 1. Nova lógica na edge function `send-video-confirmation/index.ts`
- Verificar se a data actual é posterior a `2026-03-05T11:00:00Z` (fim do webinar)
- Se sim: usar template `video_confirmation_post_event` (ou fallback HTML dedicado)
- Se não: manter comportamento actual (template `video_confirmation`)

### 2. Novo fallback HTML `buildPostEventHtml(fname)`
Conteúdo do email:
- "O webinar já decorreu" — tom informativo
- Oferta Premium Pass com preço dinâmico:
  - Se `new Date() < 2026-03-06T00:00:00Z` (até final de hoje 5 Março): **€15+IVA** (early bird)
  - Caso contrário: **€27+IVA**
- Inclui: gravação HD, sessão Q&A (10 Março 14h30), guia de prompts
- CTA: link para `/upgrade-video`
- Bloco opcional da Masterclass (12 Março, €47+IVA → €97+IVA)
- Assinatura Frederico Carvalho / DIGITALFC

### 3. Novo template DB `video_confirmation_post_event`
- Inserir na tabela `email_templates` com subject e html_body
- Subject: "O webinar já decorreu — mas ainda podes aceder à gravação, {{fname}}"
- HTML com `{{fname}}` e `{{price}}` como variáveis

### 4. Preço dinâmico
A edge function calcula o preço com base na data:
- Até 5 Março 23:59 (Lisboa, UTC+0): €15+IVA → texto "Early Bird — só hoje"
- A partir de 6 Março: €27+IVA

### Ficheiros alterados
- `supabase/functions/send-video-confirmation/index.ts` — adicionar detecção pós-evento + fallback HTML + preço dinâmico
- DB: inserir template `video_confirmation_post_event` na tabela `email_templates`

