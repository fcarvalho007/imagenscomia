

# Avaliação do /comprar — dados de faturação

## Estado actual

O `InvoiceForm` **já está integrado** no `PurchaseModal` (linhas 244-254). O fluxo funciona:
1. Utilizador preenche nome + email
2. Debounce de 800ms chama `register-free` para criar registo
3. InvoiceForm aparece quando os campos do comprador são válidos
4. Botão "Confirmar e pagar" fica desabilitado até `invoiceValid === true`

## Problemas identificados

### 1. Bug crítico: `registrationId`/`editToken` não propagam para o InvoiceForm
O `InvoiceForm` usa `useState(registrationId || null)` na inicialização (linha 48-49). Quando o `PurchaseModal` obtém o `registrationId` após o `register-free` assíncrono, a prop muda **mas o state interno do InvoiceForm não actualiza** — `useState` só usa o valor inicial. Resultado: o InvoiceForm pode nunca conseguir guardar porque `regId` fica `null`.

**Fix:** Adicionar um `useEffect` no `InvoiceForm` para sincronizar `regId`/`token` quando as props mudam.

### 2. Lookup por email sem filtrar por webinar
O `InvoiceForm` (linha 79-83) faz `.eq("email", userEmail).maybeSingle()` sem filtrar por `webinar`. Se alguém tem registos em vários webinars, pode apanhar o registo errado.

**Fix:** Aceitar prop `webinar` no InvoiceForm e adicionar `.eq("webinar", webinar)` ao query. Alternativa mais simples: como o PurchaseModal já passa `registrationId` directamente, o fix do ponto 1 torna este lookup desnecessário nesse contexto.

### 3. Grupo: faturação ausente
Quando `groupMode === true`, o InvoiceForm é escondido (linha 244: `&& !groupMode`). Compras de grupo não recolhem dados de faturação.

**Fix:** Mover o InvoiceForm para fora da condição `!groupMode`, ou integrá-lo dentro do `GroupCheckoutForm`.

### 4. UX: formulário extenso no modal
O modal já tem 3 campos (nome, apelido, email) + 6 campos de faturação = 9 campos antes do botão. Em mobile, o scroll pode ser longo e o utilizador pode não ver o CTA.

**Fix suave:** Pré-preencher `invoice_email` com o email do comprador (já acontece) e `invoice_name` com `firstName + lastName` para reduzir fricção.

## Plano de alterações

| Ficheiro | Alteração |
|---|---|
| `src/components/upgrade/InvoiceForm.tsx` | Adicionar `useEffect` para sincronizar `regId`/`token` com props; aceitar prop opcional `webinar` para filtrar lookup; pré-preencher `invoice_name` a partir de novo prop `defaultName` |
| `src/components/webinar/PurchaseModal.tsx` | Passar `webinar` ao InvoiceForm; passar `defaultName`; mostrar InvoiceForm também em `groupMode` (antes do GroupCheckoutForm) |

