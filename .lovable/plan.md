

# Responsive fixes + remove text on /comprar

Only `src/pages/Comprar.tsx` is modified. No logic, icons, colors, or payment flow changes.

---

## 1. Remove two lines of text from the header

Delete the two `<p>` elements (lines 245-250):
- "Acesso garantido em segundos apos confirmacao de pagamento"
- "Junta-te as 127 pessoas ja inscritas"

---

## 2. FIX 1 -- Tablet card width (768px-1024px)

Change the cards container (line 267) from:
```
flex flex-col md:flex-row gap-8
```
to:
```
flex flex-col md:flex-row gap-6 md:gap-4 lg:gap-8
```

Change PlanCard body padding (line 129) from `p-8` to `p-6 md:p-5 lg:p-8` so cards breathe better at tablet widths.

---

## 3. FIX 2 -- "Ultimos lugares disponiveis" badge

Add `whitespace-nowrap` to the urgency badge (line 148):
```
className="inline-block self-start text-xs font-semibold text-white bg-rose-500 rounded-full px-2 py-1 whitespace-nowrap"
```

---

## 4. FIX 3 -- Header early bird badge on mobile

Replace the single `<span>` (lines 241-243) with two spans:
- `<span className="sm:hidden">🔥 Early bird — sobe a 5 de Marco</span>`
- `<span className="hidden sm:inline">🔥 Preco early bird — sobe depois do webinar de 5 de Marco</span>`

Both inside the same parent element. Desktop copy unchanged.

---

## 5. FIX 4 -- Mobile scroll hint dots

After the cards `<div>` (after line 280), add a mobile-only section:

```html
<div className="flex sm:hidden flex-col items-center mt-6">
  <div className="flex gap-1.5">
    <div className="w-2 h-2 rounded-full bg-violet-500" />
    <div className="w-2 h-2 rounded-full bg-white/20" />
    <div className="w-2 h-2 rounded-full bg-white/20" />
  </div>
  <p className="text-white/40 text-xs text-center mt-2">Desliza para ver todos os planos</p>
</div>
```

Static, decorative only, no JS.

---

## Summary

| Change | Location (line) |
|---|---|
| Remove 2 text paragraphs | Lines 245-250 |
| Tablet gap + card padding | Lines 129, 267 |
| Urgency badge whitespace-nowrap | Line 148 |
| Early bird responsive text | Lines 241-243 |
| Mobile scroll hint dots | After line 280 |

Single file: `src/pages/Comprar.tsx`

