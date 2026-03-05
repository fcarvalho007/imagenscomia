

# Integração SMS dual: E-goi + SMSEasySms no CRM

## Contexto
- **E-goi SMS**: usa a API existente (`EGOI_API_KEY`), remetente = número `915015508`
- **SMSEasySms**: API REST `login.smsonline.pt`, remetente alfanumérico = `IMAGENSIA`, mais barato
- No CRM, o utilizador escolhe qual provider usar ao compor o SMS

## Plano

### 1. Guardar segredo SMSEasySms
- Criar segredo `SMSONLINE_API_KEY` com Base64 de `DigitalFC:BUkn93@%`

### 2. Criar edge function `send-sms`
**Ficheiro:** `supabase/functions/send-sms/index.ts`

- Recebe `{ to, text, registrationId?, provider: "egoi" | "smseasy" }`
- Valida auth via `x-cron-secret` ou `x-crm-admin-email`
- Formata número (garante prefixo `351`)
- **Se provider = `smseasy`:**
  - POST `https://login.smsonline.pt/Api/rest/message`
  - Basic Auth com `SMSONLINE_API_KEY`
  - Body: `{ to: ["351XXXXXXXXX"], text, from: "IMAGENSIA", coding: "gsm-pt" }`
- **Se provider = `egoi`:**
  - POST `https://api.egoiapp.com/campaigns/sms` (ou endpoint transactional SMS da E-goi)
  - Auth com `EGOI_API_KEY`
  - Remetente: `915015508`
- Loga resultado na tabela `message_logs` com `channel: "sms"`, `provider: "egoi"|"smseasy"`
- Config: `[functions.send-sms] verify_jwt = false`

### 3. Botão "Enviar SMS" no modal do CRM
**Ficheiro:** `src/components/crm/modal/SidebarActions.tsx`

- Novo botão com ícone `MessageSquare` no TIER 2, junto ao "Enviar Email"
- Só aparece se `inscrito.whatsapp` estiver preenchido
- Ao clicar, abre um painel inline com:
  - Selector de provider: **E-goi (915015508)** vs **SMSEasy (IMAGENSIA)** — dois botões radio
  - Textarea para mensagem (max 160 chars) com contador de caracteres
  - Botão "Enviar SMS"
- Envia via `supabase.functions.invoke("send-sms", { body: { to, text, provider, registrationId } })`
- Toast de sucesso/erro

### 4. Resumo de ficheiros

| Acção | Ficheiro |
|---|---|
| Novo segredo | `SMSONLINE_API_KEY` |
| Nova edge function | `supabase/functions/send-sms/index.ts` |
| Config | `supabase/config.toml` — adicionar `[functions.send-sms]` |
| UI SMS | `src/components/crm/modal/SidebarActions.tsx` |

