

# Three fixes: WhatsApp button, OPCIONAL badge, duplicate step label

## 1. Add WhatsApp button to /comprar

**File: `src/pages/Comprar.tsx`**

Import `WhatsAppSupportButton` and add `<WhatsAppSupportButton />` before the closing `</div>` of the root element (after `<PurchaseModal>`).

---

## 2. Add "OPCIONAL" badge to Step 3 (StepMasterclass)

**File: `src/components/upgrade/StepMasterclass.tsx`**

After the headline ("Vais gostar desta opção") and its subtitle, add the same OPCIONAL badge that Step 4 already has:

```html
<span style="font-size:10px; font-weight:600; color:#9ca3af; border:1px solid #e5e7eb; border-radius:6px; padding:2px 8px; background:white; display:inline-block; margin-top:8px;">
  OPCIONAL
</span>
```

Insert it between the subtitle `<p>` and the spacer `<div style={{ height: 28 }} />`.

---

## 3. Remove duplicate step label from card center (Steps 3 and 4)

Currently both steps show "Passo X de 5 -- Label" inside the card AND in the progress bar area at the top. The fix removes the in-card step label and improves the visual hierarchy of the center content.

**File: `src/components/upgrade/StepMasterclass.tsx`** (line 27)

Remove:
```
<p style={{ fontSize: 12, color: "#9ca3af" }}>Passo 3 de 5 — Masterclass Vídeo</p>
<div style={{ height: 20 }} />
```

**File: `src/components/upgrade/StepVideoPremium.tsx`** (lines 28-40)

Remove the entire step label block:
```
<p style={{ fontSize: 12, color: "#9ca3af" }}>
  Passo 4 de 5 — Gravação Vídeo
  {masterclassSelected && (...)}
</p>
<div style={{ height: 20 }} />
```

Move the masterclass-selected pill (green "Masterclass" badge) to sit next to the OPCIONAL badge instead, so the context is preserved without duplicating the step indicator.

**Visual improvement for the center area:**

For both steps, the card center will now flow as:
1. Headline (bold, 28px) -- already exists
2. OPCIONAL badge -- clean inline pill
3. If masterclass selected (step 4 only): green "Masterclass" pill next to OPCIONAL
4. Subtitle text (15px, grey)
5. Spacer -> pricing card

This creates a cleaner visual hierarchy without the redundant "Passo X de 5" text that already appears in the progress bar.

---

## Summary

| File | Change |
|---|---|
| `src/pages/Comprar.tsx` | Add WhatsAppSupportButton |
| `src/components/upgrade/StepMasterclass.tsx` | Remove duplicate step label, add OPCIONAL badge |
| `src/components/upgrade/StepVideoPremium.tsx` | Remove duplicate step label, keep masterclass pill near OPCIONAL |

