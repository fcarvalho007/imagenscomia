

## Auditoria: Rastreio de Pagamentos, Links Expirados e Proposta de Melhoria

---

### 1. Como e criado o pagamento EuPago

**Endpoint usado:** `https://clientes.eupago.pt/api/v1.02/paybylink/create` (Pay-by-Link API v1.02)

**Campos enviados ao EuPago:**

| Campo EuPago | Valor actual | Exemplo |
|---|---|---|
| `amount.value` | Preco c/ IVA (18.45, 57.81, 76.26, 512.00) | `18.45` |
| `identifier` | `{PRODUTO}-{email}-{timestamp}` | `WEBINAR-PREMIUM-joao@mail.pt-1739800000000` |
| `successUrl` | `{origin}/upgrade/sucesso?rid={uuid}&t={edit_token}` | URL com dados sensiveis expostos |
| `failUrl` | `{origin}/?payment=failed` | |
| `backUrl` | `{origin}/upgrade` | |
| `callbackUrl` | `{supabaseUrl}/functions/v1/eupago-webhook` | Webhook automatico |
| `methods` | `["CC", "MBWAY", "MB"]` | Cartao, MBWay, Multibanco |

**Resposta do EuPago guardada:**
- `transactionID` -> coluna `registrations.eupago_ref`
- `url` (link de pagamento) -> coluna `registrations.last_payment_link`
- `reference` -> devolvido ao frontend mas NAO persistido separadamente

**Problemas identificados:**
- O campo `identifier` contem o email do utilizador em texto claro -- isto e visivel na interface EuPago e potencialmente nos logs
- Nao existe um `order_id` proprio -- a ligacao entre EuPago e a BD depende de parsing do `identifier` ou match por `transactionID`
- O `reference` (referencia Multibanco) nao e guardado de forma independente -- apenas o `transactionID`

---

### 2. Webhook EuPago -- implementacao actual

**Sim, existe webhook implementado** em `supabase/functions/eupago-webhook/index.ts`, com `verify_jwt = false`.

**Payload que chega:**

O webhook suporta dois formatos:

- **GET (callback classico):** `?referencia=X&valor=Y&identificador=Z&canal=CC&transacao=T`
- **POST (v2.0):** `{ transactionStatus, reference, amount, identifier, paymentMethod, transactionID }`

**Estrategia de match (2 niveis):**

1. **Por `transactionID`:** faz `.eq("eupago_ref", transactionID)` na tabela `registrations` -- funciona porque `create-payment` guarda o `transactionID` como `eupago_ref`
2. **Fallback por email:** extrai email do campo `identifier` via split por `-` (fragil: emails com `-` podem partir o parsing)

**Apos match:**
- Define `paid_at`
- Envia email de fatura (para o admin)
- Envia email de confirmacao (para o cliente)
- Tudo idempotente via `payment_events.idempotency_key`

**Vulnerabilidade:** O parsing do email do `identifier` (Strategy 2) usa `parts.slice(2, -1).join("-")` -- funciona para `WEBINAR-PREMIUM-joao@mail.pt-1739800000000`, mas se o email contiver `-` E o timestamp tambem, pode falhar.

---

### 3. Ligacao `payment_url` ao utilizador

**Fluxo actual:**

```text
create-payment:
  1. Recebe { plan, email, nome }
  2. Busca registration por email (.eq("email", email))
  3. Cria link na EuPago
  4. Guarda transactionID + link na registration (.eq("email", email))

followup-abandoned:
  1. Busca registrations sem paid_at
  2. Usa last_payment_link da registration
  3. Se link > 12h ou invalido, gera novo via refreshPaymentLink()
  4. Inclui link directamente no HTML do email ({{payment_link}})
```

**Problema critico:** Os emails de follow-up incluem o URL directo do EuPago (ex: `https://eupago.pt/pay/abc123`). Se o link expirar (EuPago expira links apos ~48h), o utilizador clica num link morto. O sistema valida antes de enviar (HEAD/GET), mas emails ja enviados ficam com links que podem expirar depois.

---

### 4. Proposta: order_id + pagina estavel `/pagar?o=...`

**Conceito:** Em vez de enviar o URL directo do EuPago nos emails, enviar um URL proprio que resolve o link actualizado em tempo real.

**Arquitectura proposta:**

```text
Email -> https://imagenscomia.lovable.app/pagar?o={order_id}
                    |
                    v
          Frontend carrega /pagar
                    |
                    v
          Busca registration por order_id (coluna nova)
                    |
          +---------+---------+
          | paid_at exists?   |
          +---+-------+------+
              |       |
           Sim|    Nao|
              v       v
         "Ja pago"  Valida last_payment_link
                       |
                  +----+----+
                  |Link OK? |
                  +--+---+--+
                  Sim|   |Nao
                     v   v
              Redirect  Gera novo link via
              para      create-payment e redirect
              EuPago
```

