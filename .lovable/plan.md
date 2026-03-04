

# Auditoria Final + Correcao do senderId E-goi

## Descoberta principal

O `senderId` no `send-email/index.ts` esta errado. O codigo envia `"2"` (o ID numerico do remetente), mas a API Transactional V2 da E-goi espera a **hash do remetente**. Confirmei na documentacao oficial:

> `senderId` (required, string): "The code identification of the sender profile to be used."

O exemplo da docs usa `"senderId": "1234"` — que e a hash, nao o ID sequencial. Tu forneceste a hash correcta da imagem do E-goi: `f345a6c8e09b43ee3ceb18a4519fc9b4`.

**Este e o motivo pelo qual a E-goi falha em 100% dos envios** — o senderId `"2"` nao e reconhecido pelo endpoint transactional.

## Sobre o CNAME Transacional

**Nao precisas de criar CNAME.** O CNAME transactional e apenas para branding dos links de tracking nos emails (para que os links mostrem `digitalfc.pt` em vez de `egoiapp.com`). Os emails enviam perfeitamente sem ele. O dominio `digitalfc.pt` ja esta autenticado (SPF/DKIM OK) — isso e o que importa para o envio.

## Alteracoes

### Ficheiro: `supabase/functions/send-email/index.ts`

1. **Corrigir senderId**: Mudar de `EGOI_SENDER_ID = 2` para a hash `"f345a6c8e09b43ee3ceb18a4519fc9b4"`
2. **Adicionar campo `group`**: Aceitar um parametro opcional `group` no request body para categorizar emails no painel E-goi (ex: "confirmation", "reminder")

```typescript
// ANTES
const EGOI_SENDER_ID = 2;
// ...
senderId: String(EGOI_SENDER_ID),

// DEPOIS
const EGOI_SENDER_HASH = "f345a6c8e09b43ee3ceb18a4519fc9b4";
// ...
senderId: EGOI_SENDER_HASH,
```

### Teste de envio

Apos o deploy, invocar `test-send-email` para enviar email de teste para `fredericodigital@gmail.com` e confirmar que a E-goi aceita a hash e entrega o email.

### Reenvio dos emails falhados

Apos confirmar o teste, invocar `resend-failed-emails` para os 166 emails pendentes (142 reminder_24h + 17 followup_prewebinar + 6 confirmation + 1 group_confirmation).

## Resumo da infraestrutura — tudo OK para amanha

| Componente | Estado |
|---|---|
| `send-email` no config.toml | OK |
| `resend-failed-emails` no config.toml | OK |
| Auth via service role key | OK (todas as funcoes usam) |
| Auth via x-cron-secret | OK (para cron jobs) |
| `reminder_1h` (amanha ~09:00 UTC) | OK — deployado |
| `postwebinar` (amanha ~12:30 UTC) | OK — deployado |
| `postwebinar_day1` (06 Mar) | OK — deployado |
| `postwebinar_day3` (08 Mar) | OK — deployado |
| `postwebinar_closing` (10 Mar) | OK — deployado |
| Templates na BD | OK — todas as funcoes leem de `email_templates` com fallback HTML |
| Deduplicacao | OK — todas verificam `message_logs` antes de enviar |
| CNAME transacional | Nao necessario |

