
# Fix 4 Gaps in FollowUpPessoasVideo.tsx

Single file change: `src/components/crm/FollowUpPessoasVideo.tsx`

---

## GAP 1 — Max 8 dots with "+N" overflow pill

In the desktop table (lines 236-269) and mobile cards (lines 356-370):
- Slice logs to first 8: `const visibleDots = logs.slice(0, 8)`
- Calculate overflow: `const overflowCount = logs.length - 8`
- Render only `visibleDots` instead of all `logs`
- After the dots, if `overflowCount > 0`, append:
```tsx
<span style={{ background: "#f3f4f6", color: "#6b7280", fontSize: 10, fontWeight: 500, borderRadius: 20, padding: "1px 6px", marginLeft: 4 }}>
  +{overflowCount}
</span>
```

---

## GAP 2 — Hardcoded schedule dates + new getNextScheduled

Replace lines 60-82 (the `VIDEO_EMAIL_SEQUENCE` array and current `getNextScheduled` function) with:

**New constants** (before component):
```typescript
const WEBINAR_DATE = new Date("2026-03-05T10:00:00Z");
const POSTWEBINAR_DAY1 = new Date("2026-03-05T13:00:00Z");
const POSTWEBINAR_DAY3 = new Date("2026-03-08T10:00:00Z");
const CLOSING_DATE = new Date("2026-03-10T10:00:00Z");

const MONTHS_PT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
function fmtDatePt(d: Date): string {
  return `${d.getDate()} ${MONTHS_PT[d.getMonth()]} · ${String(d.getHours()).padStart(2,"0")}h${String(d.getMinutes()).padStart(2,"0")}`;
}

function subHours(date: Date, hours: number): Date {
  return new Date(date.getTime() - hours * 3600000);
}
```

**New return type and function:**
```typescript
interface NextScheduledResult {
  label: string;
  date: Date | null;
  isLost?: boolean;
  isComplete?: boolean;
}

function getNextScheduled(sentKeys: Set<string>, lostAt: string | null): NextScheduledResult {
  if (lostAt) return { label: "Fecho enviado", date: null, isLost: true };
  const now = new Date();
  if (!sentKeys.has("video_confirmation"))
    return { label: "Confirmacao imediata", date: null };
  if (!sentKeys.has("video_reminder_48h") && now < WEBINAR_DATE)
    return { label: "Lembrete 48h", date: subHours(WEBINAR_DATE, 48) };
  if (!sentKeys.has("video_reminder_24h") && now < WEBINAR_DATE)
    return { label: "Lembrete 24h", date: subHours(WEBINAR_DATE, 24) };
  if (!sentKeys.has("video_reminder_1h") && now < WEBINAR_DATE)
    return { label: "Lembrete 1h", date: subHours(WEBINAR_DATE, 1) };
  if (!sentKeys.has("video_postwebinar_day1") && now < POSTWEBINAR_DAY1)
    return { label: "Email pos-webinar Dia 1", date: POSTWEBINAR_DAY1 };
  if (!sentKeys.has("video_postwebinar_day3") && now < POSTWEBINAR_DAY3)
    return { label: "Email pos-webinar Dia 3", date: POSTWEBINAR_DAY3 };
  if (!sentKeys.has("video_postwebinar_closing") && now < CLOSING_DATE)
    return { label: "Email de fecho", date: CLOSING_DATE };
  return { label: "Ciclo completo", date: null, isComplete: true };
}
```

**Update all call sites** to use the new object return type:
- Desktop table (line 209): `const next = getNextScheduled(...)` then use `next.label`, `next.isLost`, `next.isComplete`, `next.date`
- Mobile cards (line 332): same pattern
- "Proximo Agendado" column: show `next.label` + `fmtDatePt(next.date)` below when date exists
- Style: `isLost` = red, `isComplete` = grey italic

---

## GAP 3 — "Ultimo Envio" only counts status='sent'

In both desktop (line 207) and mobile (line 333), replace:
```typescript
const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
```
with:
```typescript
const sentLogs = logs.filter(l => l.status === "sent" && l.sent_at);
const lastSent = sentLogs.length > 0
  ? sentLogs.sort((a, b) => new Date(b.sent_at!).getTime() - new Date(a.sent_at!).getTime())[0]
  : null;
```

Then use `lastSent` instead of `lastLog` in the "Ultimo Envio" column. When `lastSent` is null, show `"--"` in grey (not "Nenhum email enviado").

---

## GAP 4 — Hide "Proximo Agendado" on mobile

Add `className="hidden md:table-cell"` to:
- The `<th>` for "Proximo Agendado" (line 199)
- The `<td>` for "Proximo Agendado" (line 286)

The mobile cards section (lines 327-394) already does NOT show this column, so no change needed there.

---

## Summary of edits

All changes in a single file: `src/components/crm/FollowUpPessoasVideo.tsx`

| Section | Lines | Change |
|---|---|---|
| Constants + getNextScheduled | 60-82 | Replace with date constants, helper functions, and new logic returning `NextScheduledResult` |
| Desktop row variables | 205-209 | Add `lastSent`, `visibleDots`, `overflowCount`; use new `next` object |
| Desktop dots column | 236-269 | Render `visibleDots` + overflow pill |
| Desktop "Ultimo Envio" | 273-283 | Use `lastSent` instead of `lastLog` |
| Desktop "Proximo Agendado" th | 199 | Add `hidden md:table-cell` |
| Desktop "Proximo Agendado" td | 286-297 | Add `hidden md:table-cell`, use `next.label`/`next.date`/`next.isLost`/`next.isComplete` |
| Mobile card variables | 329-333 | Add `lastSent`, `mobileDots`, `mobileOverflow`; use `next` object |
| Mobile dots | 356-370 | Render `mobileDots` + overflow pill |
| Mobile "Ultimo" | 373-376 | Use `lastSent` |
| Mobile next label | 352-354 | Use `next.isLost` |

No other files are touched.
