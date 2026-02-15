

## Dashboard: Distinguish Real Sends from Internal Logs

### Problem
The Dashboard currently counts all `message_logs` with `status='sent'` as "emails sent", but 9 of those are `provider='internal'` (old code logs, never actually delivered via Resend). This creates a false impression of delivery.

### Solution
Split the email metrics in DashboardView into two distinct categories and update the queries to filter by provider.

### Changes

**File: `src/components/crm/DashboardView.tsx`**

1. Where email counts are currently fetched/computed, add provider filtering:
   - "Enviados (Resend)" = `provider='resend' AND status='sent' AND provider_message_id IS NOT NULL`
   - "Processados (internal)" = `provider='internal' AND status='sent'`
   - "Falhas" = `status='failed'` (any provider)

2. Display layout in the email stats cards:
   - Primary card: "Enviados via Resend" with count (24h / 7d)
   - Secondary/muted: "Logs internos" with count (grayed out, clearly secondary)
   - "Falhas" card stays as-is

3. Add a small info tooltip on the "Enviados via Resend" card: "Apenas emails confirmados pelo Resend com ID de entrega"

### Technical Detail

The existing query in DashboardView fetches from `message_logs`. The change adds a `provider` filter to the aggregation:

```sql
-- Resend confirmed
WHERE provider='resend' AND status='sent' AND provider_message_id IS NOT NULL

-- Internal (legacy)
WHERE provider='internal' AND status='sent'
```

Both 24h and 7d windows apply as before.

### Files Changed
1. `src/components/crm/DashboardView.tsx` — split email metrics by provider

### No Changes To
- Edge function logic
- Database schema
- Other CRM views

