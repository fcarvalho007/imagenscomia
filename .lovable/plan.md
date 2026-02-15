

## Required Changes

Two small but critical updates before the cron job can go live.

---

### 1. Fix Resend "From" address

The current code uses `info@fredericocarvalho.pt`. Per your instruction, it must be changed to:

```
frederico.carvalho@digitalfc.pt
```

**File:** `supabase/functions/followup-abandoned/index.ts` (line 247)
- Change: `from: "Frederico Carvalho <info@fredericocarvalho.pt>"` to `from: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>"`

---

### 2. Schedule pg_cron job with x-cron-secret

Run via SQL insert (not migration) to create the cron schedule:

```sql
select cron.schedule(
  'followup-abandoned-every-10min',
  '*/10 * * * *',
  $$
  select net.http_post(
    url:='https://gwphpsehcnhwjiypyolg.supabase.co/functions/v1/followup-abandoned',
    headers:='{"Content-Type":"application/json","x-cron-secret":"Yx7Kp2mQ9vD4nL8sR3tA6hJ1cW5zB0uE7iO2pS9"}'::jsonb,
    body:='{"source":"cron"}'::jsonb
  ) as request_id;
  $$
);
```

This stores the secret server-side in pg_cron only. The `pg_cron` and `pg_net` extensions must already be enabled (they were enabled in a previous migration).

---

### 3. Redeploy followup-abandoned

After the from-address fix, redeploy the edge function and verify with a curl test using the correct `x-cron-secret` header.

---

### Implementation order

1. Update from address in `followup-abandoned/index.ts`
2. Deploy edge function
3. Run the cron schedule SQL insert
4. Test with curl to confirm 200 response with correct secret
5. Wait 10 minutes, check edge function logs to confirm cron is triggering

