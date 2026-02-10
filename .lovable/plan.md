

# CRO + UI/UX Improvements -- Landing Page + Modals

---

## Important Note on Design System

The request proposes a full dark navy theme (#0B1220) and Space Grotesk typography. However, the project has an established "Editorial Clean" identity with white backgrounds, Montserrat headings, and Inter body text, validated across multiple iterations. Switching the entire design system would require rewriting every component and risk regression. **This plan keeps the existing visual identity** and focuses on the high-impact CRO, copy, and UX improvements that drive conversions.

---

## 1. HeroSection.tsx -- Clarity + Micro-bullets + CTA Labels

**Copy changes:**
- Tagline: "Sem Designer. Sem Agencia. Sem Curso de 6 Meses." becomes "Sem equipa criativa. Sem agencia. Sem meses de tentativa e erro."
- Add 3 micro-bullets below the subheadline (before the meta row):
  - "3 modelos de imagem prontos a aplicar (redes sociais, anuncios, produto)"
  - "Metodo de briefing -> imagem utilizavel em ~3 minutos"
  - "Checklist de consistencia visual para a marca"
- CTA labels:
  - Primary: "Reservar lugar gratis" (keep Check icon)
  - Secondary: "Ver o que inclui o Premium (EUR15 + IVA)" (keep Sparkles icon)
- Trust line below CTAs: "Sem spam. Dados protegidos (RGPD). Cancelamento simples."
- Social proof: "127 lugares ja reservados (actualizado hoje)"

**Language:** Switch all "tu/teu" phrasing to impersonal/neutral where possible.

---

## 2. MirrorCopySection.tsx -- Shorter, Outcome-based Bullets

Replace current 3 long bullets with shorter, scan-friendly versions:
1. "Precisa de imagens profissionais para redes sociais e anuncios sem depender de designer"
2. "Sabe que a IA pode fazer muito mais, mas ninguem mostrou como aplicar ao negocio"
3. "Quer consistencia visual na marca sem orcamento para agencia criativa"

---

## 3. ProgramSection.tsx -- Deliverable Line per Module

Add a "deliverable" line at the end of each module card:
- Module 01: "No fim deste bloco, fica com: 5 prompts-base prontos a reutilizar"
- Module 02: "No fim deste bloco, fica com: 3 pecas visuais prontas a publicar"
- Module 03: "No fim deste bloco, fica com: processo de producao em lote configurado"

---

## 4. PricingCardsSection.tsx -- Labels + "Best For"

- Free card label: "Participacao gratuita -- EUR0"
- Premium card label: "Premium Pass -- EUR15 + IVA"
- Add "best for" micro-label on each card:
  - Free: "Ideal para quem vai estar ao vivo"
  - Premium: "Ideal para quem quer rever e aplicar depois"

---

## 5. FAQSection.tsx -- Add 2 New FAQs

Add two new questions:
1. "Isto funciona com ferramentas gratuitas?" -> "Sim. A maior parte do metodo funciona com ferramentas gratuitas, incluindo a aplicacao criada especificamente para este webinar. Tambem sao mostradas opcoes pagas para quem quiser ir mais longe."
2. "O que e exatamente o 'Guia de prompts' e para que serve?" -> "E um documento PDF com mais de 30 paginas de prompts testados em contexto empresarial portugues. Cada prompt esta organizado por tipo de imagem (produto, redes sociais, anuncios) e inclui instrucoes de personalizacao para qualquer marca."

---

## 6. RegistrationModal.tsx -- Complete Modal Flow Refinement

### Step 1: CaptureView
- Title: "Concluir reserva do lugar"
- Subtitle: "Demora menos de 30 segundos."
- WhatsApp helper text: "Opcional -- apenas para lembretes do evento"
- RGPD checkbox text simplified: "Autorizo o envio de comunicacoes relacionadas com este evento e conteudos de marketing. Politica de Privacidade e Termos." (with clickable links)
- Micro-line below checkbox: "Sem spam. Cancelamento a qualquer momento."
- Inline validation messages in PT-PT: "Indique um email valido." / "Este campo e obrigatorio."
- "What happens next" block below button: "A seguir: recebe um email com o link de acesso e opcao para adicionar ao calendario."

### Step 2: UpsellView
- Title: "Lugar reservado." (remove first name and exclamation)
- Subtitle: "Antes de concluir, escolha o formato de participacao."
- Replace negative framing "Com a versao gratuita, vais perder acesso a:" with: "Na participacao gratuita, estes extras nao estao incluidos:"
- Premium extras with green checks:
  - "Gravacao da sessao (acesso durante 30 dias)"
  - "Sessao Q&A exclusiva em grupo -- 60 minutos"
  - "Guia completo de prompts (30+ paginas, contexto empresarial em PT)"
- "Sem risco" microcopy under premium button: "Pagamento seguro. Acesso imediato apos o evento."
- Referral button explanation text below: "Sera gerado um link pessoal para convidar 2 pessoas. Assim que 2 inscricoes forem confirmadas, o Premium fica activo."
- Tertiary link (free) remains visible: "Continuar com participacao gratuita"

### Step 3: ConfirmationView
- Keep existing structure (upgrade CTA + referral sharing widget)
- No major changes needed here

---

## 7. CTAFinalSection.tsx -- Neutral Language

- Update tagline: "Sem designer. Sem agencia. Sem esperas." -> "Sem equipa criativa. Sem agencia. Sem esperas."

---

## 8. Language Pass (All Files)

Where feasible, replace "tu/teu/tua" with impersonal phrasing. Examples:
- "O teu nome" -> "Nome"
- "O teu melhor email" -> "Email"
- "O teu WhatsApp" -> "WhatsApp (opcional)"
- Section headers: "ESTE WEBINAR E PARA TI SE:" -> "ESTE WEBINAR E PARA QUEM:"

---

## Files to Edit

| File | Changes |
|------|---------|
| `src/components/landing/HeroSection.tsx` | Tagline, micro-bullets, CTA labels, trust line, social proof |
| `src/components/landing/MirrorCopySection.tsx` | Shorter bullets, neutral language |
| `src/components/landing/ProgramSection.tsx` | Deliverable line per module |
| `src/components/landing/PricingCardsSection.tsx` | Labels, "best for" micro-labels |
| `src/components/landing/FAQSection.tsx` | 2 new FAQs |
| `src/components/landing/RegistrationModal.tsx` | Modal flow copy, validation, RGPD, upsell framing |
| `src/components/landing/CTAFinalSection.tsx` | Neutral language |

No new files. No new dependencies. No database changes.

