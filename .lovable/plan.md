

# Melhorias na secção Comunicação do CRM

6 funcionalidades a implementar nos módulos Email e SMS.

## 1. Preview de email em tempo real

Criar componente `EmailPreview.tsx` — mockup de desktop email client (estilo Gmail/Outlook simplificado) que renderiza o HTML do editor em tempo real via `dangerouslySetInnerHTML`. Mostrar remetente, assunto e corpo. Layout do `EmailTab` passa a `grid grid-cols-1 lg:grid-cols-[1fr,400px]` (semelhante ao SMS com o PhonePreview).

**Ficheiros:** `src/components/crm/comunicacao/EmailPreview.tsx` (novo), `EmailTab.tsx` (layout grid + passar subject/html ao preview)

## 2. Botão "Enviar teste para mim"

Adicionar botão no `EmailTab` junto ao "Enviar Email" que invoca `test-send-email` edge function (já existe) com o subject e html actuais. Mostra toast com resultado. O email do admin é obtido via `supabase.auth.getSession()`.

**Ficheiro:** `EmailTab.tsx`

## 3. Tab "Histórico" de envios

Adicionar terceira tab "Histórico" no `ComunicacaoView`. Componente `HistoricoTab.tsx` que faz query a `email_send_logs` agrupando por `(webinar, email_key, sent_at::date)` + contagem de sent/failed. Tabela simples: data, assunto/key, destinatários, taxa de sucesso. Também incluir SMS via `message_logs` where channel='sms'.

**Ficheiros:** `src/components/crm/comunicacao/HistoricoTab.tsx` (novo), `ComunicacaoView.tsx` (nova tab)

## 4. Agendamento de envio

Adicionar toggle "Enviar agora / Agendar" com DatePicker + input de hora no `EmailTab` e `SmsTab`. Quando agendado, em vez de enviar imediatamente, guarda na nova tabela `scheduled_sends` com campos: id, channel, subject, html/text, recipients (jsonb), scheduled_at, status, created_at. Uma edge function `process-scheduled-sends` (cron) processará os agendados. Por agora, implementar apenas o UI + tabela; o cron fica como fase 2.

**Ficheiros:** `EmailTab.tsx`, `SmsTab.tsx` (UI de agendamento), migração SQL (tabela `scheduled_sends`)

## 5. Aviso de Unicode no SMS

No `SmsTab`, detectar se `text` contém caracteres fora do GSM 7-bit (acentos, ç, ã, etc.). Se sim, ajustar `maxChars` para 70 e mostrar badge de aviso "Unicode detectado — limite 70 chars/SMS". A detecção usa regex: `/[^\x20-\x7E\n\r€£¥§¿¡ÄÖÑÜäöñüàèìòùÅåÆæßÉéØøÇ\u0394\u03A6\u0393\u039B\u03A9\u03A0\u03A8\u03A3\u0398\u039E]/`.

**Ficheiro:** `SmsTab.tsx`

## 6. Modal de confirmação antes do envio em lote

Antes de `handleSend` no `EmailTab` e `SmsTab`, mostrar Dialog com resumo: assunto (email) ou primeiras palavras (SMS), nº destinatários, segmento activo, hora de envio (agora ou agendada). Botão "Confirmar envio" dispara o envio real.

**Ficheiros:** `EmailTab.tsx`, `SmsTab.tsx`

---

## Resumo de ficheiros

| Ficheiro | Acção |
|----------|-------|
| `comunicacao/EmailPreview.tsx` | Criar — mockup email preview |
| `comunicacao/EmailTab.tsx` | Grid layout, preview, teste, agendamento, confirmação |
| `comunicacao/SmsTab.tsx` | Unicode warning, agendamento, confirmação |
| `comunicacao/HistoricoTab.tsx` | Criar — histórico de envios |
| `ComunicacaoView.tsx` | Adicionar tab Histórico |
| Migração SQL | Tabela `scheduled_sends` |

