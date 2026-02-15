

## Controlled Resend Test (Proof of Real Delivery)

### Why zero Resend sends exist

All 9 candidates completed stage 0 via the old code (provider='internal') at ~20:46 UTC. They advanced to followup_stage=1, but stage 1 requires a 6-hour delay from last_followup_at. They won't be eligible until ~02:46 UTC. The current code is correct -- it just hasn't had eligible candidates yet.

### Test Plan (3 steps)

**Step 1 -- Make one candidate eligible NOW**

Pick Luis Pena (id: `9454b720-...`, email: `lfpena@remax.pt`) and set his `last_followup_at` back by 7 hours:

```sql
UPDATE registrations 
SET last_followup_at = now() - interval '7 hours'
WHERE id = '9454b720-d704-4e14-9b40-138e1bc94a7c';
```

This makes him eligible for stage 1 immediately while keeping all other data intact.

**Step 2 -- Trigger followup-abandoned manually**

Call the edge function with `x-cron-secret` header. Expect HTTP 200 with summary showing `sent: 1`.

**Step 3 -- Verify proof in database and logs**

Run verification queries:

```sql
-- New Resend row
SELECT id, registration_id, provider, status, provider_message_id, template_key, created_at
FROM message_logs
WHERE provider = 'resend' AND created_at > now() - interval '10 minutes'
ORDER BY created_at DESC;
```

Check edge function logs for the run summary with `sent: 1`.

### Expected outcome

- 1 new row in message_logs: provider='resend', status='sent', provider_message_id filled
- Edge function log: `[followup-abandoned] run-xxx complete: {"processed":9,"sent":1,"skipped":8,"errors":0}`
- Luis Pena advances to followup_stage=2

### Risk

This sends a REAL email to lfpena@remax.pt with the followup_stage_1 template. If you prefer a safer target, we can use a different registration or create a test one.

### Files Changed
None -- this is a database update + manual trigger only.
