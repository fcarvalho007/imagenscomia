

# Unify visual style across ALL video email templates

Apply the navy-indigo design system to every `video_*` template. No copy, subject, CTA, or edge function changes.

## Template categories

### Group A — Purple gradient swap only (5 templates)
These already have proper table-based layout with gradient header. Only the gradient color changes.

| Template | Current gradient | Action |
|---|---|---|
| `video_confirmation_returning` | `#7c3aed,#6d28d9` | Replace with navy-indigo gradient |
| `video_followup_prewebinar` | `#7c3aed,#6d28d9` | Replace with navy-indigo gradient |
| `video_postwebinar_day1` | `#7c3aed,#6d28d9` | Replace with navy-indigo gradient |
| `video_postwebinar_day3` | `#7c3aed,#6d28d9` | Replace with navy-indigo gradient |
| `video_postwebinar_closing` | `#7c3aed,#6d28d9` | Replace with navy-indigo gradient |

Also replace accent colors: `#7c3aed` links/buttons become `#4338ca`, and `#c4b5fd`/`#ddd6fe` become `#a5b4fc`/`#c7d2fe` where used in headers.

### Group B — Dark slate gradient swap (3 templates)
These have `#1e293b` headers with minimal HTML. Replace header background with navy-indigo gradient.

| Template | Action |
|---|---|
| `video_group_confirmation_payer` | Replace `background:#1e293b` with navy-indigo gradient |
| `video_payment_masterclass` | Replace `background:#1e293b` with navy-indigo gradient |
| `video_payment_premium` | Replace `background:#1e293b` with navy-indigo gradient |

### Group C — Full redesign (5 templates)
These have plain white `div`-based layout with no gradient. Wrap existing copy in the design-system table structure (header + body + footer), preserving all text/links/CTAs exactly.

| Template | Action |
|---|---|
| `video_confirmation` | Full redesign + fix duration "45-60 min" to "3 horas" + remove `{{payment_link}}`/`{{email}}` refs + new header title |
| `video_postwebinar` | Wrap in design system layout |
| `video_reminder_1h` | Wrap in design system layout |
| `video_reminder_24h` | Wrap in design system layout |
| `video_reminder_48h` | Wrap in design system layout |

## Steps

1. **Group A** — Run 5 UPDATE statements using `REPLACE()` to swap gradient colors and accent colors
2. **Group B** — Run 3 UPDATE statements using `REPLACE()` to swap `#1e293b` to the navy-indigo gradient
3. **Group C** — Run 5 UPDATE statements setting new `html_body` that wraps existing email copy in the design-system table structure
4. **video_confirmation specific fixes** — Update subject, remove `{{payment_link}}` and `{{email}}` variables, fix duration
5. **Verify** — Query all `video_*` templates to confirm all show navy-indigo gradient

## Design system applied

```text
Header:  linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)
         Eyebrow: #a5b4fc | Title: #ffffff | Subtitle: #c7d2fe
Body:    #ffffff, text #374151, muted #6b7280
Info:    bg #f0f4ff
Alert:   bg #fef2f2 / border #fecaca (urgency)
         bg #fefce8 / border #fde68a (tips)  
CTA:     bg #4338ca, color #fff
Footer:  bg #f9fafb, text #9ca3af, links #4338ca
```

## Scope

- Only `email_templates` table rows are modified (html_body, and subject/variables for video_confirmation only)
- No edge functions touched
- No code files changed
- All email copy, CTAs, and links preserved exactly (except video_confirmation duration fix)
- 13 templates total updated
