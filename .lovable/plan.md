

# Enviar email de recursos individualmente a partir da ficha de cliente

## O que fazer

### 1. Criar edge function `send-video-recursos-single`
Nova edge function que aceita `{ registration_id }` (ou `{ email }`) e envia o email de recursos apropriado ao plano do inscrito. Reutiliza os mesmos templates HTML da `send-video-recursos-access` (premium, masterclass, bundle). Faz:
- Lookup do registo por `registration_id` na tabela `registrations`
- Verifica que `paid_at` não é null (ou `premium_granted_at`)
- Determina o template correcto com base em `plan_selected`
- Envia via `send-email` centralizado
- Regista em `message_logs` e `email_send_logs`
- Verificação de admin via header `x-crm-admin-email`

### 2. Adicionar botão "Enviar email de recursos" no `SidebarActions.tsx`
Visível apenas para inscritos pagos (`paid_at` ou `premium_granted_at`) com plano premium/masterclass/bundle. Ao clicar:
- Confirmação: "Enviar email de acesso aos recursos para {nome}?"
- Chama `supabase.functions.invoke("send-video-recursos-single", { body: { registration_id } })`
- Feedback visual (loading → sucesso/erro)

### 3. Enviar agora para susana.vieira@farmaciasreisbarata.pt
Após deploy, invocar a função manualmente para este email específico.

## Ficheiros alterados
- `supabase/functions/send-video-recursos-single/index.ts` (novo)
- `src/components/crm/modal/SidebarActions.tsx` (adicionar botão)

