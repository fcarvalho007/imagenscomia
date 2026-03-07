

# Fix: Faturação Page — Invisible Text

## Root Cause

The FaturacaoView uses white text (`rgba(255,255,255,...)`) designed for a dark background, but **has no background set**. It inherits the body's white `bg-background`, making all text invisible (white on white).

Other CRM views handle this correctly:
- Dashboard/Pipeline: `bg-off-white` + dark text
- Comunicação: `style={{ background: "#0f172a" }}` + white text
- **Faturação: NO background + white text = invisible**

## Fix (1 file, 1 line)

### `src/components/crm/FaturacaoView.tsx`

Change the outer `<div>` from:
```tsx
<div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8">
```
To:
```tsx
<div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-8 min-h-screen" style={{ background: "#0F172A" }}>
```

This adds:
- `min-h-screen` to fill the viewport
- Dark background matching the sidebar and ComunicacaoView

All text, KPIs, charts, tables, and buttons will become visible immediately. No other changes needed.

