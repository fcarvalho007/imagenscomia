

# AUDITORIA DE EMERGENCIA — Problemas Criticos Encontrados

## PROBLEMA 1: Funcao `send-email` NAO EXISTE no config.toml

A funcao `send-email` foi criada mas **nunca foi adicionada ao `supabase/config.toml`**. Sem esta entrada, a funcao retorna 404 mesmo apos deploy. Confirmei com 3 tentativas de curl — todas 404.

Todas as 8 Edge Functions chamam `send-email` via HTTP interno. Se `send-email` retorna 404, o `res.json()` parseia o erro e `result.success` e `undefined` → registado como falha.

**Correcao**: Adicionar ao config.toml:
```toml
[functions.send-email]
verify_jwt = false
```

## PROBLEMA 2: E-goi Falhou em 100% dos Envios

O reminder_24h disparou hoje as 10:00 UTC. Resultados:
- **57 enviados** (via Resend — fallback)
- **142 falhados** (Resend atingiu `daily_quota_exceeded`)
- **0 via E-goi** — provider e "resend" em todos os 199 registos

A E-goi falhou silenciosamente para todos os emails, forcando o fallback ao Resend que depois atingiu o limite diario. Causas provaveis:
- A EGOI_API_KEY pode nao ter permissoes transacionais
- O dominio `digitalfc.pt` pode nao estar verificado no transactional
- O senderId `2` pode nao existir no contexto transactional

**Correcao**: Apos adicionar config.toml, enviar email de teste e verificar o erro exacto da E-goi nos logs.

## PROBLEMA 3: 142 Emails do Reminder 24h NAO Foram Entregues

142 inscritos NAO receberam o lembrete de 24h. Precisam de ser reenviados apos corrigir o provider.

**Correcao**: Apos corrigir E-goi, executar reenvio manual dos 142 falhados.

## ESTADO ACTUAL DE TODOS OS EMAILS

| Email | Enviados | Falhados | Observacao |
|---|---|---|---|
| confirmation | 220 | 4 | OK |
| followup_prewebinar | 112 | 58 | 58 falhados por rate_limit (antigo) |
| reminder_48h | 202 | 89 | Ja reenviados anteriormente ✅ |
| reminder_24h | 57 | **142** | **CRITICO — nao entregues** |
| reminder_1h | — | — | Amanha 09:00-09:30 UTC — vai falhar sem fix |
| postwebinar | — | — | Amanha 12:30 UTC — vai falhar sem fix |

## PLANO DE ACCAO (por ordem de prioridade)

### 1. Adicionar `send-email` ao config.toml e redeployar
Ficheiro: `supabase/config.toml` — adicionar `[functions.send-email] verify_jwt = false`

### 2. Testar envio E-goi com email de teste
Invocar `send-email` com o teu email para diagnosticar o erro exacto da E-goi.

### 3. Se E-goi falhar: diagnosticar e corrigir
Verificar nos logs o erro exacto (401 auth? 400 bad request? 403 domain?). Corrigir conforme necessario.

### 4. Reenviar os 142 emails falhados do reminder_24h
Criar logica temporaria (remover time-window check) ou funcao one-shot para reenviar.

### 5. Redeployar TODAS as funcoes que amanha disparam
- `send-video-reminder-1h` (amanha ~09:00 UTC)
- `send-video-postwebinar` (amanha ~12:30 UTC)
- `send-video-postwebinar-day1` (amanha ~13:00 UTC)

### 6. Tambem reenviar os 58 followup_prewebinar falhados
Estes falharam por rate_limit na versao antiga e nunca foram reenviados.

## FICHEIROS A ALTERAR

| Ficheiro | Alteracao |
|---|---|
| `supabase/config.toml` | Adicionar `[functions.send-email] verify_jwt = false` |
| `supabase/functions/send-video-reminder-24h/index.ts` | Remover time-window temporariamente para reenvio |
| Deploy | Redeployar `send-email` + todas as funcoes de amanha |

