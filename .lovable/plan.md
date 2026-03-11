

# Emails diferenciados pós-evento para novas inscrições

## Problema

Os emails enviados após pagamento (`eupago-webhook`) usam templates "pré-evento" com referências a sessões futuras (Q&A 10 Mar, Masterclass 12 Mar, links Zoom, botões de calendário). Quem se inscreve **agora** recebe informação irrelevante/confusa.

## Solução

Adicionar lógica temporal no `eupago-webhook` que detecta se a inscrição é **pós-evento** (após o cutoff de cada webinar) e envia templates alternativos focados em **acesso imediato** a gravações e recursos.

### Lógica de detecção

```text
imagens: postEventCutoff = 2026-02-18T11:00:00Z (já passou)
video:   postEventCutoff = 2026-03-05T11:00:00Z (já passou)

Se now > postEventCutoff → usar template pós-evento
Caso contrário → manter template actual (pré-evento)
```

### Templates pós-evento (4 novos, por webinar)

**Video — Premium/Gravação** (`video_payment_premium_postevent`):
- "Pagamento confirmado — acede já à gravação e recursos"
- Lista: gravação 70min, workbook PDF, guia GEMs, ficheiro GEM, áudio
- CTA: "Aceder aos Recursos" → `/recursos-video`
- Sem referências ao Q&A ou datas futuras

**Video — Masterclass** (`video_payment_masterclass_postevent`):
- "Pagamento confirmado — a gravação da Masterclass está disponível"
- Lista: gravação 3h, materiais exclusivos
- CTA: "Aceder à Gravação" → `/recursos-video`
- Sem Zoom/calendário

**Imagens — Premium/Gravação** (`imagens_payment_premium_postevent`):
- "Pagamento confirmado — acede já aos recursos"
- Lista: gravação completa, workbook, pack de recursos
- CTA: "Aceder aos Recursos" → `/recursos`

**Imagens — Masterclass** (`imagens_payment_masterclass_postevent`):
- "Pagamento confirmado — a gravação da Masterclass está disponível"
- CTA: "Aceder à Gravação" → `/recursos`

### Alteração no código

**Ficheiro**: `supabase/functions/eupago-webhook/index.ts`

Na secção de email ao cliente (linhas ~1046-1200), antes de construir os templates:

1. Definir cutoffs: `{ imagens: "2026-02-18T11:00:00Z", video: "2026-03-05T11:00:00Z" }`
2. `const isPostEvent = new Date() > new Date(cutoffs[custWebinar])`
3. Se `isPostEvent`, usar os novos HTML e template_keys com sufixo `_postevent`
4. Se não, manter o comportamento actual

Mesma estrutura de idempotência, dual logging, e fallback a `email_templates` DB — apenas muda o HTML e o `templateKey`.

### Também actualizar: `send-video-recursos-single`

**Ficheiro**: `supabase/functions/send-video-recursos-single/index.ts`

Remover referências temporais obsoletas dos templates (Q&A 10 Mar, Masterclass 12 Mar com Zoom/calendário) e substituir por versões "acesso imediato" — já que esta função é usada para envio manual via CRM e todos os eventos já passaram.

### Resumo de ficheiros

| Ficheiro | Alteração |
|----------|-----------|
| `supabase/functions/eupago-webhook/index.ts` | Adicionar detecção pós-evento + 4 templates HTML alternativos |
| `supabase/functions/send-video-recursos-single/index.ts` | Actualizar templates para remover referências a eventos passados |

