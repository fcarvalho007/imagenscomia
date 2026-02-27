
# Fix double-prefix bug in AutomationFlowTab "Ver email" buttons

## Problem

In `AutomationFlowTab.tsx` line 646, the "Ver email" button constructs the template key like this:

```
const tplKey = `${webinar}_${emailKey}`;
```

When `webinar = "video"` and the node's `templateKeyMatch[0]` already contains `video_` (e.g. `"video_followup_prewebinar"`), the result is `"video_video_followup_prewebinar"` -- a double prefix that doesn't match any template in the database.

**Affected nodes (6 of 11):**
- video_followup_prewebinar
- video_payment_premium
- video_payment_masterclass
- video_postwebinar_day1
- video_postwebinar_day3
- video_postwebinar_closing

**Working nodes (5 of 11):** confirmation, reminder-48h, reminder-24h, reminder-1h, postwebinar (these use short keys like `"confirmation"` that get correctly prefixed).

## Fix

**File:** `src/components/crm/AutomationFlowTab.tsx`, line 646

**Change:** Before prepending the webinar prefix, check if the key already starts with `${webinar}_`. If it does, use it as-is.

```typescript
// Before (broken):
const tplKey = `${webinar}_${emailKey.replace("stage_0", "confirmation")}`;

// After (fixed):
const cleaned = emailKey.replace("stage_0", "confirmation");
const tplKey = cleaned.startsWith(`${webinar}_`) ? cleaned : `${webinar}_${cleaned}`;
```

This is a 1-line logic change in a single file. No other files are touched.
