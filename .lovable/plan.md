

# Fix E-goi senderId — Using Sender ID from Screenshots

## Discovery

From the API documentation for `POST /v2/email/messages/action/send/single`:
- `senderId` (required, string): "The code identification of the sender profile to be used." Example: `"1234"`

From the user's screenshots (Remetentes de email):
- **ID 2**: "Frederico Carvalho | eNews DIGITALFC" — frederico.carvalho@digitalfc.pt — CONFIRMADO
- **ID 3**: "Frederico Carvalho - DIGITAL FC | Aulas Google Marketing" — frederico.carvalho@digitalfc.pt — CONFIRMADO

The hash `f345a6c8e09b43ee3ceb18a4519fc9b4` appears to be the **user profile hash** (from the first screenshot — user ID 925825), NOT a sender ID. The Slingshot API expects the **numeric sender ID as a string** (e.g., `"2"`), not the user hash.

**Timeline of the bug:**
1. Original code had `senderId: "2"` — but `send-email` was missing from config.toml → 404 → never tested
2. Config.toml was fixed, but senderId was simultaneously changed to the hash → `INVALID_SENDER`
3. The numeric ID `"2"` was **never tested with a working deployment**

## Plan

### 1. Update `send-email/index.ts` — revert to sender ID "2"

Change the sender identification back to the numeric ID from the E-goi senders list:

```typescript
// CURRENT (broken)
const EGOI_SENDER_HASH = "f345a6c8e09b43ee3ceb18a4519fc9b4";
// ...
senderId: EGOI_SENDER_HASH,

// FIX
const EGOI_SENDER_ID = "2";
// ...
senderId: EGOI_SENDER_ID,
```

Sender ID 2 ("eNews DIGITALFC") is the most appropriate — it's the generic newsletter sender for frederico.carvalho@digitalfc.pt with status CONFIRMADO.

### 2. Deploy and test

Deploy the updated `send-email` function, then invoke `test-send-email` to send a test to fredericodigital@gmail.com. If ID "2" fails, try ID "3" as fallback.

### 3. If test succeeds, resend the 166 failed emails

Invoke `resend-failed-emails` for each failed template to recover the backlog.

## File changes

| File | Change |
|---|---|
| `supabase/functions/send-email/index.ts` | Change `EGOI_SENDER_HASH` to `EGOI_SENDER_ID = "2"` |

