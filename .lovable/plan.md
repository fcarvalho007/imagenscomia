

# Update 3 email templates

Run 3 UPDATE statements against `email_templates` to fix content/layout issues. No code or edge function changes.

## Updates

| Template Key | What changes |
|---|---|
| `video_followup_prewebinar` | New subject + full HTML replacement (fix wrong date, wrong benefits, layout) |
| `video_postwebinar_day1` | Full HTML replacement (change from "join today" reminder to post-webinar sales email) |
| `video_postwebinar_closing` | Replace header background `#1e293b` with purple gradient to match other templates |

## Steps

1. UPDATE `video_followup_prewebinar` — set `subject` and `html_body` using the exact HTML provided
2. UPDATE `video_postwebinar_day1` — set `subject` and `html_body` using the exact HTML provided
3. UPDATE `video_postwebinar_closing` — use `REPLACE()` to swap header background color only
4. Verify all 3 templates have correct layout and char count > 1500

## Scope

- Only the `email_templates` table is touched
- Only active versions of these 3 template keys are updated
- No edge functions, pages, or other templates modified

