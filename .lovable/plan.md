

# Avaliacao: E-goi Transactional como provider de email (substituir ou backup ao Resend)

## Contexto

Actualmente usas o Resend para todos os envios transaccionais (confirmacoes, lembretes, pos-webinar). O Resend tem limite de 2 req/s que ja causou 89 falhas. Ja tens a E-goi integrada para gestao de contactos (API Marketing — lista 5, tags), mas nao para envio de emails transaccionais.

## API Transactional da E-goi

A E-goi tem uma API Transactional V2 separada da API Marketing:

- **Endpoint**: `POST https://slingshot.egoiapp.com/api/v2/email/messages/action/send/single`
- **Auth**: Header `ApiKey: <key>`
- **Payload**: `domain`, `senderId` (obrigatorio), `senderName`, `to`, `subject`, `htmlBody`, tracking, etc.
- **Sem limite de rate** relevante para os teus volumes (~200 emails por batch)

### Requisitos para funcionar

1. **Activar Transactional** na conta E-goi (Menu > Configuracoes > Transactional > Activar)
2. **Sender ID**: Precisas do ID numerico do sender `frederico.carvalho@digitalfc.pt` na E-goi. Este sender precisa de estar verificado/autenticado (SPF/DKIM) na E-goi transactional
3. **Domain**: `digitalfc.pt` precisa de estar configurado como dominio na E-goi transactional (pode ser diferente do dominio da API Marketing)
4. **API Key**: A mesma key `EGOI_API_KEY` que ja tens pode funcionar, MAS a E-goi por vezes usa keys separadas para transactional vs marketing. Preciso que confirmes

## Recomendacao: E-goi como primario, Resend como fallback

### Vantagens

- Sem limites de rate para os teus volumes
- Ja tens conta e dominio configurado
- Consolidas tudo num provider (contactos + emails)
- Resend fica como seguranca se a E-goi falhar

### Arquitectura proposta

Criar uma funcao utilitaria `send-email/index.ts` que:

1. Tenta enviar via E-goi Transactional
2. Se falhar (timeout, 5xx, 403), tenta via Resend
3. Loga o provider usado em `email_send_logs`

Todas as 8+ Edge Functions de envio passam a chamar esta funcao em vez de chamar o Resend directamente. Isto centraliza a logica e elimina duplicacao.

```text
Edge Function (ex: reminder_24h)
  │
  └─> send-email (nova Edge Function utilitaria)
        ├─ Tentar E-goi Transactional API
        │   POST slingshot.egoiapp.com/api/v2/email/messages/action/send/single
        │   Headers: { ApiKey: EGOI_API_KEY }
        │   Body: { domain, senderId, senderName, to, subject, htmlBody }
        │
        ├─ Se falhar → fallback Resend
        │   POST api.resend.com/emails
        │   Headers: { Authorization: Bearer RESEND_API_KEY }
        │
        └─ Return { success, provider, messageId }
```

### Alternativa mais simples (sem funcao utilitaria)

Adicionar fallback inline em cada Edge Function. Mais rapido de implementar, mas duplica logica em 8 ficheiros. Nao recomendo.

## O que preciso de ti antes de implementar

1. **Confirmar que o Transactional esta activado** na tua conta E-goi. Vai a bo.e-goi.com > Configuracoes > Transactional. Se nao estiver, activa.
2. **Sender ID**: Preciso do ID numerico do sender `frederico.carvalho@digitalfc.pt` na E-goi. Podes encontrar em Configuracoes > Remetentes.
3. **Dominio**: Confirmar que `digitalfc.pt` tem SPF/DKIM configurado para transactional na E-goi (pode ser diferente da configuracao de marketing).
4. **API Key**: Confirmar se a key que ja tens (`EGOI_API_KEY`) funciona para transactional ou se precisa de uma key separada.

## Ficheiros a alterar

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/send-email/index.ts` | **Novo** — funcao utilitaria com E-goi primario + Resend fallback |
| `supabase/config.toml` | Adicionar `[functions.send-email]` |
| 8 Edge Functions de envio | Substituir chamada directa ao Resend por invocacao de `send-email` |

## Estimativa

- Funcao utilitaria: 1 ficheiro novo
- Refactor das 8 funcoes: substituicao mecanica do bloco de envio
- Total: ~9 ficheiros alterados

Assim que confirmares os 4 pontos acima, avanço com a implementacao.

