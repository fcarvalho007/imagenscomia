

# Reenviar confirmações de pagamento falhadas (2 clientes)

## Diagnóstico

Encontrei exactamente **2 clientes** que pagaram no dia 5 de Março e **não receberam** o email de confirmação de pagamento:

| Cliente | Email | Plano | Hora pgto | Erro |
|---------|-------|-------|-----------|------|
| Vanessa | a.vanessamaral@gmail.com | video-premium | 21:19 | Resend quota diária excedida |
| José | josemmoreira1@gmail.com | video-premium | 15:53 | Resend quota diária excedida |

**Causa**: O webhook `eupago-webhook` chama o Resend directamente (não usa o `send-email` centralizado com fallback Brevo/E-goi), por isso quando a quota do Resend esgotou, não houve fallback.

Todos os outros compradores de vídeo receberam a confirmação com sucesso.

## Solução imediata

Usar a função `resend-failed-emails` que já existe e já usa o `send-email` centralizado (Brevo → Resend → E-goi) para reenviar:

```
template_key: "video_payment_premium"
email_key: "video_payment_premium"
```

Isto vai detectar automaticamente os 2 registos com falha, confirmar que não têm envio bem-sucedido, e reenviar via Brevo.

## Melhoria estrutural (opcional, recomendada)

Migrar o bloco de envio de emails ao cliente no `eupago-webhook` (linhas 701-861) para usar `send-email` centralizado em vez de chamar Resend directamente. Isto garante que futuros pagamentos nunca falham por quota de um único provider.

### Ficheiro a editar
- `supabase/functions/eupago-webhook/index.ts` — substituir chamadas directas a `api.resend.com` por chamadas a `send-email`

## Plano de acção

1. **Reenviar agora** os 2 emails falhados via `resend-failed-emails`
2. **Migrar** o webhook para usar `send-email` centralizado (previne recorrência)

