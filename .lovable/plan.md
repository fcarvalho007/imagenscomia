

# Fix: SMS counters showing 0 despite 206 logs in database

## Root Cause

The backfill worked — there are **200 sent + 6 failed** entries for `sms_followup_day1` in the database. The problem is that `FollowUpView.tsx` loads message_logs with `.limit(500)`, but there are **3,010 total logs**. The SMS entries (created today) are mixed in with 3,000+ other logs, and many get cut off by the 500 limit.

## Fix

**File: `src/components/crm/FollowUpView.tsx`** (line 87)

Increase the limit from 500 to 5000 (or remove it) so all logs are loaded, including the SMS backfill entries:

```typescript
.limit(5000);
```

This single change will make the SMS node counters show the correct "200 enviados / 6 falhas" and also populate the client activity timelines for SMS.

## Files Changed
- **Edit**: `src/components/crm/FollowUpView.tsx` — increase `.limit(500)` to `.limit(5000)`

