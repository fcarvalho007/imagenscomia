

## Correcao: Pagamentos bundle nao aparecem no CRM

### Diagnostico

**Base de dados actual:**
- **Silvana Curado**: `plan_selected=bundle`, `eupago_ref=769ef42a...`, `paid_at=NULL`
- **Renato Gaspar**: `plan_selected=bundle`, `eupago_ref=NULL`, `paid_at=NULL`

**Problema 1 — Webhook nao chegou**: Nao ha logs no webhook `eupago-webhook`, o que significa que a EuPago ainda nao enviou a confirmacao ou o URL de callback nao esta correcto. Sem webhook, `paid_at` nunca e preenchido.

**Problema 2 — CRM esconde a intencao de compra**: O `mapRegistration` so mostra o plano como "bundle" se `paid_at` existir. Sem ele, aparece como "free" — invisivel no CRM como comprador.

### Solucao

#### 1. Corrigir dados imediatamente (query manual)

Se o pagamento foi realmente confirmado na EuPago, actualizar o registo directamente:

```sql
UPDATE registrations 
SET paid_at = NOW() 
WHERE email = '[email do comprador]' AND plan_selected = 'bundle';
```

Isto deve ser executado manualmente no backend (Run SQL) para o email correcto.

#### 2. Melhorar visibilidade no CRM (`useInscritos.ts`)

Alterar a logica de `mapRegistration` para mostrar o plano seleccionado mesmo sem pagamento confirmado, com indicacao visual de estado:

- Se `paid_at` existe: plano confirmado (como agora)
- Se `plan_selected` existe mas `paid_at` e null: mostrar o plano com estado "pendente"
- Se nenhum: "free"

| Ficheiro | Alteracao |
|---|---|
| `src/hooks/useInscritos.ts` | `mapRegistration`: usar `plan_selected` como plano mesmo sem `paid_at`, e adicionar campo `payment_status` ("paid", "pending", "free") |
| `src/pages/crm/mockData.ts` | Adicionar campo `payment_status` ao tipo `Inscrito` |
| `src/components/crm/DashboardView.tsx` | Mostrar badge "Pendente" (amarelo) vs "Pago" (verde) junto ao plano |
| `src/components/crm/TableView.tsx` | Coluna de plano com indicador de estado pendente/pago |

#### 3. Verificar callback URL do webhook

Confirmar que o URL de callback configurado na funcao `create-payment` esta correcto e acessivel pela EuPago. O URL actual e:
```
${SUPABASE_URL}/functions/v1/eupago-webhook
```

Verificar no `supabase/config.toml` se `verify_jwt = false` esta configurado para `eupago-webhook`, caso contrario a EuPago recebe 401 e o webhook falha silenciosamente.

### Ficheiros afectados

| Ficheiro | Alteracao |
|---|---|
| `src/hooks/useInscritos.ts` | Logica de plano: mostrar `plan_selected` com estado pendente |
| `src/pages/crm/mockData.ts` | Tipo `Inscrito`: novo campo `payment_status` |
| `src/components/crm/DashboardView.tsx` | Badge pendente/pago no dashboard |
| `src/components/crm/TableView.tsx` | Indicador de estado na tabela |
| `supabase/config.toml` | Verificar `verify_jwt = false` para eupago-webhook |
