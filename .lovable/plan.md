
## 3 Estados Distintos de Conversao no CRM

### Problema actual
O CRM trata todos os nao-pagantes com `plan_selected` como "Pendente" (badge ambar), sem distinguir quem apenas seleccionou o produto de quem realmente clicou para pagar e foi redireccionado para a EuPago.

### Os 3 estados rastreaveis

Com base nos campos ja existentes na base de dados, podemos distinguir com precisao:

| Estado | Condicao na BD | Significado |
|---|---|---|
| Seleccionou | `plan_selected` existe, `upgrade_clicked_at` NULL | Escolheu produto mas abandonou antes de clicar "Pagar" |
| Aguarda pagamento | `upgrade_clicked_at` existe, `eupago_ref` existe, `paid_at` NULL | Clicou "Pagar", foi redireccionado para EuPago, mas nao completou |
| Pago | `paid_at` existe | Pagamento confirmado pelo webhook |

Nao e necessario adicionar nenhum campo novo a base de dados. Toda a informacao ja existe.

### Alteracoes tecnicas

**Ficheiro: `src/hooks/useInscritos.ts`**

Alterar a logica de `payment_status` (linhas 19-24) de 2 estados para 3:

```
Actual (2 estados):
  paid_at → "paid"
  plan_selected != free → "pending"
  senao → "free"

Novo (3 estados):
  paid_at → "paid"
  upgrade_clicked_at existe → "awaiting_payment"
  plan_selected != free → "selected"
  senao → "free"
```

Actualizar o tipo `Inscrito` em `src/pages/crm/mockData.ts` para incluir os novos estados.

**Ficheiro: `src/components/crm/TableView.tsx`**

Actualizar os badges de estado:
- "Seleccionou" — badge azul claro (interesse, mas sem accao de pagamento)
- "Aguarda pagamento" — badge ambar (ja tem link EuPago, pode pagar a qualquer momento)
- "Pago" — badge verde (confirmado)

**Ficheiro: `src/components/crm/DashboardView.tsx`**

No card Pipeline, separar em duas linhas:
- "X seleccionaram mas nao clicaram pagar" (leads frios — precisam de nudge)
- "Y clicaram pagar mas nao completaram" (leads quentes — seguir de imediato)

Actualizar os KPIs e contagens para reflectir os 3 estados.

**Ficheiro: `src/components/crm/InscritoModal.tsx`**

No perfil do inscrito, mostrar o estado correcto com contexto:
- "Seleccionou Premium" vs "Aguarda pagamento — Premium (ref: XXX)"

### Ficheiros afectados

| Ficheiro | Alteracao |
|---|---|
| `src/pages/crm/mockData.ts` | Adicionar novos valores ao tipo payment_status |
| `src/hooks/useInscritos.ts` | Logica de 3 estados baseada nos campos existentes |
| `src/components/crm/TableView.tsx` | Badges distintos para cada estado |
| `src/components/crm/DashboardView.tsx` | Pipeline separado em "seleccionou" vs "aguarda pagamento" |
| `src/components/crm/InscritoModal.tsx` | Estado detalhado no perfil |
