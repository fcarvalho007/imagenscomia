

# Corrigir inconsistencias nas tabs Metricas e Pessoas das Automacoes

## Problemas identificados

Apos analise do codigo e dos dados reais, encontrei **5 problemas** que causam numeros incorrectos:

### 1. Pipeline inclui planos "video-free" (CRITICO)

O pipeline em `FollowUpOverview` e `FollowUpPessoas` filtra por `plan_selected !== "free"`, mas os planos do webinar video usam o prefixo `video-` (ex: `video-free`, `video-premium`). Isto significa que **29 inscritos video-free + 9 inscritos video-free no webinar imagens** estao a ser contados como pipeline pendente quando sao apenas inscritos gratuitos.

**Dados reais:** Existem 38 registos com `plan_selected = "video-free"` que estao a inflar o funil.

**Correccao:** Alterar o filtro para excluir tanto `"free"` como `"video-free"`:
```
plan_selected !== "free" && plan_selected !== "video-free" && !paid_at
```

### 2. Data do evento hardcoded para 18 Fev (CRITICO)

`FollowUpOverview` tem `EVENT_DATE = new Date("2026-02-18T10:00:00Z")` hardcoded. No contexto "video", o countdown deveria mostrar a data do webinar de video (2 Mar ou 5 Mar). Actualmente mostra "Evento em curso!" e "ate ao evento (18 Fev 10:00)" independentemente do contexto.

**Correccao:** Receber o webinar context como prop e usar a data correspondente de `WEBINAR_CONFIG`.

### 3. Logs (message_logs) nao filtrados por webinar

As metricas de email (Resend 7d, Falhas, Historico legado) e a Cobertura Resend usam `logs` da tabela `message_logs` sem filtro de webinar. No contexto "video", os 51 emails Resend mostrados incluem emails do webinar de imagens (followup_stage_0, etc.).

**Dados reais:** A tabela `message_logs` tem 132 registos, todos relativos ao webinar de imagens. O webinar video so tem 28 envios na tabela `email_send_logs`.

**Correccao:** Filtrar os logs pelo `registration_id` dos inscritos do webinar activo, ou cruzar com a tabela de registrations. Como os `inscritos` ja vem filtrados por webinar, podemos criar um Set de IDs e filtrar os logs por `registration_id`.

### 4. PLAN_VALUES incompleto na tab Pessoas

`FollowUpPessoas` tem `PLAN_VALUES` com apenas `premium: "15EUR"`, `masterclass: "47EUR"`, `bundle: "57EUR"`. Faltam os equivalentes video (`video-premium`, `video-bundle`).

**Correccao:** Adicionar as entradas para planos video.

### 5. Template labels incompleto no FollowUpAudit (Envios)

`FollowUpAudit` tem `TEMPLATE_LABELS` sem os templates do webinar video (`video_confirmation`, etc.). Estes aparecem como chaves tecnicas em vez de nomes legiveis.

**Correccao:** Adicionar labels para templates video.

## Plano tecnico

| Ficheiro | Alteracao |
|---|---|
| `FollowUpOverview.tsx` | 1. Receber `webinarContext` como prop; 2. Usar data do evento correcta; 3. Filtrar logs por registration IDs dos inscritos; 4. Excluir `video-free` do pipeline |
| `FollowUpPessoas.tsx` | 1. Excluir `video-free` do pipeline; 2. Adicionar PLAN_VALUES para planos video |
| `FollowUpAudit.tsx` | 1. Filtrar logs por registration IDs; 2. Adicionar TEMPLATE_LABELS para templates video |
| `FollowUpView.tsx` | Passar `webinarContext` como prop ao FollowUpOverview |

### Logica de filtragem de logs

Para alinhar logs com o contexto de webinar sem alterar a query SQL:
```text
inscritoIds = Set(inscritos.map(i => i.id))
filteredLogs = logs.filter(l => inscritoIds.has(l.registration_id))
```

Como `inscritos` ja vem filtrado por webinar a partir do `CRM.tsx`, isto garante que os logs mostrados correspondem apenas ao webinar activo.

