

## Fix 3 Production Blockers + Verify End-to-End

### Blocker 1: CRON (Delete broken job, verify working job)

**Action**: Delete pg_cron job 1 (the one using `Authorization: Bearer <anon_key>` that returns 401).

```sql
SELECT cron.unschedule(1);
```

Job 2 (jobid=2) already uses `x-cron-secret` correctly and runs every 10 minutes. Keep it.

**Add run logging** to edge function: Add a `run_id` (timestamp-based) and log source + candidate count at the start of each run for easier debugging in edge function logs.

**File:** `supabase/functions/followup-abandoned/index.ts`
- After the cron secret check passes, add:
  ```
  const runId = `run-${Date.now()}`;
  console.log(`[followup-abandoned] ${runId} started, source=cron`);
  ```
- Before the final return, log:
  ```
  console.log(`[followup-abandoned] ${runId} complete:`, JSON.stringify(summary));
  ```
- Deploy the function.

**Verification**: After deploy, wait for the next cron execution (within 10 min) and check edge function logs for the run_id + summary output.

---

### Blocker 2: Legacy UNIQUE constraint on email_templates

**Action**: Drop the constraint `email_templates_template_key_key` via migration.

```sql
ALTER TABLE email_templates DROP CONSTRAINT email_templates_template_key_key;
```

The table already has:
- `email_templates_key_version_unique`: UNIQUE(template_key, version) -- correct
- `idx_one_active_per_key`: partial unique on template_key WHERE is_active = true -- correct

This unblocks versioned editing in the CRM TemplatesView.

---

### Blocker 3: Confirm Resend delivery works

The edge function code already correctly:
1. Inserts `message_logs` with `status='queued'`, `provider='resend'`
2. Calls Resend API with `from: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>"`
3. Updates to `status='sent'` with `provider_message_id` on success
4. Updates to `status='failed'` with error on failure

The existing 9 rows with `provider='internal'` were created by an older version of the code before the Resend integration was added. Once the cron runs successfully with the current deployed code, new rows will have `provider='resend'`.

**Verification approach**: After deploying the updated function with run logging, trigger it manually via curl with `x-cron-secret` to confirm:
- HTTP 200 response with summary
- New `message_logs` rows with `provider='resend'`
- `provider_message_id` populated for sent emails

---

### Summary of Changes

| Step | Action | File/Tool |
|------|--------|-----------|
| 1 | Delete broken cron job 1 | SQL insert tool: `SELECT cron.unschedule(1)` |
| 2 | Drop legacy UNIQUE constraint | Migration: `ALTER TABLE email_templates DROP CONSTRAINT email_templates_template_key_key` |
| 3 | Add run_id logging to edge function | `supabase/functions/followup-abandoned/index.ts` |
| 4 | Deploy edge function | Auto-deploy |
| 5 | Trigger manual test via curl | `curl_edge_functions` with x-cron-secret header |
| 6 | Verify message_logs has provider=resend rows | SQL query |
| 7 | Check edge function logs for run summary | Edge function logs tool |

### Files Changed
1. `supabase/functions/followup-abandoned/index.ts` -- add run_id + structured logging
2. New migration -- drop legacy constraint

### No Changes To
- Payment logic (EuPago)
- Idempotency rules
- Template loading logic
- CRM UI (already working, just blocked by constraint)
- Dashboard/InscritoModal metrics (already implemented)
