

# Plan: SMS editability + fix double emoji + update post-webinar prices

## 1. Fix double phone emoji on SMS nodes

The SMS nodes have `📱` in both the `title` string AND `iconEmoji`. Remove `📱` from the title text for all 3 SMS nodes in `AutomationFlowTab.tsx`.

**Before:** `title: "📱 SMS pós-webinar"` + `iconEmoji: "📱"`
**After:** `title: "SMS pós-webinar"` + `iconEmoji: "📱"`

Same for "SMS lembrete Q&A" and "SMS lembrete Masterclass".

## 2. Make SMS text editable before sending

In `AutomationFlowTab.tsx`, add inline editing to SMS nodes:
- When clicking "Enviar SMS agora", show a textarea pre-filled with the `smsText` from the config
- User can edit the text before confirming the send
- Add a small "Editar" state with a confirm/cancel flow
- Use local state per SMS node to track the edited text and whether the editor is open

Implementation: Add state `editingSmsKey` and `editedSmsText` to the `Timeline` component. When "Enviar SMS agora" is clicked, instead of immediately calling `handleBulkSms`, open an inline editor. On confirm, send with the edited text.

## 3. Update post-webinar email prices (€15 -> €27 after today)

The following edge functions have fallback HTML with hardcoded "€15+IVA":
- `send-video-postwebinar-day1/index.ts` (sends March 6) -- change to €27+IVA
- `send-video-postwebinar-day3/index.ts` (sends March 8) -- change to €27+IVA
- `send-video-postwebinar-closing/index.ts` (sends March 10) -- change to €27+IVA

In each fallback HTML and CTA buttons, replace:
- `€15+IVA` with `€27+IVA`
- `Premium Pass — €15+IVA` with `Premium Pass — €27+IVA`

Note: `send-video-postwebinar/index.ts` (day 0, today March 5) keeps €15+IVA since it's still valid today.

Also update the CTA link text in each function accordingly.

### Files to edit
- `src/components/crm/AutomationFlowTab.tsx` -- fix emoji + add SMS text editing
- `supabase/functions/send-video-postwebinar-day1/index.ts` -- €15 -> €27
- `supabase/functions/send-video-postwebinar-day3/index.ts` -- €15 -> €27
- `supabase/functions/send-video-postwebinar-closing/index.ts` -- €15 -> €27

