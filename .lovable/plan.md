

# Fix eyebrow and subtitle colors in video_postwebinar_closing

## What's wrong

The header has two elements using `#94a3b8` (slate gray) instead of the design system colors:
- **Eyebrow** ("Webinar Video com IA"): should be `#a5b4fc`
- **Subtitle** ("O acesso fecha hoje."): should be `#c7d2fe`

## Fix

Run a single UPDATE with two nested REPLACE calls, using surrounding CSS properties as unique anchors to target each occurrence precisely:

```sql
UPDATE email_templates
SET html_body = REPLACE(
  REPLACE(html_body,
    'font-size:12px;color:#94a3b8;letter-spacing',
    'font-size:12px;color:#a5b4fc;letter-spacing'),
  'font-size:15px;color:#94a3b8;',
  'font-size:15px;color:#c7d2fe;'),
    updated_at = now()
WHERE template_key = 'video_postwebinar_closing';
```

## Verification

```sql
SELECT template_key,
  CASE WHEN html_body LIKE '%94a3b8%'
       THEN 'still has wrong color'
       ELSE 'fixed'
  END as color_check
FROM email_templates
WHERE template_key = 'video_postwebinar_closing';
```

Expected: `fixed`

## Scope

- Only `video_postwebinar_closing` html_body is touched
- No copy, subject, links, or CTA changes
- No other templates or edge functions modified
