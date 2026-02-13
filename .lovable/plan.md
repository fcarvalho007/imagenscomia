

## Melhorar visibilidade do estado de pagamento no CRM

### 1. Actualizar dados da Silvana Curado

A Silvana pagou o bundle (confirmado na EuPago, ref WEBINAR-BUNDLE-silvanacurado@gmail.com-1770999580195, valor 76,26). O webhook nao processou porque o formato GET nao era suportado na altura. Agora que o webhook ja suporta GET, futuros pagamentos serao processados automaticamente.

Actualizar manualmente o registo:
```sql
UPDATE registrations SET paid_at = NOW() WHERE email = 'silvanacurado@gmail.com' AND plan_selected = 'bundle';
```

### 2. Adicionar badge de estado de pagamento no Pipeline

Ficheiro: `src/components/crm/PipelineView.tsx`

No componente `PipelineCard`, adicionar badge visual:
- **Pago** (verde) — quando `payment_status === "paid"` e plano nao e free
- **Pendente** (ambar) — quando `payment_status === "pending"`
- Sem badge — quando e free

Isto permite ver de relance, em cada card do kanban, quem pagou e quem so clicou.

### 3. Adicionar badge na Ficha Individual (InscritoModal)

Ficheiro: `src/components/crm/InscritoModal.tsx`

Na barra de resumo compacto (linha ~353-377), adicionar:
- Badge **"Pendente — aguarda pagamento"** (ambar) quando `payment_status === "pending"`
- Badge **"Pago"** (verde) quando `payment_status === "paid"` e plano nao e free
- Mostrar a data de `upgrade_clicked_at` se existir, para saber quando o utilizador clicou em pagar

### 4. Adicionar filtro de estado de pagamento na Tabela

Ficheiro: `src/components/crm/TableView.tsx`

Adicionar um novo filtro dropdown junto aos existentes:
- "Todos os estados"
- "Pendente" (mostra so quem clicou mas nao pagou)
- "Pago" (mostra so pagamentos confirmados)
- "Gratuito"

Isto facilita identificar rapidamente quem precisa de follow-up.

### Ficheiros afectados

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/PipelineView.tsx` | Badge Pendente/Pago nos cards do kanban |
| `src/components/crm/InscritoModal.tsx` | Badge de estado + data de clique na barra de resumo |
| `src/components/crm/TableView.tsx` | Filtro dropdown por estado de pagamento |
| Base de dados | UPDATE paid_at para silvanacurado@gmail.com |

