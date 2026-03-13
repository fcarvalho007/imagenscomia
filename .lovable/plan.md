

# Enviar email `video_masterclass_day1` + Adicionar botões de envio manual a todos os nós de email

## Parte 1 — Enviar o email agora

Invocar a edge function `send-video-masterclass-day1` directamente do CRM para disparar o envio em massa. A função já:
- Filtra compradores de masterclass/bundle de ambos os webinars
- Deduplica por email
- Verifica `email_send_logs` para não reenviar
- Regista em `message_logs` e `email_send_logs`

Basta invocar a função via `supabase.functions.invoke("send-video-masterclass-day1")` com o header `x-crm-admin-email`.

## Parte 2 — Botões de envio manual em todos os nós de email

### Problema actual
Apenas os nós SMS têm botão "Enviar SMS agora →". Os nós de email só têm "Ver email →". Para disparar emails manualmente, é preciso ir à tab de Comunicação.

### Solução

1. **Adicionar campo `edgeFunctionName` ao `NodeDef`** — mapeia o nó à edge function correspondente (ex: `"send-video-masterclass-day1"`, `"send-video-postwebinar-day1"`, etc.)

2. **Adicionar botão "Enviar email agora →"** no lado direito de cada nó de email que tenha `edgeFunctionName` definido, ao lado do "Ver email →", com:
   - Confirmação antes do envio
   - Estado de loading
   - Toast com resultado (enviados/erros/skipped)
   - Estilo igual ao botão SMS (verde, `#16a34a`)

3. **Mapear as edge functions existentes** aos nós relevantes:

| Node `templateKeyMatch` | `edgeFunctionName` |
|---|---|
| `video_masterclass_day1` | `send-video-masterclass-day1` |
| `video_masterclass_day3` | `send-video-masterclass-day3` |
| `video_masterclass_thankyou` | `send-video-masterclass-thankyou` |
| `video_masterclass_reminder` | `send-video-masterclass-reminder` |
| `video_postwebinar_day1` | `send-video-postwebinar-day1` |
| `video_postwebinar_day3` | `send-video-postwebinar-day3` |
| `video_postwebinar_closing` | `send-video-postwebinar-closing` |
| `video_postwebinar` | `send-video-postwebinar` |
| `video_recursos_premium` / `video_recursos_masterclass` / `video_recursos_bundle` | `send-video-recursos-access` |
| `video_qa_reminder` | `send-video-qa-reminder` |
| Outros nós sem edge function | Sem botão (apenas "Ver email →") |

### Ficheiros alterados

| Ficheiro | Alteração |
|---|---|
| `src/components/crm/AutomationFlowTab.tsx` | Adicionar `edgeFunctionName?: string` ao `NodeDef`; adicionar campo a cada nó relevante; criar `handleBulkEmail` similar a `handleBulkSms`; renderizar botão "Enviar email agora →" quando `edgeFunctionName` existe |

### Lógica do `handleBulkEmail`

```text
1. Obter adminEmail da sessão
2. Confirmar com confirm()
3. Invocar edge function
4. Mostrar toast com resultado
5. (A edge function já faz dedup + logging)
```

