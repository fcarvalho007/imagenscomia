

# Fix 2 critical pre-webinar cron issues

## FIX 1 — Create missing cron for send-video-postwebinar

The edge function exists and is deployed but has no cron trigger. Create a pg_cron job:

- **Job name:** `send-video-postwebinar`
- **Schedule:** `30 12 5 3 *` (5 March 2026, 12:30 UTC = 12h30 Portugal)
- **Pattern:** Match the day1/day3/closing crons — use `jsonb_build_object` with `current_setting('app.settings.cron_secret', true)` for the `x-cron-secret` header
- **URL:** `https://gwphpsehcnhwjiypyolg.supabase.co/functions/v1/send-video-postwebinar`

## FIX 2 — Set app.settings.cron_secret in Postgres

`current_setting('app.settings.cron_secret', true)` currently returns NULL. This means 3 existing crons (day1, day3, closing) and the new one above will all send empty auth headers and get 401 errors.

**Action:** Run `ALTER DATABASE postgres SET app.settings.cron_secret = '<value>';` using the same secret value already hardcoded in the `send-video-followup-prewebinar-daily` cron command. This makes all crons that use `current_setting()` work correctly.

Note: The secret value will not be exposed in any response — it is already present in the existing cron job command in the database.

## Verification

After both fixes:
1. Query `cron.job` — confirm `send-video-postwebinar` appears with schedule `30 12 5 3 *`
2. Query `current_setting('app.settings.cron_secret', true)` — confirm it returns a non-null value

## Scope

- 1 new pg_cron job created via SQL insert
- 1 Postgres database setting configured
- No edge functions, templates, code, or pages modified

