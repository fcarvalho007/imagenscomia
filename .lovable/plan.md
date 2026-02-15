

## Phase B — Required Changes Implementation

This plan applies the 3 non-negotiable changes on top of the already-implemented Phase B infrastructure.

---

### Required Change 1: Cron Security (x-cron-secret)

**What changes:**

1. **Add secret `CRON_SECRET`** — request user to set a random string via the add_secret tool.

2. **Update `followup-abandoned/index.ts`** — add guard at the top of the handler:
   ```
   const cronSecret = Deno.env.get("CRON_SECRET");
   const requestSecret = req.headers.get("x-cron-secret");
   if (!cronSecret || requestSecret !== cronSecret) {
     return 401 "Unauthorized"
   }
   ```

3. **Schedule cron job** (via SQL insert tool, not migration) using `x-cron-secret` header instead of `Authorization: Bearer`:
   ```sql
   select cron.schedule(
     'followup-abandoned-every-10min',
     '*/10 * * * *',
     $$
     select net.http_post(
       url:='https://gwphpsehcnhwjiypyolg.supabase.co/functions/v1/followup-abandoned',
       headers:='{"Content-Type":"application/json","x-cron-secret":"<CRON_SECRET_VALUE>"}'::jsonb,
       body:='{"source":"cron"}'::jsonb
     ) as request_id;
     $$
   );
   ```
   Note: The cron SQL must contain the actual secret value in the headers. This is stored server-side in pg_cron, not exposed to the client. We will need to ask the user to set the CRON_SECRET first, then use that value in the SQL.

**Files changed:**
- `supabase/functions/followup-abandoned/index.ts` (add header check)
- SQL insert for cron schedule (after secret is set)

---

### Required Change 2: Actual Email Sending via Resend

**What changes:**

1. **Add secret `RESEND_API_KEY`** — request from user.

2. **Update `followup-abandoned/index.ts`** — replace the "mark as sent (internal)" block with actual Resend API call:
   - POST to `https://api.resend.com/emails` with the built subject/body
   - From: `Frederico Carvalho <info@fredericocarvalho.pt>` (or noreply domain)
   - Provider changes from `'internal'` to `'resend'`
   - On success: update message_logs status to 'sent', save provider_message_id
   - On failure: update message_logs status to 'failed', save error

3. **Update email templates** — add WhatsApp footer to all 3 stage templates:
   ```
   WhatsApp de suporte: 915 015 508
   ```
   Keep PT-PT, concise, single CTA "Retomar pagamento".

**Files changed:**
- `supabase/functions/followup-abandoned/index.ts` (Resend integration + template footer)

---

### Required Change 3: Pixel Robustness (verify paid_at before firing)

**What changes:**

1. **Update `create-payment/index.ts`** — add `&email=${encodeURIComponent(email)}` to the `successUrl` so `/confirmacao` knows which user to check.

2. **Update `followup-abandoned/index.ts`** — same change to successUrl when refreshing payment links.

3. **Update `Confirmacao.tsx`** — instead of firing fbq immediately based on URL params:
   - Read `email` from searchParams
   - Query `supabase.from("registrations").select("paid_at").eq("email", email).maybeSingle()`
   - Only fire `fbq('track', 'Purchase', ...)` if `paid_at` is not null
   - Add a `useState` to track whether the check has been done (avoid re-fires)

**Files changed:**
- `supabase/functions/create-payment/index.ts` (add email to successUrl)
- `supabase/functions/followup-abandoned/index.ts` (add email to successUrl)
- `src/pages/Confirmacao.tsx` (query DB before firing pixel)

---

### Implementation Order

1. Request secrets (CRON_SECRET + RESEND_API_KEY) from user
2. Update `followup-abandoned/index.ts` with all 3 changes (cron guard, Resend sending, successUrl email param, WhatsApp footer)
3. Update `create-payment/index.ts` (add email to successUrl)
4. Update `Confirmacao.tsx` (pixel robustness)
5. Deploy edge functions
6. Test followup-abandoned with curl (should 401 without secret, 200 with correct secret)
7. Schedule cron job via SQL insert
8. Run acceptance tests

---

### Acceptance Tests

| # | Test | How to verify |
|---|---|---|
| 1 | Stage 0 email sends with payment link | Invoke followup-abandoned with x-cron-secret, check logs for Resend API call + message_logs row with status='sent' |
| 2 | Stale link regeneration | Candidate with old payment_link_created_at gets new EuPago link before email |
| 3 | No duplicate follow-ups | Invoke followup-abandoned twice in a row, second run shows skipped (message_logs idempotency) |
| 4 | CRM manual actions log correctly | Generate reminder in CRM, check message_logs and last_payment_link_sent_at |
| 5 | create-payment idempotency | Rapid calls with same email return existing reference (already implemented) |
| 6 | Pixel only fires with paid_at | Visit /confirmacao without payment, check no fbq call; visit with valid paid email, fbq fires |

---

### Risk Assessment

| Change | Risk | Mitigation |
|---|---|---|
| Cron secret guard | None — additive check | Falls through to 401 safely |
| Resend email sending | Low — if API key invalid, emails fail gracefully (status='failed' in message_logs) | Stage cap at 3 + do_not_contact flag prevent spam |
| Pixel DB check | Low — adds one lightweight query on page load | Graceful fallback: if query fails, pixel does not fire (safe default) |
| Email in successUrl | None — additive query param | EuPago passes it through unchanged |

