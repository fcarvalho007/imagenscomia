

# Fix register-free + Backfill missing video_confirmation emails

## Overview

Two changes: fix the root cause in the register-free edge function, then create a one-time backfill system to send the 18 missing confirmation emails.

---

## 1. Fix register-free edge function

In `supabase/functions/register-free/index.ts`, after the video registration is successfully created for an existing user (line 124), add the same `send-video-confirmation` call that new users get (lines 246-258).

The call will go inside the `if (!existingVideo)` block, right after the successful insert (after line 124), using `existing.first_name` as the fname parameter.

---

## 2. Create backfill edge function

New file: `supabase/functions/backfill-video-confirmations/index.ts`

Logic:
- Uses `SUPABASE_SERVICE_ROLE_KEY` for DB access
- Queries all `registrations` where `webinar = 'video'`
- For each, checks `email_send_logs` for an existing row with `email_key = 'confirmation'` and `webinar = 'video'` for that email
- If no log exists, calls `send-video-confirmation` for that person
- Tracks sent/failed/skipped counts
- Returns `{ sent, failed, skipped }` summary

Add `verify_jwt = false` to `supabase/config.toml` for this function.

---

## 3. Add backfill button to CRM Automacoes

In `src/components/crm/FollowUpView.tsx`, add a state variable `backfillDone` and a button in the header area (next to the WebinarSwitcherBar) that:

- Only shows when `webinarContext === 'video'` and `!backfillDone`
- Styled as secondary/outline, small, with a warning icon
- On click: shows `window.confirm()` dialog with the message about sending to missing people
- On confirm: calls `supabase.functions.invoke('backfill-video-confirmations')`
- On success: shows toast with sent/failed counts, sets `backfillDone = true`
- When done: button text changes to "Backfill concluido" and is disabled

---

## Files changed

| File | Change |
|---|---|
| `supabase/functions/register-free/index.ts` | Add send-video-confirmation call in existing-user video branch |
| `supabase/functions/backfill-video-confirmations/index.ts` | New edge function |
| `supabase/config.toml` | Add verify_jwt config for new function |
| `src/components/crm/FollowUpView.tsx` | Add backfill button in header |

