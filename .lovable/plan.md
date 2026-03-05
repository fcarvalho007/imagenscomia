
# Integração SMS via SMSEasySms no CRM

## Contexto
O provider é **SMSEasySms** (smsonline.pt), com API REST simples:
- **Endpoint:** `POST https://login.smsonline.pt/Api/rest/message`
- **Auth:** HTTP Basic (`DigitalFC:BUkn93@%` → Base64)
- **Body:** `{"to":["351XXXXXXXXX"], "text":"...", "from":"DigitalFC", "coding":"gsm-pt"}`

## Plano de implementação

### 1. Guardar credenciais como segredo
- Criar segredo `SMSONLINE_API_KEY` com o valor `DigitalFC:BUkn93@%` (username:password) codificado em Base64

### 2. Criar edge function `send-sms`
**Ficheiro:** `supabase/functions/send-sms/index.ts`

- Recebe `{ to: string, text: string, registrationId?: string }`
- Valida `x-cron-secret` ou admin auth
- Formata o número (garante prefixo `351`)
- Faz POST para `https://login.smsonline.pt/Api/rest/message` com Basic Auth
- Usa `coding: "gsm-pt"` para suporte a caracteres portugueses (ç, ã, etc.)
- Loga o resultado na tabela `message_logs` (channel: `sms`)
- Retorna sucesso/erro

### 3. Adicionar botão "Enviar SMS" no modal do CRM
**Ficheiro:** `src/components/crm/modal/SidebarActions.tsx`

- Novo botão junto ao "Enviar Email" com ícone `MessageSquare`
- Abre um mini-diálogo inline para escrever a mensagem (campo textarea, max 160 chars, contador)
- Envia via `supabase.functions.invoke("send-sms", { body: { to, text, registrationId } })`
- Mostra toast de sucesso/erro
- Só aparece se o inscrito tiver `whatsapp` preenchido (campo usado para número de telemóvel)

### 4. Registar config no `supabase/config.toml`
- Adicionar `[functions.send-sms]` com `verify_jwt = false`

## Resumo de ficheiros

| Acção | Ficheiro |
|---|---|
| Novo segredo | `SMSONLINE_API_KEY` (Base64 de `DigitalFC:BUkn93@%`) |
| Nova edge function | `supabase/functions/send-sms/index.ts` |
| Botão SMS no modal | `src/components/crm/modal/SidebarActions.tsx` |
| Config | `supabase/config.toml` |
