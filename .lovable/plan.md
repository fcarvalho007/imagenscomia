

# Adicionar nodes SMS ao fluxo de Automações

## O que vamos fazer

Adicionar 3 novos nodes SMS na timeline de automações do webinar Vídeo, com botão "Enviar agora" para envio manual:

1. **SMS pós-webinar** — "O webinar já decorreu, já podes aceder ao workbook" (envio manual, todos os inscritos free)
2. **SMS lembrete Q&A** — 30min antes da Q&A de 10 Março 14:30, para quem comprou Premium (ambos webinars)
3. **SMS lembrete Masterclass** — 30min antes da Masterclass de 12 Março 10:00, para quem comprou Masterclass/Bundle (ambos webinars)

## Ficheiros a editar

### `src/components/crm/AutomationFlowTab.tsx`

**1. Expandir o tipo NodeDef** — adicionar campo opcional `channel: "email" | "sms"` (default "email") e `smsSendConfig` com os dados necessários para o envio (filtro de plano, texto pré-definido).

**2. Adicionar 3 nodes SMS no array `getNodes("video")`:**

Após a secção "APÓS O WEBINAR":
```
📱 SMS pós-webinar
   "Envio manual · todos os inscritos gratuitos"
   Tag: MANUAL
   Botão: "Enviar SMS agora →"
```

Na secção "FECHO DE LEADS" (antes do email de fecho):
```
📱 SMS lembrete Q&A — 10 Mar
   "30 min antes · Premium Pass (imagens + vídeo)"
   Tag: 10 MAR · 14H00

📱 SMS lembrete Masterclass — 12 Mar
   "30 min antes · Masterclass + Bundle (imagens + vídeo)"  
   Tag: 12 MAR · 09H30
```

**3. Criar função `handleBulkSms`** que:
- Recebe filtro de plano e texto SMS
- Busca inscritos elegíveis (ambos webinars se aplicável)
- Mostra confirm() com contagem
- Itera e invoca `send-sms` para cada destinatário via E-goi
- Mostra resultado (X enviados, Y falhas) em toast ou modal

**4. Adaptar `renderNodeCard`** para nodes SMS:
- Ícone 📱 em vez de ✉️
- Cor roxa/azul diferenciada
- Botão "Enviar SMS agora →" (verde) quando `channel === "sms"`

### `supabase/functions/send-sms/index.ts`
- Sem alterações — já suporta envio individual via E-goi

## Textos SMS pré-definidos

**Pós-webinar:**
> "O webinar Video com IA ja decorreu! Acede ao workbook e materiais em imagenscomia.com/recursos — Frederico Carvalho"

**Lembrete Q&A (10 Mar):**
> "Lembrete: a sessao Q&A comeca as 14:30. O link de acesso foi enviado por email. Ate ja! — Frederico"

**Lembrete Masterclass (12 Mar):**
> "Lembrete: a Masterclass comeca as 10:00. O link de acesso foi enviado por email. Ate ja! — Frederico"

## Resumo
- 1 ficheiro editado (`AutomationFlowTab.tsx`)
- 3 nodes SMS adicionados à timeline
- Envio em lote via botão manual com confirmação
- Usa E-goi como provider (SMSEasy com credenciais pendentes)

