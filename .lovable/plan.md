

## Follow-up Strategy: Segmentation + Backlog Recovery + Final Push

### Current Situation (15 Feb 22:43, event 18 Feb 10:00)

- 9 unpaid candidates with plan intent, all at followup_stage 1-2
- 5 of 9 have NO `upgrade_clicked_at` (weak signal -- plan was set but no explicit upgrade click)
- 4 have `upgrade_clicked_at` (stronger signal)
- All created 13-15 Feb (1-2+ days ago) -- all qualify as "backlog" (36h+) except possibly the 15 Feb registrations
- Only stage 0 was sent (via legacy internal), stage 1 sent only for Luis Pena (test)
- Normal stage 1 fires at ~02:46 UTC Feb 16, stage 2 at ~08:46 UTC Feb 16
- No "final before event" mechanism exists

### Strategy

```text
Timeline (UTC):
Now ─────── Feb 16 02:46 ──── Feb 16 08:46 ──── Feb 17 16:00 ──── Feb 18 10:00
 |              |                  |                  |                 |
 |          Stage 1 fires      Stage 2 fires    Final email          EVENT
 |          (normal flow)      (normal flow)    (new: T-18h)
 |
 +-- Backlog check-in (immediate, new template)
```

### Phase 1 -- Segmentation Logic (Edge Function)

Add segment classification inside `followup-abandoned`:

| Segment | Criteria | Action |
|---------|----------|--------|
| A: Recent | intent < 12h ago | Normal stage flow (existing) |
| B: Warm | intent 12-36h ago | Normal stage flow (existing) |
| C: Backlog | intent 36h+ ago, has upgrade_clicked_at | 1x backlog check-in + final before event |
| D: Weak backlog | intent 36h+, NO upgrade_clicked_at | 1x gentle check-in only, no aggressive follow-up |

Constants added to edge function:
- `MODAL_LAUNCH_AT = "2026-02-15T18:00:00Z"` (approximate time modal was introduced)
- `EVENT_DATE = "2026-02-18T10:00:00Z"`
- `FINAL_EMAIL_AT = "2026-02-17T16:00:00Z"` (T-18h)

### Phase 2 -- New Templates (DB inserts)

4 new templates in `email_templates`:

1. **`followup_backlog_checkin`** -- "Ainda tens interesse?" Gentle, with opt-out line. For segments C/D.
2. **`followup_final_before_event`** -- "Ultima oportunidade antes do webinar" with real urgency (18 Fev 10:00). For ALL unpaid with plan intent.
3. **`followup_backlog_weak`** -- Softer version for segment D (no upgrade_clicked_at). Single send, confirmation-style.
4. Keep existing `followup_stage_0/1/2` unchanged for the normal flow.

All templates:
- PT-PT, short, 1 CTA with `{{payment_link}}`
- Include `{{support_whatsapp}}`
- Backlog templates include: "Se ja nao fizer sentido, e so ignorar este email."
- Final template includes event date urgency

### Phase 3 -- Scheduling Logic Changes

The edge function will be restructured to handle two parallel tracks:

**Track A: Normal stage flow (unchanged)**
- Stages 0/1/2 with delays 30min/6h/24h
- Idempotency by `(registration_id, template_key)`
- This continues working for recent/warm leads

**Track B: Backlog override (new)**
- If candidate is 36h+ since intent AND followup_stage < 3:
  - Send `followup_backlog_checkin` (once, idempotent)
  - Does NOT advance followup_stage (parallel track)
  - Logs with provider='resend' in message_logs

**Track C: Final before event (new)**
- Runs for ALL unpaid candidates with plan intent
- Sends `followup_final_before_event` once
- Only triggers when `now >= FINAL_EMAIL_AT` (17 Feb 16:00 UTC)
- Idempotent: checks message_logs for template_key='followup_final_before_event'
- Does NOT advance followup_stage

**Max emails per candidate:**
- Normal flow: up to 3 (stages 0/1/2)
- Backlog check-in: 1
- Final before event: 1
- Total max: 5 (but backlog candidates typically get 1 stage + 1 checkin + 1 final = 3)

### Phase 4 -- CRM UI Updates

**TableView (new quick filters):**
- "Backlog 36h+" chip: shows candidates with intent > 36h ago, unpaid
- "Sem follow-up Resend" chip: plan != free, paid_at null, 0 message_logs with provider='resend'

**TableView (row enhancements):**
- New column/badge: "Ultimo email" showing most recent template_key + relative time
- "Proximo" showing next_followup_at or "Final 17 Fev 16h" if applicable

**InscritoModal (new button):**
- "Enviar check-in backlog" button with confirmation dialog
- Respects do_not_contact
- Checks idempotency before sending
- Writes message_logs with provider='resend'
- Calls a new edge function endpoint or uses inline Resend call via existing infrastructure

### Phase 5 -- Verification

After implementation:
1. Manual trigger of followup-abandoned with x-cron-secret
2. Verify summary shows backlog check-ins sent
3. Query: `SELECT template_key, provider, status, count(*) FROM message_logs WHERE created_at > now() - interval '1 hour' GROUP BY 1,2,3`
4. Verify no duplicates per (registration_id, template_key)

### Technical Details

**Files changed:**

1. `supabase/functions/followup-abandoned/index.ts`
   - Add MODAL_LAUNCH_AT, EVENT_DATE, FINAL_EMAIL_AT constants
   - Add segment classification function
   - Add backlog check-in track (parallel to stage flow)
   - Add final-before-event track
   - Enhanced summary logging with segment breakdown

2. `src/components/crm/TableView.tsx`
   - Add "Backlog 36h+" and "Sem follow-up Resend" quick filter chips
   - Add "Ultimo email" and "Proximo" info per row (fetched from useInscritos)

3. `src/components/crm/InscritoModal.tsx`
   - Add "Enviar check-in backlog" button in the actions area
   - Confirmation dialog before sending
   - Calls supabase function or direct Resend via edge function

4. `src/hooks/useInscritos.ts`
   - Add `sendBacklogCheckin(id)` function that calls the edge function with a specific mode
   - Add `fetchLastEmail(id)` for TableView enrichment

5. `src/components/crm/DashboardView.tsx`
   - Add backlog segment counts to email stats section

**Database changes (inserts only, no schema changes):**
- Insert 3 new templates into `email_templates` table

**No changes to:**
- Payment logic (EuPago)
- Idempotency base
- Existing stage 0/1/2 templates
- Database schema

### Risk Mitigation

- All new sends go through existing Resend path with message_logs audit trail
- Idempotency prevents duplicates: each template_key can only be sent once per registration
- do_not_contact is respected at query level (existing filter)
- Backlog check-in uses softer copy with explicit opt-out language
- Final email only triggers after FINAL_EMAIL_AT threshold
- Test with owner email first before real backlog sends

