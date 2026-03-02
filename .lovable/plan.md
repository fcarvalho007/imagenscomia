

# Correcao URGENTE: {{fname}} literal no assunto dos emails

## Problema

Todas as Edge Functions que leem o assunto da tabela `email_templates` nao fazem `.replace()` de `{{fname}}` no subject — apenas no corpo HTML. Resultado: 152 emails de confirmacao foram enviados com o assunto literal "Ate 5 de Marco, {{fname}}".

## Impacto

| Funcao | Emails ja enviados com bug | Proximo disparo |
|---|---|---|
| send-video-confirmation | **152 enviados** | A cada nova inscricao |
| send-video-reminder-48h | 0 | 3 Mar 10:00 UTC |
| send-video-reminder-24h | 0 | 4 Mar 10:00 UTC |
| send-video-reminder-1h | 0 | 5 Mar 09:00 UTC |
| send-video-postwebinar | 0 | 5 Mar 12:30 UTC |

O `send-video-followup-prewebinar` ja tem o fix (linha 138) — nao e afectado.

Os templates `video_postwebinar_day1`, `video_postwebinar_day3` e `video_postwebinar_closing` precisam tambem de ser verificados.

## Correcao

Adicionar `.replace(/\{\{fname\}\}/g, fname)` na linha do `emailSubject` em **todas** as funcoes afectadas:

### 1. `send-video-confirmation/index.ts` (linha 141)

```text
// ANTES:
const emailSubject = tpl?.subject ?? "Inscricao confirmada ...";

// DEPOIS:
const emailSubject = (tpl?.subject ?? "Inscricao confirmada ...").replace(/\{\{fname\}\}/g, fname || "");
```

### 2. `send-video-reminder-48h/index.ts` (linha 132)

```text
// ANTES:
const emailSubject = tpl?.subject ?? "Faltam 2 dias ...";

// DEPOIS:
const emailSubject = (tpl?.subject ?? "Faltam 2 dias ...").replace(/\{\{fname\}\}/g, reg.first_name || "");
```

### 3. `send-video-reminder-24h/index.ts` (linha 114)

```text
// ANTES:
const emailSubject = tpl?.subject ?? "E amanha as 10h00 ...";

// DEPOIS:
const emailSubject = (tpl?.subject ?? "E amanha as 10h00 ...").replace(/\{\{fname\}\}/g, reg.first_name || "");
```

### 4. `send-video-reminder-1h/index.ts` (linha 120)

```text
// ANTES:
const emailSubject = tpl?.subject ?? "Comeca em 1 hora ...";

// DEPOIS:
const emailSubject = (tpl?.subject ?? "Comeca em 1 hora ...").replace(/\{\{fname\}\}/g, reg.first_name || "");
```

### 5. `send-video-postwebinar/index.ts` (linha 175)

```text
// ANTES:
const emailSubject = tpl?.subject ?? "Obrigado por estares presente ...";

// DEPOIS:
const emailSubject = (tpl?.subject ?? "Obrigado por estares presente ...").replace(/\{\{fname\}\}/g, reg.first_name || "");
```

### 6-8. Verificar e corrigir tambem as funcoes:
- `send-video-postwebinar-day1`
- `send-video-postwebinar-day3`
- `send-video-postwebinar-closing`

## Deploy

Redeployar todas as funcoes corrigidas de uma so vez.

## Sobre os 152 emails ja enviados

Infelizmente os 152 emails de confirmacao ja enviados nao podem ser recolhidos. O corpo do email esta correcto (nome personalizado) — apenas o assunto ficou com `{{fname}}` literal. Nao ha forma de corrigir emails ja entregues.
