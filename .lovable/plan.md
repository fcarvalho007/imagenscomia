
# Premium Animations for /video

## Summary

Add premium visual effects and animations to the existing /video page without changing any copy, layout, or content. Create 3 new reusable components and enhance Video.tsx with Framer Motion animations and CSS effects.

---

## New Files to Create

### 1. `src/components/ui/aurora-background.tsx`

Reusable aurora gradient background with 3 animated blobs:
- Blob 1: deep green #16a34a at 15% opacity, 20s float loop
- Blob 2: electric blue #1d4ed8 at 10% opacity, 25s float loop
- Blob 3: violet #7c3aed at 8% opacity, 30s float loop
- Base background: #050709
- Noise grain overlay via CSS SVG filter (feTurbulence, 3% opacity)
- All blobs use CSS keyframes with scale pulse and position drift
- Respects `prefers-reduced-motion` (static positioning, no animation)
- Props: `className`, `intensity` (optional multiplier for opacity)

### 2. `src/components/ui/shimmer-button.tsx`

Reusable shimmer CTA button wrapper:
- White gradient sweep (15% opacity) travels left-to-right every 3s via CSS keyframe
- Pulsating box-shadow: `0 0 20px rgba(22,163,74,0.4)` every 2s
- Hover: scale 1.02, shadow intensifies to `0 0 35px rgba(22,163,74,0.6)`
- Wraps children (passes through existing button content/styles)
- Respects `prefers-reduced-motion`

### 3. `src/components/ui/spotlight-card.tsx`

Reusable card with cursor-following spotlight:
- `onMouseMove` tracks pointer position relative to card
- Renders radial gradient at cursor pos: green #16a34a at 8% opacity, fades to transparent at 60% radius
- Hover: border transitions to rgba(22,163,74,0.3), translateY(-2px), subtle box-shadow
- `onMouseLeave` resets spotlight
- Respects `prefers-reduced-motion`

---

## Changes to `src/pages/Video.tsx`

### Imports to add
- `motion` from `framer-motion` (already imported via ScrollReveal pattern)
- `AuroraBackground` from new component
- `ShimmerButton` from new component
- `SpotlightCard` from new component

### Hero Section (Section 2)

**Background:** Replace `ColorBends` div with `<AuroraBackground />` component.

**Headline:** Split headline text into individual words, wrap each in `motion.span` with staggered animation:
- `initial: { opacity: 0, y: 20, filter: "blur(4px)" }`
- `animate: { opacity: 1, y: 0, filter: "blur(0px)" }`
- Stagger: 0.08s per word, start delay 0.3s, duration 0.5s

**Subheadline:** `motion.p` with fade-up after headline completes.

**Info badges:** Each badge wrapped in `motion.span` with stagger 0.1s, scale from 0.9 to 1.

**CTA button:** Wrap `GreenCTA` with `ShimmerButton`.

**Benefit bullets:** Keep existing ScrollReveal.

### Sticky Top Bar (Section 1)

- Add `backdropFilter: "saturate(180%) blur(12px)"` (partially exists, enhance saturation)
- Track scroll position with `useEffect` + `useState` to increase opacity past hero (transition from 0.92 to 0.98)

### Pain Points (Section 3)

- Replace plain div cards with `SpotlightCard` component
- Each card uses `motion.div` with `whileInView`, stagger 0.15s

### Transformation (Section 4)

**Before column:** Add red ambient glow div (radial gradient rgba(239,68,68,0.06)), items enter from `x: -20` with stagger 0.1s

**After column:** Add green ambient glow div (radial gradient rgba(22,163,74,0.08)), items enter from `x: 20` with stagger 0.1s

**Result cards:** Hover adds left border accent (2px solid #16a34a) with CSS transition

### Operational Promise (Section 7)

- Large numbers: simple count-up animation using `motion.span` with `whileInView` trigger (animate from 0 to target value over 1.2s using a custom counter component inline)
- Each line staggers 0.15s on scroll

### Agenda (Section 8)

- Each row slides from `x: -30` with stagger 0.12s
- Hover: green left border appears via CSS transition, background lightens

### Deliverables + Tools (Sections 9, 10)

- Cards: hover adds green glow border (border-color transition)
- Staggered fade-up entrance 0.15s between cards

### Speaker (Section 11)

- Photo: `whileInView` from `scale: 0.95, opacity: 0` to `scale: 1, opacity: 1`
- Green ring glow: `box-shadow: 0 0 0 1px rgba(22,163,74,0.2), 0 0 30px rgba(22,163,74,0.1)`
- Text: staggered fade-in after photo

### Mid-page CTA (Section 12)

- Add `AuroraBackground` with lower intensity
- Title: word-by-word blur reveal (same as hero)
- Button: wrap with `ShimmerButton`

### FAQ (Section 13)

- Accordion items: add green left border on open via `[data-state=open]` CSS
- Chevron rotation already handled by existing accordion component

### Final CTA (Section 15)

- Add animated green gradient orb (CSS keyframe, 800px radial gradient, slow position drift)
- Title: staggered word reveal
- Button: `ShimmerButton` wrapper

### Global

- Define Framer Motion variants as constants at top of file
- All sections already use `ScrollReveal`; ensure consistent viewport margin `-80px` and `once: true`
- Add `prefers-reduced-motion` media query wrapper: all motion animations check this and render immediately if reduced motion preferred

---

## Files summary

| File | Action |
|---|---|
| `src/components/ui/aurora-background.tsx` | Create |
| `src/components/ui/shimmer-button.tsx` | Create |
| `src/components/ui/spotlight-card.tsx` | Create |
| `src/pages/Video.tsx` | Modify (animations only, no copy changes) |

No new dependencies. No layout or content changes.
