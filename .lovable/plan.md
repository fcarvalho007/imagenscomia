

# Fix Faturação Page — Responsive Redesign

## Problems Identified (from screenshot)

1. **Tables overflow on mobile** — InvoiceTable (7 cols), PlanBreakdown (6 cols), CostsSection (6 cols) all render as full `<table>` with no horizontal scroll or mobile card layout
2. **KPI hero cards** — `text-4xl`/`text-5xl` values overflow on narrow screens; ROAS uses `text-6xl`
3. **Header buttons** stack poorly on mobile
4. **Charts** — Pie chart labels overflow; donut labels clip on small viewports
5. **PlanBreakdown** uses static price × count instead of actual `paid_amount`, causing mismatch with real revenue

## Plan

### 1. FaturacaoKPIs.tsx — Responsive text sizing
- Reduce hero card value font from `text-4xl md:text-5xl` to `text-2xl sm:text-4xl md:text-5xl`
- ROAS from `text-5xl md:text-6xl` to `text-3xl sm:text-5xl md:text-6xl`
- Secondary row: keep `grid-cols-2 md:grid-cols-4` (already works)

### 2. FaturacaoCharts.tsx — Mobile-friendly charts
- Reduce chart heights from 280px to 200px on mobile via responsive check
- Hide pie chart labels on mobile (they clip), rely on tooltip
- Reduce outerRadius on small screens

### 3. PlanBreakdown.tsx — Fix revenue calculation + responsive table
- **Data fix**: Use actual `paid_amount` sum instead of `count × static price` for the "Total" column — this is the source of the €3031.68 mismatch
- Wrap tables in `overflow-x-auto` div
- On mobile, hide the progress bar column and reduce padding

### 4. CostsSection.tsx — Responsive table
- Wrap table in `overflow-x-auto`
- Hide "Descrição" column on mobile
- Stack action buttons vertically on mobile

### 5. InvoiceTable.tsx — Responsive table
- Wrap table in `overflow-x-auto` with `-webkit-overflow-scrolling: touch`
- Hide "Email" column on mobile (`hidden md:table-cell`)
- Stack header buttons vertically on small screens

### 6. PLSummary.tsx — Remove max-width constraint
- Change `max-w-lg` to `max-w-full md:max-w-lg` so it fills mobile width

### 7. FaturacaoView.tsx — Header responsive
- Stack title and buttons vertically on mobile: `flex-col sm:flex-row`

## Key Data Fix (PlanBreakdown)

The `total` field currently computes `paid * staticPrice` which doesn't match actual `paid_amount` values (old prices, group discounts). Will change to sum actual `valor` from paid inscritos per plan, which already reflects the correct `paid_amount`.

