

## Remove Redundant Elements from /upgrade Steps 3-5

### Overview

Remove three UI elements that are creating visual noise on the upgrade page: the "Incluído na inscrição gratuita" card (steps 3-4), the "A vaga no webinar já está garantida" microcopy (steps 3-4), and the confirmation banner (step 5 only).

### Files Changed

| File | Action | Scope |
|------|--------|-------|
| `src/pages/Upsell.tsx` | Edit | Remove "Free card" block (lines 250-264); change banner condition from `step >= 3` to `step >= 3 && step <= 4` so it hides on step 5 |
| `src/components/upgrade/StepPremium.tsx` | Edit | Remove line 107: `<p>...A vaga no webinar já está garantida.</p>` |
| `src/components/upgrade/StepMasterclass.tsx` | Edit | Remove line 121: `<p>...A vaga no webinar já está garantida.</p>` |

### What Does NOT Change

- Payment logic, step navigation, sticky footer, progress bar
- Confirmation banner still shows on steps 3-4 (only removed from step 5)
- All other copy and layout unchanged

