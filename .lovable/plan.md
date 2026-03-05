

# Análise: Email pós-webinar — o que aconteceu

## Situação actual (dados reais da base de dados)

| Métrica | Valor |
|---------|-------|
| Emails já enviados | **162** |
| Inscritos gratuitos restantes (não receberam) | **91** |
| Total de inscritos gratuitos | 253 |
| Inscritos com `attended_live_at` | 161 |

## O que aconteceu

O botão **"Enviar agora"** no CRM é manual — alguém o clicou, e a função executou. Não há cron associado a esta função, portanto **não foi automático**. A discrepância entre os 79 que o ecrã mostrava e os 162 reais deve-se ao timing: a função processa com 600ms entre cada envio, e os contadores do CRM actualizam-se ao recarregar a página. Provavelmente o ecrã foi capturado a meio da execução.

## Problema real: falta de filtro `attended_live_at`

A UI diz "Só para quem assistiu ao vivo (attended_live_at)", mas **a Edge Function não aplica esse filtro**. No código (`send-video-postwebinar/index.ts`, linha 128-133), a query apenas filtra por:
- `webinar = 'video'`
- `paid_at IS NULL`
- `do_not_contact = false`

**Não filtra por `attended_live_at IS NOT NULL`**. Resultado: enviou para todos os 162 inscritos gratuitos processados, incluindo quem **não assistiu ao vivo**.

## O que pode ser feito

### Opção A — Não corrigir (aceitar o envio)
Os 162 emails já foram entregues. O conteúdo é relevante (upsell gravação + masterclass), aplica-se a qualquer inscrito. Os 91 restantes não receberiam nada.

### Opção B — Corrigir a função e reenviar só para quem assistiu
Adicionar `.not("attended_live_at", "is", null)` à query. Dos 91 restantes, apenas os que têm `attended_live_at` receberiam.

### Opção C — Enviar aos 91 restantes sem restrição
Manter a lógica actual e reexecutar para os 91 que faltam (a função já tem deduplicação — não reenvia a quem já recebeu).

## Ficheiro a alterar (se quiser corrigir)

**`supabase/functions/send-video-postwebinar/index.ts`** — adicionar filtro `attended_live_at` na query (linha 133):
```typescript
.not("attended_live_at", "is", null)
```

## Resumo
- Ninguém recebeu email duplicado (a função deduplica)
- 162 já receberam, 91 ainda podem ser contactados
- O envio foi manual (botão), não automático
- O filtro de "assistiu ao vivo" nunca estava implementado na função, apenas mencionado na UI

