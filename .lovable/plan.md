

# Análise do caso Hugo Patricio — Problemas e acções

## Estado actual (3 inscrições)

| Reg ID | Webinar | Email | Plano | Pago? | Fatura |
|--------|---------|-------|-------|-------|--------|
| `3ef7b16d` | **imagens** | hugo.patricio@tensai.pt | gravacao | ✅ 33,21€ | ❌ **Morada errada** — "Vagos" em vez de "Leça da Palmeira" |
| `1886c181` | **video** | hugo.patricio@tensai.pt | gravacao | ❌ Não pago | ✅ Morada correcta |
| `220bfa96` | imagens | hugo.patric**o**@tensai.pt (typo) | gravacao | ❌ | ✅ Morada correcta |

## Problemas identificados

### 1. Fatura #252656566 emitida com morada errada
Quando copiámos os dados de faturação para o registo pago (`3ef7b16d`), usámos a morada "Zona Industrial de Vagos, 3840-385 Vagos" (origem desconhecida — possivelmente preenchida pelo Hugo no primeiro checkout antes de se re-inscrever). Hugo quer: **Rua Nogueira Pinto, Nº 201, 4450-747, Leça da Palmeira**.

**Acção**: Corrigir `invoice_details` no registo `3ef7b16d` via `invoice-upsert` e re-emitir a fatura (anular #252656566, criar nova).

### 2. Hugo não recebeu email de acesso ao conteúdo (gravação imagens)
O webhook para webinar=imagens envia apenas um email genérico (`payment_confirmed_customer`) com link para `/live`. Não existe template de acesso específico para o plano `gravacao` do webinar imagens. O `send-video-recursos-single` só funciona para o webinar **video**.

**Acção de código**: Expandir o `eupago-webhook` para enviar emails de acesso plan-specific também para o webinar imagens (similar ao que já faz para video). Ou, mais simples: criar uma versão "imagens" no `send-video-recursos-single` que cubra `gravacao`/`premium`/`masterclass`/`bundle` para imagens.

### 3. Inscrição video (`1886c181`) não paga
Hugo diz que "também se inscreveu" noutro curso (o de vídeo). Esta inscrição está pendente — tem `eupago_ref` mas não tem `paid_at`. Pode significar que gerou referência mas ainda não pagou, ou que pagou e o webhook não reconciliou.

**Acção**: Verificar com Hugo se já pagou o curso de vídeo. Se sim, verificar payment_events. Se não, é uma segunda compra pendente.

## Plano de implementação

### Acções imediatas (manual, via edge function)
1. **Corrigir invoice_details** do registo `3ef7b16d` com morada correcta via `invoice-upsert`
2. **Anular fatura #252656566** e re-emitir com dados correctos via `create-invoice`
3. **Enviar email de acesso** ao Hugo para o conteúdo de gravação do webinar imagens (manualmente, via tab Comunicação do CRM ou nova invocação)

### Melhoria de código
1. **`supabase/functions/eupago-webhook/index.ts`** — Adicionar bloco de emails plan-specific para webinar `imagens` (à semelhança do que existe para `video` nas linhas 1046-1123), cobrindo os planos `gravacao`, `premium`, `masterclass`, `bundle` com templates apropriados

Isto resolve o problema sistémico: qualquer futuro comprador de gravação/premium/etc no webinar imagens receberá email de acesso automático após pagamento.

### Ficheiros alterados
- `supabase/functions/eupago-webhook/index.ts` — adicionar emails plan-specific para webinar imagens

