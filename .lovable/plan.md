
## Diagnóstico — O Que Já Existe vs O Que Falta

A implementação anterior criou a estrutura base (modal, botões, edge function, hook), mas há **5 problemas críticos** a corrigir e **2 melhorias** de UX a fazer.

---

### Problema 1 — Segurança: sem validação de X-CRM-Secret (CRÍTICO)

A edge function `send-payment-link` está completamente aberta — qualquer pessoa pode chamar `/functions/v1/send-payment-link` sem autenticação e gerar links de pagamento e enviar emails.

**Correcção:** Adicionar validação de `X-CRM-Secret` no início da função, igual ao padrão do `followup-abandoned`. No frontend, passar o header nas chamadas.

---

### Problema 2 — URL instável no email e modal (CRÍTICO)

O email enviado ao cliente contém o link directo EuPago (ex: `https://clientes.eupago.pt/api/...`). O spec exige que o email contenha SEMPRE `https://imagenscomia.com/pagar?o={order_id}`. O `resolve-payment` já faz a resolução estável — basta mudar o que se envia.

O modal de sucesso também mostra o URL EuPago raw. Deve mostrar o URL estável.

**Correcção:**
- Na edge function: construir `paymentPageUrl = "${origin}/pagar?o=${orderId}"` e usar este URL no email e na resposta (mantendo o `last_payment_link` com o URL EuPago para uso interno pelo `resolve-payment`).
- No `SendPaymentModal`: mostrar o `paymentPageUrl` em vez do `paymentLink` raw.
- A resposta da função passa a retornar `{ paymentPageUrl, emailSent, email }` em vez de `{ paymentLink, emailSent, email }`.

---

### Problema 3 — Guard-rail "já pago" ausente (CRÍTICO)

A edge function não verifica `paid_at` antes de agir. Se chamada para um inscrito já pago, gera um link e envia email desnecessariamente.

**Correcção:** Após buscar a `registration`, verificar `if (reg.paid_at) return { status: "already_paid" }` sem fazer mais nada.

---

### Problema 4 — Cooldown não verificado no frontend (UX)

O `SendPaymentModal` não verifica o cooldown de 6h antes de permitir enviar. O utilizador pode carregar "Gerar e enviar" repetidamente.

**Correcção:** O `SendPaymentModal` recebe `messageLogs` como prop e verifica se existe um log `manual_payment_link_sent` nas últimas 6h. Se sim, desactiva o botão e mostra "Enviado há Xh".

Na `InscritoModal`, os `messageLogs` já são carregados — passá-los ao modal.

---

### Problema 5 — Botão "Enviar dados de pagamento" só no painel esquerdo

O botão existe no painel esquerdo escuro da ficha (`InscritoModal`). A `ActionsSection` (painel direito branco) é onde os outros botões de acção de pagamento vivem. O spec pede que o botão esteja também na `ActionsSection`, com cooldown visual.

**Correcção:** Adicionar botão "Enviar dados de pagamento" à `ActionsSection`, com cooldown calculado a partir de `messageLogs.find(l => l.template_key === "manual_payment_link_sent")`. Passa `onOpenSendPayment` como prop ao `ActionsSection`.

---

### Plano de Implementação

#### Ficheiros a editar

| Ficheiro | O que muda |
|---|---|
| `supabase/functions/send-payment-link/index.ts` | 1. Validar `X-CRM-Secret`; 2. Guard-rail `paid_at`; 3. Usar URL estável no email e na resposta |
| `src/components/crm/modal/SendPaymentModal.tsx` | 1. Receber `messageLogs` e verificar cooldown 6h; 2. Mostrar URL estável no sucesso; 3. Passar header `X-CRM-Secret` na chamada |
| `src/components/crm/modal/ActionsSection.tsx` | Adicionar botão "Enviar dados de pagamento" com cooldown visual (prop `onOpenSendPayment`) |
| `src/components/crm/InscritoModal.tsx` | Passar `messageLogs` ao `SendPaymentModal`; passar `onOpenSendPayment` à `ActionsSection` |

#### Nada muda em:
- `useInscritos.ts` — `updateStepReached` já existe e funciona
- `TableView.tsx` — dropdown e ícone já implementados
- `PipelineView.tsx` — colunas por plano mantêm-se (coluna por `step_reached` não é prioridade)
- `CRM.tsx` — já passa `onUpdateStepReached` e `updateStepReached` correctamente
- `supabase/config.toml` — `send-payment-link` já registado com `verify_jwt = false`

---

### Detalhe técnico: edge function corrigida

```
Input:  { registrationId, plan, priceVariant }
Header: X-CRM-Secret: <CRM_ADMIN_SECRET>

Fluxo:
1. Validar X-CRM-Secret → 401 se inválido
2. Buscar registration por id
3. Se paid_at → return { status: "already_paid" }
4. Calcular valor (tabela fixa de preços com IVA)
5. Criar link EuPago → guardar last_payment_link + eupago_ref + plan_selected
6. Construir paymentPageUrl = "https://imagenscomia.com/pagar?o={order_id}"
7. Enviar email via Resend com link = paymentPageUrl (não o URL EuPago directo)
8. Inserir + actualizar message_logs (template_key="manual_payment_link_sent")
9. Return { paymentPageUrl, emailSent, email }
```

O `last_payment_link` na base de dados continua a ser o URL EuPago directo (usado pelo `resolve-payment` para validar e redirigir). O `paymentPageUrl` é o que se expõe ao cliente.

---

### Detalhe: cooldown no modal

```
const lastSentLog = messageLogs.find(l => l.template_key === "manual_payment_link_sent");
const msSince = lastSentLog ? Date.now() - new Date(lastSentLog.created_at).getTime() : Infinity;
const isCooling = msSince < 6 * 60 * 60 * 1000;
```

Se `isCooling`, o botão "Gerar e enviar" fica desactivado e mostra "Enviado há Xh · Cooldown activo".
