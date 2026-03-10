

# Diagnóstico: Hugo Patricio e António Simões

## 1. Estado actual

| | Hugo Patricio | António Simões |
|---|---|---|
| **Email** | hugo.patricio@tensai.pt | antonio.simoes@marktosales.com |
| **Plano** | gravacao (33,21€) | video-bundle (131,61€) |
| **Webinar** | **imagens** | video |
| **Fonte** | gravacao | webinar |
| **created_at** | 10/Mar 16:36 | **24/Fev 23:22** |
| **paid_at** | 10/Mar 17:02 ✅ | 10/Mar 17:01 ✅ |
| **NIF/Fatura** | ❌ Sem dados | ✅ Dados preenchidos, fatura emitida |

## 2. Porque "não aparecem no pós-webinar"

- **Hugo**: webinar=`imagens` e fonte=`gravacao`. Se o CRM estiver filtrado para contexto "Vídeo", não aparece. Além disso, o filtro pós-webinar usa `created_at >= 5 Mar 11:00` — ele aparece se estiver no contexto "Imagens" ou "Consolidado".
- **António**: `created_at = 24 Fev` — muito anterior ao cutoff de 5 de Março. Não aparece nos filtros pós-webinar porque foi registado antes do evento. Apenas o pagamento é pós-webinar, não a inscrição.

**Ação necessária**: Nenhuma correcção de código — basta mudar o contexto do CRM para "Consolidado" ou o webinar correcto para ver estes registos.

## 3. Porque Hugo não tem dados de faturação

O formulário de faturação **existe** na página de checkout (`GravacaoConfirmation`) e o botão "Confirmar e pagar" está **bloqueado** até os dados serem preenchidos (`disabled={!invoiceValid}`).

O que aconteceu: Hugo tem **duas inscrições** — uma com typo (`hugo.patric**o**@tensai.pt`) que **tem** os dados de faturação (Tensai Indústria S.A, NIF 502208392), e a inscrição correcta (`hugo.patricio@tensai.pt`) onde pagou mas que **não tem** invoice_details. Isto sugere que o auto-save do `InvoiceForm` guardou os dados na sessão anterior (a do typo), e quando se registou novamente com o email correcto, os dados não foram carregados.

**Hipótese mais provável**: O InvoiceForm faz auto-save via edge function `invoice-upsert` usando `registration_id` + `edit_token`. Como a nova inscrição tem um `registration_id` diferente, os dados anteriores não migraram.

## 4. Plano de acção

### Acção imediata (manual, sem código)
- Copiar os `invoice_details` do registo com typo para o registo correcto de Hugo (ou invocar `invoice-upsert` com os dados da Tensai)

### Melhorias de código
1. **Webhook: enviar link `/fatura` automaticamente quando NIF está em falta** — Após confirmar pagamento, se não existir `invoice_details`, enviar email ao cliente com link directo para preencher dados de faturação. Isto serve como rede de segurança para qualquer fluxo de checkout que falhe a recolha.

   Ficheiro: `supabase/functions/eupago-webhook/index.ts` — adicionar bloco após a secção de invoice_notification que envia email com link `/fatura?rid={id}&t={edit_token}` quando `invoice_details` está vazio.

2. **InvoiceForm: tentar carregar dados de faturação de registos anteriores do mesmo email** — No `invoice-upsert` ou no `InvoiceForm`, se não houver dados para o `registration_id` actual, procurar por registos anteriores com o mesmo email que já tenham `invoice_details` e pré-preencher.

   Ficheiro: `src/components/upgrade/InvoiceForm.tsx` — no `useEffect` de carregamento, se o registo actual não tiver dados, fazer query adicional pelo email.

