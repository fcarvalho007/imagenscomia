
# Investigação SMS Recursos — Resultados e Plano de Correcção

## Factos apurados

### a) As SMS foram enviadas?

**Sim, 23 SMS foram enviadas** (+ 3 testes para o 915015508). Estão confirmadas na E-goi com status "delivered". No entanto, **não existem registos na tabela `message_logs`** — zero entradas com `channel = 'sms'`. Isto significa que a edge function `send-sms` falhou silenciosamente no logging, ou o envio foi feito por outro canal (directamente via E-goi bulk, não via CRM).

### b) Foram enviadas só a pagos ou a todos?

**Foram enviadas a TODOS que seleccionaram premium/masterclass/bundle, incluindo quem NÃO pagou.**

Cruzamento dos 23 números do CSV da E-goi com a base de dados:

| Status | Qtd | Exemplos |
|--------|-----|----------|
| **PAID/GRANTED** | 14 | Ana Teresa, Marisa, Romeo, Pedro, Jessica, Soraia, etc. |
| **FREE (não pagou)** | 9 | Mafalda, Elisa, Mário, Amanda, Catarina, Frederico (910679744), etc. |

**Causa**: O `handleBulkSms()` (linha 963-968) filtra apenas por `planFilter` e `whatsapp`, mas **não verifica `paid_at`**. O `computeEligible()` para SMS nodes (linha 96-103) também ignora o estado de pagamento. Qualquer pessoa que tenha seleccionado "premium" ou "masterclass" no formulário (mesmo sem pagar) recebeu a SMS.

## Plano de correcção

### 1. Corrigir filtro SMS — respeitar `requirePaid` (AutomationFlowTab.tsx)

Adicionar verificação de `paid_at` e `premium_granted_at` em dois locais:

- **`computeEligible()`** (linha 96-103): adicionar check de `requirePaid` do `smsSendConfig`
- **`handleBulkSms()`** (linha 963-968): adicionar o mesmo check

Isto garante que o node "SMS Recursos — Premium Pass" com `planFilter: ["premium", "masterclass", "bundle"]` só envia a quem efectivamente pagou.

Adicionalmente, actualizar o `SmsSendConfig` interface para incluir `requirePaid?: boolean` e marcar os SMS nodes de recursos pagos com `requirePaid: true`.

### 2. Backfill dos 23 SMS na `message_logs`

Inserir os 23 registos de SMS na tabela `message_logs` via migration, cruzando os números de telefone da E-goi com os `registration_id` correspondentes. Template key: `sms_recursos_post`. Isto garante que as estatísticas do CRM reflectem a realidade.

### 3. Actualizar SMS nodes pagos com `requirePaid: true`

Nos nodes de SMS em `getPostEventNodes()` e `getNodes("video")` que são para clientes pagos, adicionar `requirePaid: true` ao `smsSendConfig`.

### Ficheiros alterados
- `src/components/crm/AutomationFlowTab.tsx` — fix filtro + interface + nodes
- Migration SQL — backfill message_logs com os 23 SMS enviados
