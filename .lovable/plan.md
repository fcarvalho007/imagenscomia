

# Backfill SMS logs from SMSOnline/SMSEasy report

## Context
The 225 SMS for `sms_followup_day1` were sent via SMSOnline.pt (SMSEasy) outside the CRM, so no `message_logs` entries exist. This means the automation node shows 0 sent/0 failed, and client activity timelines have no SMS history.

From the CSV report (225 rows):
- ~195 DELIVRD (delivered)
- ~8 REJECTD (rejected/invalid numbers)
- ~8 UNDELIV (undeliverable)
- Some duplicate phone numbers (same person sent twice)

## Approach
Create a new edge function `backfill-sms-logs` that:

1. Receives the parsed CSV data as JSON (phone + status + timestamp)
2. Loads all video registrations with a phone number
3. Matches CSV phones to registrations by normalizing: strip `351` prefix from CSV phone, compare to `registrations.whatsapp` (stored as 9-digit)
4. Inserts `message_logs` entries with `template_key: "sms_followup_day1"`, `provider: "smseasy"`, `channel: "sms"`
5. Status mapping: `DELIVRD` -> `sent`, `REJECTD`/`UNDELIV` -> `failed`
6. Dedup: skips if a log already exists for same registration + template
7. Uses the CSV `ENTREGUE` timestamp as `created_at`

## UI
Add a one-time "Importar relatório SMS" button on the SMS node in AutomationFlowTab that:
- Opens a file picker for CSV
- Parses semicolon-delimited CSV client-side
- Sends parsed rows to the edge function
- Shows toast with result (matched, unmatched, skipped)

## Files
- **New**: `supabase/functions/backfill-sms-logs/index.ts`
- **Edit**: `supabase/config.toml` (add `[functions.backfill-sms-logs]` with `verify_jwt = false`)
- **Edit**: `src/components/crm/AutomationFlowTab.tsx` (add CSV import button on SMS node)

After import, both the node counters and client activity timelines will automatically reflect the data since both read from `message_logs`.

