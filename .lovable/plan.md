

# Conversion Copywriting Improvements for /comprar

Copy-only changes to `src/pages/Comprar.tsx`. No logic, modal, or payment changes. No other files touched.

## Changes

### 1. PLANS config updates (lines 23-74)

**Masterclass card:**
- Add new field `subPriceNote: "Sem isto, o webinar termina e não voltas a ter acesso ao Frederico ao vivo."`
- CTA: `"Quero o meu lugar na Masterclass →"`

**Bundle card:**
- Add new field `urgencyBadge: "Últimos lugares disponíveis"`
- Add new field `subBenefitsNote: "A Masterclass tem vagas limitadas. O Bundle garante tudo de uma vez."`
- CTA: `"Quero o Bundle completo →"`

**Gravacao card:**
- Title: `"Gravação HD + Pack de Apoio"`
- Add new field `subPriceNote: "Revê quando quiseres. Para sempre."`
- CTA: `"Quero a gravação →"`
- planLabel: `"Gravação HD + Pack de Apoio · €15"`

### 2. PlanCard component updates (lines 80-199)

Add rendering for new optional fields in the PLANS type:
- `subPriceNote` -- rendered below the price block as small italic muted text (12px, #9ca3af, italic)
- `urgencyBadge` -- rendered next to "Poupa €5" as a red/rose pill badge (bg #fee2e2, color #dc2626, 10px, font-weight 600)
- `subBenefitsNote` -- rendered after the benefits list, before dateBox, as small italic muted text

### 3. Header section updates (lines 224-241)

Replace the single subtitle with:
- **Line 1** (amber badge): `"🔥 Preço early bird — sobe depois do webinar de 5 de Março"` -- styled as pill with bg #fef3c7, color #92400e, font 11px, font-weight 600
- **Line 2** (small muted): `"Acesso garantido em segundos após confirmação de pagamento 🔒"` -- 12px, #9ca3af
- **Social proof line**: `"Junta-te às 127 pessoas já inscritas"` -- 12px, #6b7280, centered, margin-bottom 8px

### 4. Footer section updates (lines 266-276)

Add a new line between the "Pagamento seguro" and "Cartao de credito" lines:
- `"✓ Acesso imediato após pagamento  ·  ✓ Suporte via WhatsApp  ·  ✓ Satisfação garantida"` -- 11px, #9ca3af, centered

---

## File touched

Only `src/pages/Comprar.tsx` -- inline edits to static copy and a few new optional fields in the PLANS type.

