

# Plano: Reconciliar pagamento do Bruno Costa + Mover inscritos entre estagios

## Parte 1: Reconciliar pagamento orfao (Bruno Costa)

Atualizar o registo do Bruno Costa (id: `4083d6e3-7eac-4e40-9824-cf1f3bdb735c`) na base de dados:
- `plan_selected` = `video-bundle`
- `paid_at` = `2026-03-01T14:28:23Z`
- `eupago_ref` = `62556563`
- `eupago_transaction_id` = `106795053`

Remover o evento `unmatched_payment` correspondente da tabela `payment_events` (se existir).

---

## Parte 2: Alterar plano/estagio de um inscrito dentro da ficha (modal)

Adicionar um selector de plano no `StatusBlock` ou `SidebarActions` do modal que permite ao admin:
- Alterar o plano do inscrito (free, premium, masterclass, bundle)
- Marcar como pago manualmente (com data actual)
- Marcar como "sem interesse" (lost)

Isto resolve o caso de uso "preciso mover o Bruno para bundle" sem sair da ficha.

### Implementacao

**Novo hook `updatePlan` em `useInscritos.ts`:**
- Recebe `(inscritoId, newPlan, markAsPaid?)` 
- Atualiza `plan_selected` na BD (com prefixo `video-` se webinar === "video")
- Se `markAsPaid`, define `paid_at` = now
- Atualiza o valor local correspondente

**Novo hook `markAsLost` em `useInscritos.ts`:**
- Recebe `(inscritoId, reason?)`
- Atualiza `lost_at` = now, `lost_reason` na BD

**UI no modal (SidebarActions ou StatusBlock):**
- Dropdown/select para alterar plano com confirmacao
- Botao "Marcar como pago" (para reconciliacoes manuais)
- Botao "Sem interesse" com campo opcional de motivo

---

## Parte 3: Drag-and-drop no Pipeline (desktop)

Adicionar drag-and-drop nas colunas do pipeline kanban para mover cards entre estagios.

### Abordagem tecnica

Utilizar a API nativa de HTML5 Drag and Drop (sem biblioteca externa) para manter o bundle leve. Cada `PipelineCard` recebe `draggable="true"` e cada coluna aceita drops.

### Mapeamento de colunas para accoes

Quando um card e largado numa coluna diferente, a accao correspondente e executada:

```text
Coluna destino          -> Accao na BD
-----------------------------------------------------
Inscrito                -> plan_selected=null, paid_at=null, lost_at=null
Flow Completo           -> step_reached=5, plan_selected=null, lost_at=null
Premium Pass            -> plan_selected=premium, lost_at=null
Masterclass             -> plan_selected=masterclass, lost_at=null
Bundle                  -> plan_selected=bundle, lost_at=null
Follow-up Necessario    -> follow_up=true, lost_at=null
Sem interesse           -> lost_at=now()
```

Nota: mover para Premium/Masterclass/Bundle NAO marca como pago automaticamente — apenas muda a intencao. Para marcar como pago, usa-se a ficha do inscrito.

### Ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| `src/hooks/useInscritos.ts` | Adicionar `updatePlan`, `markAsLost`, `markAsPaid` |
| `src/components/crm/PipelineView.tsx` | Adicionar drag-and-drop com HTML5 API |
| `src/components/crm/modal/SidebarActions.tsx` | Adicionar selector de plano + marcar pago + sem interesse |
| `src/pages/CRM.tsx` | Passar novos callbacks ao PipelineView e InscritoModal |
| BD (data update) | Reconciliar Bruno Costa |

### Notas importantes

- O drag-and-drop so funciona em desktop (mobile mantem o accordion actual)
- Cada drop pede confirmacao antes de executar a alteracao
- As alteracoes sao persistidas na BD imediatamente via Supabase
- O pipeline re-renderiza automaticamente apos a actualizacao do estado local

