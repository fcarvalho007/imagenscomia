
## Alterações: Proteção de pagantes + Template Masterclass para Premium

### Contexto e diagnóstico

**Fluxo automático (cron):** Já está protegido. A query que busca candidatos na linha 463 inclui `.is("paid_at", null)` — quem tem `paid_at` preenchido nunca entra no fluxo de upsell automático. Correto.

**Modo manual (CRM):** Vulnerável. Quando um admin usa o botão "Reenviar email" no modal de um inscrito, o código do `manual_send` apenas verifica `do_not_contact` — não verifica se a pessoa já pagou. Um admin pode enviar inadvertidamente um email de upsell a um cliente que já pagou.

**Estado actual dos pagantes:**
- 12 pagaram no total (9 Premium, 0 Masterclass, 3 Bundle)
- 16 têm plano seleccionado mas ainda não pagaram (candidatos activos ao follow-up)

---

### Alteração 1 — Guard-rail no modo manual: bloquear envio a pagantes

**Ficheiro:** `supabase/functions/followup-abandoned/index.ts`

Após carregar o registo no modo `manual_send` (linha ~384), adicionar verificação:

```ts
// Já existe:
if (reg.do_not_contact) {
  return new Response(JSON.stringify({ error: "do_not_contact is true" }), ...)
}

// ADICIONAR a seguir:
if (reg.paid_at) {
  return new Response(JSON.stringify({ error: "already_paid", paid_at: reg.paid_at }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
```

O campo `paid_at` já é selectado na query do modo manual (`.select("*")`), por isso não requer alteração de schema.

Adicionalmente, na query do modo manual, garantir que o select inclui explicitamente `paid_at` (já está no `select("*")` — sem alteração necessária).

---

### Alteração 2 — Feedback visual no CRM quando tentativa de envio a pagante

**Ficheiro:** `src/components/crm/modal/ActionsSection.tsx`

Quando a API devolve `{ error: "already_paid" }`, mostrar uma mensagem clara em vez de um erro genérico:

```
⚠️  Este inscrito já efectuou o pagamento. Não é possível enviar emails de upsell.
```

Verificar como o componente trata actualmente os erros da chamada `sendBacklogCheckin` / `resendPaymentEmail` e adicionar o caso `already_paid`.

---

### Alteração 3 — Novo template "Masterclass para Premium" na base de dados

Criar um novo template de email com `template_key = "masterclass_upsell_premium"` directamente na tabela `email_templates`.

**Conteúdo proposto:**

- **Subject:** `{{name}}, tens interesse em reservar a Masterclass de Imagem para Vídeo?`
- **Corpo (texto curto e não-agressivo):**

```
Olá {{name}},

Já tens o teu Premium Pass assegurado — óptimo.

Só queria perguntar se tens interesse em reservar também a Masterclass de Imagem para Vídeo com IA, que vai acontecer em Março.

É uma formação prática e intensiva — não é um webinar. Fica a saber mais aqui:
{{masterclass_link}}

Se não tiveres interesse, não há problema — não voltarei a perguntar.

Frederico Carvalho
```

- **Variables:** `["name", "masterclass_link"]`
- **Channel:** `email`
- **is_active:** `true`

O `{{masterclass_link}}` pode ser uma página de informação (landing page da Masterclass ou uma página simples de interesse/reserva). Por agora pode ser um URL estático definido no momento do envio manual.

---

### Alteração 4 — Botão no CRM para enviar o template Masterclass a inscritos Premium pagantes

**Ficheiro:** `src/components/crm/modal/ActionsSection.tsx`

Adicionar uma secção condicional que só aparece quando `inscrito.payment_status === "paid"` e `inscrito.plan === "premium"`:

```
[ Convidar para Masterclass ]
```

Este botão:
1. Chama `sendBacklogCheckin(inscrito.id, "masterclass_upsell_premium")`
2. Tem o seu próprio cooldown visual (verificar `lastEmailMap` para este template)
3. Não é afectado pelo guard-rail `already_paid` porque o template key é diferente do `reminder_manual` — **mas precisamos garantir que o guard-rail só bloqueia templates de upsell de pagamento**, não todos os templates

**Refinamento do guard-rail (ponto 1):** Em vez de bloquear todo o `manual_send` para pagantes, bloquear apenas os templates de upsell de pagamento. A lista de templates bloqueados para pagantes:

```ts
const PAYMENT_UPSELL_TEMPLATES = [
  "followup_stage_0",
  "followup_stage_1",
  "followup_stage_2",
  "followup_backlog_checkin",
  "followup_backlog_weak",
  "followup_final_before_event",
  "reminder_manual",
];

if (reg.paid_at && PAYMENT_UPSELL_TEMPLATES.includes(manualMode.templateKey)) {
  return new Response(JSON.stringify({ error: "already_paid" }), { status: 400, ... });
}
```

Assim o template `masterclass_upsell_premium` pode ser enviado a pagantes de Premium, mas os templates de recuperação de pagamento continuam protegidos.

---

### O que NÃO muda

- O fluxo automático (cron) já está correcto — nenhuma alteração necessária
- Todos os outros templates existentes ficam intactos
- A lógica de cooldown do `reminder_manual` mantém-se

---

### Ficheiros alterados

| Ficheiro | Alteração |
|---|---|
| `supabase/functions/followup-abandoned/index.ts` | Guard-rail: bloquear templates de upsell de pagamento para registos com `paid_at` |
| `src/components/crm/modal/ActionsSection.tsx` | Feedback visual para `already_paid` + botão "Convidar para Masterclass" condicional para Premium pagantes |
| Base de dados (`email_templates`) | Inserir novo template `masterclass_upsell_premium` via SQL directo |

### Sequência de implementação

1. Inserir template na BD (SQL)
2. Actualizar `followup-abandoned` com o guard-rail selectivo
3. Actualizar `ActionsSection.tsx` com feedback + botão Masterclass
4. Fazer deploy da edge function actualizada