**Alteracoes necessarias:**

**a) Nova coluna na BD:**

```text
ALTER TABLE registrations ADD COLUMN order_id text UNIQUE;
```

Gerar automaticamente no `register-free` ou no `create-payment` (ex: `nanoid(12)` ou `crypto.randomUUID().slice(0,12)`).

**b) Nova pagina `/pagar` (frontend):**

- Recebe `?o={order_id}` da URL
- Busca registration pela coluna `order_id`
- Se `paid_at` existe: mostra "Pagamento ja confirmado" com link para /live
- Se `last_payment_link` existe e e valido (< 12h): redireciona
- Se link expirado/invalido: chama `create-payment` para gerar novo, redireciona
- Loading state com spinner enquanto resolve

**c) Alterar templates de email:**

Todos os templates passam a usar `{{payment_page_url}}` em vez de `{{payment_link}}`:

```text
// ANTES:
<a href="{{payment_link}}">Retomar pagamento</a>

// DEPOIS:
<a href="{{payment_page_url}}">Retomar pagamento</a>
```

Onde `payment_page_url = https://imagenscomia.lovable.app/pagar?o={order_id}`

**d) Alterar followup-abandoned:**

Em vez de injectar o link directo do EuPago, injectar o URL estavel:

```text
const paymentPageUrl = `https://imagenscomia.lovable.app/pagar?o=${reg.order_id}`;
// Passa como templateVars.payment_link = paymentPageUrl
```

Isto elimina completamente o problema de links expirados nos emails.

**e) Nova edge function `resolve-payment` (opcional):**

Se preferir resolver server-side (sem expor logica no frontend):

- Recebe `order_id`
- Devolve `{ redirect_url: "..." }` com link valido ou regenerado
- O frontend da pagina `/pagar` chama esta funcao

---

### 5. Impacto no E-goi (tags/segmentos/automacoes)

**Estado actual:** O E-goi recebe contactos via `sync-egoi` com:
- Tag ID 31 (`webinar_imagens_com_ia_18_fev`)
- Campo extra 40 (referral code)

**Impacto da mudanca:** ZERO. As alteracoes propostas nao afectam:
- O momento de sync (acontece no `register-free`, antes de qualquer pagamento)
- As tags enviadas (tag 31 e aplicada na inscricao, nao no pagamento)
- Os segmentos (baseados em tags, nao em URLs)
- As automacoes E-goi (trigger por "Tag adicionada", independente do fluxo de pagamento)

O E-goi nao recebe nem processa links de pagamento -- apenas recebe o contacto e a tag. Qualquer automacao de email pelo E-goi (se existir) usa templates proprios do E-goi, nao os da tabela `email_templates`.

---

### 6. Garantia: emails nunca com links directos que expiram

**Problema actual:** Todos os 7 templates activos usam `{{payment_link}}` que e o URL directo do EuPago (ex: `https://eupago.pt/pay/abc123`). Se o email for aberto 48h+ depois, o link esta morto.

**Solucao com `/pagar?o=...`:**

| Aspecto | Antes | Depois |
|---------|-------|--------|
| URL no email | `https://eupago.pt/pay/abc123` (expira) | `https://imagenscomia.lovable.app/pagar?o=Xk9mZ2` (permanente) |
| Utilizador clica 3 dias depois | Pagina de erro EuPago | Pagina propria resolve link novo automaticamente |
| Reenvio manual no CRM | Precisa verificar/regenerar link | URL estavel, resolve sempre |
| Rastreio | Dificil -- links diferentes por tentativa | `order_id` unico, todos os emails apontam para o mesmo |

**Beneficios adicionais:**
- O `order_id` torna-se o identificador universal de rastreio (em vez de `transactionID` que muda a cada tentativa)
- O `identifier` enviado ao EuPago pode passar a ser `ORDER-{order_id}` em vez de conter o email
- A pagina `/pagar` pode mostrar o estado actual (pendente/pago) e oferecer suporte
- Analytics: saber quantas vezes o utilizador visitou a pagina de pagamento

---

### Resumo de ficheiros a alterar

| Ficheiro | Accao |
|----------|-------|
| Migracao BD | Adicionar coluna `order_id` (text, unique) |
| `supabase/functions/register-free/index.ts` | Gerar `order_id` no registo |
| `supabase/functions/create-payment/index.ts` | Usar `order_id` no `identifier` EuPago |
| `supabase/functions/followup-abandoned/index.ts` | Substituir `payment_link` por URL estavel |
| `supabase/functions/eupago-webhook/index.ts` | Fallback de match por `order_id` no identifier |
| `src/pages/Pagar.tsx` (novo) | Pagina que resolve link e redireciona |
| `src/App.tsx` | Adicionar rota `/pagar` |
| BD: `email_templates` | Actualizar `variables` de `payment_link` para `payment_page_url` |

