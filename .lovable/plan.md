

## Tres Correcoes: Rastreio de Pagamento + Modal Pre-Redirect + Precos EuPago

### 1. Corrigir precos enviados a EuPago

Os valores enviados a EuPago devem incluir IVA (23%), pois e o valor final cobrado ao cliente:

| Plano | Base | c/ IVA (valor EuPago) | Actual (errado) |
|---|---|---|---|
| Premium | 15 | 18.45 | 15.00 |
| Masterclass | 47 | 57.81 | 52.00 |
| Bundle | 62 | 76.26 | 524.00 |
| Workshop | (manter) | (manter) | 512.00 |

**Ficheiro:** `supabase/functions/create-payment/index.ts` - actualizar os `value` no objecto PRODUCTS.

---

### 2. Garantir rastreio 100% do pagamento

O sistema actual extrai o email do campo `identifier` (formato `WEBINAR-PLAN-email-timestamp`). Isto funciona na maioria dos casos, mas ha dois pontos frageis:

- Se o email tiver formato inesperado, a extraccao pode falhar
- O `transactionID` da EuPago (devolvido na criacao) nao e guardado, perdendo-se a ligacao directa

**Solucao em duas partes:**

**a) Guardar `transactionID` + `eupago_ref` na DB no momento da criacao do link** (antes do pagamento):
- Na funcao `create-payment`, apos receber resposta da EuPago, fazer UPDATE na tabela `registrations` com o `transactionID` e o plano
- Isto cria um registo previo que liga email -> transactionID

**b) No webhook, usar dupla verificacao:**
- Primeiro tentar localizar por `transactionID` (match exacto, 100% fiavel)
- Se falhar, usar o metodo actual de extraccao de email como fallback

**Ficheiros:**
- `supabase/functions/create-payment/index.ts` - guardar transactionID na DB
- `supabase/functions/eupago-webhook/index.ts` - procurar por transactionID primeiro

---

### 3. Modal de transicao antes do redirect

Quando o utilizador clica "Confirmar e pagar", em vez de redirect imediato:

1. Mostrar um modal/overlay com:
   - "Vais ser redirecionado para a pagina de pagamento seguro"
   - "Recebes um email de confirmacao apos o pagamento"
   - Spinner + texto "A preparar..."
2. Apos 2-3 segundos, fazer o redirect automatico para o link EuPago

**Ficheiro:** `src/components/upgrade/StepConfirmation.tsx` - adicionar estado de modal e overlay antes do `window.location.href`

---

### Resumo tecnico de alteracoes

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/create-payment/index.ts` | Corrigir precos c/ IVA; guardar transactionID na DB |
| `supabase/functions/eupago-webhook/index.ts` | Procurar por transactionID antes de extrair email |
| `src/pages/Upsell.tsx` | Adicionar estado para modal pre-redirect |
| `src/components/upgrade/StepConfirmation.tsx` | Mostrar modal de transicao antes do redirect |

