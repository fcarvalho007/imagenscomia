

## WhatsApp Support Floating Button — Landing Page

### New file
**`src/components/landing/WhatsAppSupportButton.tsx`**

A reusable floating action button component:
- Fixed position bottom-right with safe area padding (`bottom-6 right-6`, extra bottom on iOS via `pb-safe` or `env(safe-area-inset-bottom)`)
- `z-50` to stay above footer/cookie bars
- WhatsApp green (`#25D366`) background, white icon, `rounded-full`
- Inline SVG for the WhatsApp icon (Lucide does not include a WhatsApp icon)
- Wrapped in a Tooltip (`"Suporte WhatsApp"`) using the existing Radix tooltip from the project
- Hover animation: `scale-110` + enhanced shadow via Tailwind `transition-all`
- On click:
  - Opens `https://wa.me/351915015508?text=Ol%C3%A1!%20Preciso%20de%20apoio%20sobre%20a%20p%C3%A1gina.%20Podem%20ajudar-me%3F` in a new tab
  - Calls a placeholder analytics function: `console.log("whatsapp_click")`
- `aria-label="Suporte WhatsApp"` for accessibility

### Modified file
**`src/pages/Index.tsx`**

Import and render `<WhatsAppSupportButton />` inside the `<main>` block, after `<FooterSection />` and before `<RegistrationModal />`. No other sections are touched.

### Technical notes
- The `wa.me` URL works identically on mobile and desktop (WhatsApp handles the redirect), so no device detection logic is needed
- The component is self-contained and reusable — can be dropped into any other page later
- No new dependencies required

