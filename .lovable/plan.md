
# Populate 3 NULL email templates

Create a temporary edge function `populate-templates` that updates the `html_body` of the 3 templates using the exact HTML provided. Deploy it, call it once, verify the results, then delete it.

## Steps

1. Create `supabase/functions/populate-templates/index.ts` -- a one-shot edge function that uses `SUPABASE_SERVICE_ROLE_KEY` to UPDATE `email_templates` SET `html_body` for the 3 active templates:
   - `video_postwebinar_day1` (id: `f3b0da12-fa3f-43a3-8365-e748a52f86a0`)
   - `video_postwebinar_day3` (id: `d5dcf801-ae60-495f-964b-148f66fe8056`)
   - `video_postwebinar_closing` (id: `a70f9fec-cbd0-4757-aaba-9e88d05aa234`)

2. Deploy and invoke the function via curl

3. Verify all 3 rows have `html_body` length > 1500 chars

4. Delete the temporary edge function

## What is NOT changed
- No edge functions modified
- No other templates touched
- No code changes to the frontend
- The HTML content is exactly as provided by the user (copy-pasted, not generated)
