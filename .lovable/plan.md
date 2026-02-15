

## Centro de Follow-up: Enriquecimento com Cobertura, SLA e Lista de Pessoas

### Current State

The Follow-up center already exists with 3 tabs (Visao Geral, Envio e Auditoria, Templates). This plan adds the missing features: Coverage KPI, SLA by intent age, and a PESSOAS sub-tab.

### Changes

**1. `FollowUpOverview.tsx` -- Add Coverage KPI + SLA Buckets**

After the email metrics section, add two new blocks:

- **Cobertura Resend**: A card showing `pessoas com >=1 Resend confirmado / pipeline pendente` as a percentage, plus per-stage breakdown (Stage 0 coverage, Stage 1 coverage, etc.). Computed client-side by cross-referencing `inscritos` with `logs` where `provider='resend' AND status='sent' AND provider_message_id IS NOT NULL`.

- **SLA por idade da intencao**: A table/grid with buckets based on `upgrade_clicked_at` (or `created_at` as fallback): 0-2h, 2-12h, 12-24h, 24-48h, 48h+. Each bucket shows: total count, "Sem Resend" count, "Em atraso" count. All computed client-side from `inscritos` + `logs`.

**2. `FollowUpView.tsx` -- Split Tab 2 into Pessoas + Envios sub-tabs**

Rename Tab 2 from "Envio e Auditoria" to "Pessoas e Auditoria". Inside, add an inner tab bar with two sub-tabs:

- **A) PESSOAS** -- New component `FollowUpPessoas.tsx`: A table of pipeline registrations (`plan_selected != 'free' AND paid_at IS NULL`) with columns: nome, email, plano, valor, followup_stage, last_followup_at, next_followup_at, "Resend confirmado?" (yes/no derived from logs), "motivo" (derived: backlog/recent/weak/overdue). Actions: Abrir ficha, Copiar link pagamento, WhatsApp link. Filters: etapa, sem Resend, em atraso, link expirado, falha email, idade intencao. Mobile: card layout.

- **B) ENVIOS** -- Existing `FollowUpAudit.tsx` (unchanged).

The `initialFilter` from alerts will route to the correct sub-tab (PESSOAS for people-based alerts like "Sem Resend" / "Em atraso", ENVIOS for log-based alerts like "Com falha").

**3. `FollowUpOverview.tsx` -- Improve alert routing**

Update alert click handlers to specify whether they should open PESSOAS or ENVIOS sub-tab:
- "Sem email Resend" -> PESSOAS with filter `semResend=true`
- "Em atraso" -> PESSOAS with filter `emAtraso=true`
- "Link expirado" -> PESSOAS with filter `linkExpirado=true`
- "Com falha de email" -> ENVIOS with filter `status=failed, timeRange=24h`

**4. Files**

| File | Action |
|------|--------|
| `src/components/crm/FollowUpOverview.tsx` | Edit: add Coverage KPI + SLA buckets + update alert routing |
| `src/components/crm/FollowUpPessoas.tsx` | Create: pipeline people table with filters |
| `src/components/crm/FollowUpView.tsx` | Edit: add sub-tabs in Tab 2, update AuditFilter type to include people filters + sub-tab target |
| `src/components/crm/FollowUpAudit.tsx` | No changes |
| `src/components/crm/TemplatesView.tsx` | No changes |
| `src/pages/CRM.tsx` | No changes |
| `src/components/crm/CRMSidebar.tsx` | No changes |

### Technical Details

**Coverage KPI computation** (client-side in FollowUpOverview):
```text
resendIds = Set of registration_ids from logs where provider='resend' AND status='sent' AND provider_message_id IS NOT NULL
pipeline = inscritos where plan_selected != 'free' AND paid_at IS NULL
coverage = pipeline.filter(i => resendIds.has(i.id)).length / pipeline.length
```
Per-stage: same logic filtered by `followup_stage`.

**SLA buckets** (client-side):
```text
intentAge = now - (upgrade_clicked_at || created_at)
buckets: [0-2h, 2-12h, 12-24h, 24-48h, 48h+]
For each bucket: count total, count without Resend, count overdue
```

**FollowUpPessoas filters** (all client-side from inscritos + logs):
- Etapa: chip per stage (0/1/2/3+)
- Sem Resend: toggle
- Em atraso: toggle (next_followup_at < now AND !do_not_contact)
- Link expirado: toggle (payment_link_created_at > 48h)
- Falha email: toggle (has failed log in 24h)
- Idade intencao: dropdown (0-2h/2-12h/12-24h/24-48h/48h+)

**AuditFilter type extension**:
```typescript
export interface AuditFilter {
  // existing fields...
  subTab?: "pessoas" | "envios";
  semResend?: boolean;
  emAtraso?: boolean;
  linkExpirado?: boolean;
  ageBucket?: string;
}
```

**Queries used (proof)**:
1. Funnel: `inscritos.filter(i => i.plan_selected && i.plan_selected !== 'free' && !i.paid_at)` grouped by `followup_stage`
2. Resend confirmados: `logs.filter(l => l.provider === 'resend' && l.status === 'sent' && l.provider_message_id)`
3. Falhas: `logs.filter(l => l.status === 'failed')`
4. Sem Resend: pipeline inscritos whose id is NOT in the resendIds set
5. All use `provider_message_id IS NOT NULL` for confirmed sends (mandatory)

No schema changes. No edge function changes. All read-only against existing tables.
