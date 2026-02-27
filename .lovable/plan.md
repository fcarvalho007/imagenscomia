

# Confirmação de compra diferenciada para Video Webinar

## 1. Inserir 2 templates na BD (email_templates)

Usar o insert tool para criar:

- `video_payment_premium`: subject "Tudo confirmado -- aqui esta o teu acesso", HTML com CTA calendario Q&A (https://calendar.app.google/Mczyo7DFx7xazgXD6), botao azul #1e40af
- `video_payment_masterclass`: subject "Lugar garantido na Masterclass", HTML com CTA calendario Masterclass (https://calendar.app.google/LWQVacdqqavvEqSG9), botao roxo #7c3aed

Ambos com `{{fname}}` placeholder, tom quente, assinatura Frederico Carvalho, link WhatsApp suporte.

## 2. Alterar eupago-webhook (linhas 373-449)

Substituir o bloco "Email ao cliente: payment_confirmed_customer" por logica condicional:

```text
1. Buscar regCust com campos: email, name, first_name, plan_selected, eupago_ref, webinar
2. Se webinar === 'video':
   - Normalizar plan (remover prefixo "video-")
   - Se plan inclui 'premium' ou 'gravacao':
     -> Idempotency check em message_logs para template_key='video_payment_premium'
     -> Enviar email premium (subject com fname, HTML com calendario Q&A)
     -> Log em message_logs + email_send_logs
   - Se plan inclui 'masterclass':
     -> Idempotency check para 'video_payment_masterclass'
     -> Enviar email masterclass
     -> Log em message_logs + email_send_logs
   - Se plan inclui 'bundle':
     -> Enviar AMBOS sequencialmente (cada um com sua idempotency)
3. Senao (imagens):
   -> Manter logica existente payment_confirmed_customer intacta
```

O fname e extraido de `first_name || name.split(" ")[0]`.

Cada envio faz dual logging:
- `message_logs` (para o CRM modal/historico)
- `email_send_logs` (para stats no fluxo de automacoes)

## 3. templateLabels.ts

Adicionar 2 entradas:
```text
video_payment_premium: "Confirmacao de compra -- Premium Pass"
video_payment_masterclass: "Confirmacao de compra -- Masterclass"
```

## 4. AutomationFlowTab.tsx -- novo node condicional

Na funcao `getNodes()`, para `webinar === "video"`, inserir um novo node **apos "Confirmacao imediata" (index 1) e antes do "Follow-up upgrade pre-webinar" (index 2)**:

```text
{
  type: "email",
  title: "Confirmacao de compra",
  subtitle: "Enviado apos pagamento confirmado",
  templateKeyMatch: ["video_payment_premium", "video_payment_masterclass"],
  conditionLabel: "APOS PAGAMENTO",
  sendOffsetHours: null,
}
```

Border color: verde #16a34a (pagamento confirmado). Logica: adicionar verificacao para estes template keys no calculo de `borderColor`, forcando verde.

## Ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| BD: email_templates | 2 INSERTs (premium + masterclass) |
| `supabase/functions/eupago-webhook/index.ts` | Linhas 373-449: logica condicional video vs imagens |
| `src/components/crm/templateLabels.ts` | +2 labels |
| `src/components/crm/AutomationFlowTab.tsx` | +1 node condicional (video only) |

## O que NAO muda

- `video_confirmation` (variantes A/B/C/D -- intocavel)
- Todas as outras edge functions
- Logica de pagamento/reconciliacao no webhook (strategies 1-3)
- Invoice notification email
- E-goi tag logic
- Fluxo imagens (payment_confirmed_customer mantido para webinar != video)

