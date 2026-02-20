

# Multi-Webinar CRM Extension

## Summary

Extend the CRM to support multiple webinars (Imagens IA + Video IA) via a new `webinar` column in the `registrations` table and a context switcher in the CRM UI. All existing features remain unchanged -- this is purely additive.

---

## Step 1 -- Database Schema

Add column `webinar` (text, default `'imagens'`, NOT NULL) to `registrations` table via migration:

```sql
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS webinar text NOT NULL DEFAULT 'imagens';
-- Backfill existing rows (already 'imagens' via default, but explicit for safety)
UPDATE registrations SET webinar = 'imagens' WHERE webinar IS NULL;
```

No `price_paid` column for now -- the existing `valor` field in the CRM mapping already tracks value, and actual payment amounts can be derived from the plan + paid_at timestamp vs early bird dates. This avoids unnecessary schema changes.

## Step 2 -- Edge Function: register-free

Update `supabase/functions/register-free/index.ts` to:
- Accept `webinar` field from request body (default: `'imagens'`)
- Pass it into the INSERT call: `webinar: webinar || 'imagens'`

## Step 3 -- Video Page Registration

Update `src/components/webinar/PurchaseModal.tsx` to pass `webinar: 'video'` in the `register-free` invocation (line 54-60). This ensures all Video landing page registrations are tagged correctly.

## Step 4 -- Webinar Config Constants

Create `src/config/webinarConfig.ts`:

```typescript
export type WebinarKey = "imagens" | "video";
export type WebinarContext = WebinarKey | "consolidado";

export const WEBINAR_CONFIG = {
  imagens: {
    label: "Imagens IA",
    emoji: "\uD83D\uDCF7",
    date: "18 Fev 2026",
    startDate: new Date("2026-02-18T10:00:00Z"),
    color: "#1e40af",
    sidebarSubtitle: "Imagens IA . 18 Fev 2026",
  },
  video: {
    label: "Video IA",
    emoji: "\uD83C\uDFAC",
    date: "2 Mar 2026",
    startDate: new Date("2026-03-02T10:00:00Z"),
    color: "#16a34a",
    sidebarSubtitle: "Video IA . 2 Mar 2026",
  },
} as const;

export function filterByWebinar<T extends { webinar?: string }>(
  items: T[],
  context: WebinarContext
): T[] {
  if (context === "consolidado") return items;
  if (context === "video") return items.filter(i => i.webinar === "video");
  return items.filter(i => !i.webinar || i.webinar === "imagens");
}
```

## Step 5 -- Data Model Update

Update `src/pages/crm/mockData.ts` Inscrito type: add `webinar: "imagens" | "video"` field.

Update `src/hooks/useInscritos.ts` `mapRegistration` function: map `r.webinar` to Inscrito (default `"imagens"`).

## Step 6 -- CRM Context Switcher

### React Context

Create `src/contexts/WebinarContext.tsx` with `WebinarContext` / `WebinarProvider` wrapping the CRM. Stores `webinarContext` state (default: `"imagens"`).

### CRM Root (`src/pages/CRM.tsx`)

- Wrap content with `WebinarProvider`
- Remove prop-drilling of webinar context -- child components use `useWebinarContext()` hook

### Sidebar (`src/components/crm/CRMSidebar.tsx`)

- Accept/consume webinar context
- Update subtitle text dynamically based on selected webinar
- Add context switcher bar at top: 3 buttons (Imagens / Video / Consolidado) with active color states

### Context Switcher UI

Placed inside the sidebar, below the logo area:
- 3 compact buttons in a row
- Active: colored background (blue/green/purple), white text
- Inactive: subtle text, hover highlight
- Height ~40px, compact layout

## Step 7 -- View Filtering

All views (Dashboard, Pipeline, Tabela, Follow-up, Trash) will consume `useWebinarContext()` and apply `filterByWebinar()` to their data before processing.

### DashboardView
- Filter `inscritos` by webinar context before all calculations
- For "consolidado": add sub-labels on KPIs showing split ("X imagens + Y video")
- For "consolidado": add dual-bar funnel (blue = imagens, green = video) with legend
- Add "Comparacao entre Webinars" section (2-column card) visible only in consolidado
- Empty state for video when no data exists

### PipelineView
- Filter cards by webinar context
- For "consolidado": add small badge (IMG/VID) on each card with color coding
- Column headers show split count in consolidado mode

### TableView
- Filter rows by webinar context
- For "consolidado": add "Webinar" column with badge (IMG/VID), sortable

### FollowUpView
- Filter SLA data by webinar context
- For "video" with no subscribers: show empty state with calendar icon and date
- For "consolidado": merge both, add webinar badge to items

### TrashView
- Filter by webinar context
- For "consolidado": show all with webinar badge

## Step 8 -- Early Bird Tracking Widget

Add to DashboardView (all contexts):
- Small card "Early Bird vs Preco Regular"
- Shows count of purchases at each price point by comparing `valor` field against thresholds
- Premium: X at 15 EUR | Y at 27 EUR
- Masterclass: X at 47 EUR | Y at 97 EUR

---

## Files to Create
- `src/config/webinarConfig.ts` -- constants, types, filter utility
- `src/contexts/WebinarContext.tsx` -- React context provider

## Files to Modify
- `supabase/functions/register-free/index.ts` -- accept `webinar` param
- `src/components/webinar/PurchaseModal.tsx` -- pass `webinar: 'video'`
- `src/pages/crm/mockData.ts` -- add `webinar` to Inscrito type
- `src/hooks/useInscritos.ts` -- map webinar field
- `src/pages/CRM.tsx` -- wrap with WebinarProvider
- `src/components/crm/CRMSidebar.tsx` -- context switcher + dynamic subtitle
- `src/components/crm/DashboardView.tsx` -- webinar filtering, consolidado widgets
- `src/components/crm/PipelineView.tsx` -- webinar filtering, badges
- `src/components/crm/TableView.tsx` -- webinar column, filtering
- `src/components/crm/FollowUpView.tsx` -- webinar filtering, empty state
- `src/components/crm/TrashView.tsx` -- webinar filtering, badges

## Database Migration
- `ALTER TABLE registrations ADD COLUMN webinar text NOT NULL DEFAULT 'imagens'`

## Implementation Order
1. DB migration (schema)
2. Config + Context files (new)
3. Edge function + PurchaseModal (registration tagging)
4. useInscritos + mockData type (data layer)
5. CRM.tsx + Sidebar (switcher UI)
6. Each view (Dashboard, Pipeline, Table, FollowUp, Trash) -- can be done in parallel

