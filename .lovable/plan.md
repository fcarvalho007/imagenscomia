
## 5 Mudancas na Landing Page

### Mudanca 1 — Hero: Headline, Subheadline, CTA e Microcopy

**`src/components/landing/HeroSection.tsx`**
- Headline: "Cria Imagens Profissionais com IA" → "Aprende a Criar Imagens Profissionais com IA"
- Subheadline: "Sem equipa criativa. Sem agencia. Sem meses de tentativa e erro." → "Em 60 minutos ao vivo: do briefing a imagem pronta a publicar."
- CTA: "Inscrever-me gratis →" → "Sim, quero garantir a minha vaga gratis →"
- Microcopy: "Sem spam. Dados protegidos (RGPD). Cancelamento simples." → "Sem spam. Acesso imediato por email. Dados protegidos (RGPD)."

**`src/components/landing/PricingCardsSection.tsx`**
- CTA: "Inscrever-me gratis →" → "Sim, assistir gratis!"

**`src/components/landing/CTAFinalSection.tsx`**
- CTA: "Inscrever-me gratis →" → "Sim, assistir gratis!"

**`src/components/landing/ProgramSection.tsx`**
- CTA: "Reservar lugar gratuito" → "Sim, assistir gratis!"

### Mudanca 2 — Reordenacao das Seccoes

**`src/pages/Index.tsx`**

Ordem actual:
1. StickyTopBar
2. HeroSection
3. MirrorCopySection
4. PresenterSection
5. ChallengesSection
6. ProgramSection
7. GallerySection
8. TestimonialsSection
9. AudienceSection
10. PricingCardsSection
11. FAQSection
12. CTAFinalSection
13. FooterSection

Nova ordem:
1. StickyTopBar
2. HeroSection
3. ChallengesSection ("Isto soa-te familiar?")
4. ProgramSection ("O que se aprende em 60 minutos")
5. GallerySection ("Exemplos Reais")
6. **TransformationSection** (novo bloco)
7. AudienceSection ("Para quem e este webinar")
8. PresenterSection ("Quem apresenta")
9. TestimonialsSection ("O que dizem sobre o Frederico")
10. PricingCardsSection ("Como participar")
11. FAQSection
12. CTAFinalSection
13. FooterSection

A seccao MirrorCopySection e removida da ordem (o seu conteudo torna-se redundante com ChallengesSection e AudienceSection ja presentes).

### Mudanca 3 — Novo Bloco: TransformationSection

**Novo ficheiro: `src/components/landing/TransformationSection.tsx`**

- Background: bg-off-white
- Padding: py-10 md:py-16
- Max-width: 720px centrado
- Label: "DEPOIS DO WEBINAR" (uppercase, blue-600, 12px)
- Headline: "O que muda em 60 minutos" (font-extrabold, 26px mobile / 32px desktop)
- 3 linhas antes/depois com icones Lucide (XCircle vermelho → ArrowRight → CheckCircle2 verde)
- CTA verde: "Sim, quero garantir a minha vaga gratis →"

Conteudo das 3 linhas:
| Antes | Depois |
|---|---|
| Horas a tentar ferramentas sem resultado concreto | Metodo reproduzivel para qualquer imagem em minutos |
| Imagens genericas que nao representam a tua marca | Consistencia visual da marca em todas as pecas |
| Dependencia de terceiros para cada peca de conteudo | Autonomia total — crias quando precisas, sem esperar |

### Mudanca 4 — AudienceSection: Ajuste de Texto

**`src/components/landing/AudienceSection.tsx`**

Na lista "NAO E PARA TI SE", primeiro item:
- sub actual: "este webinar e para quem nao tem formacao em design"
- sub novo: "este webinar e pratico — nao cobre fundamentos avancados de IA"

### Mudanca 5 — Microcopy (ja incluida na Mudanca 1)

Ja coberta acima no HeroSection.

---

### Resumo de ficheiros

| Ficheiro | Tipo | Alteracao |
|---|---|---|
| `src/components/landing/HeroSection.tsx` | Editar | Headline, subheadline, CTA, microcopy |
| `src/components/landing/CTAFinalSection.tsx` | Editar | CTA texto |
| `src/components/landing/PricingCardsSection.tsx` | Editar | CTA texto |
| `src/components/landing/ProgramSection.tsx` | Editar | CTA texto |
| `src/components/landing/AudienceSection.tsx` | Editar | Texto sub do primeiro item "nao e para ti" |
| `src/components/landing/TransformationSection.tsx` | Novo | Bloco antes/depois com 3 linhas e CTA |
| `src/pages/Index.tsx` | Editar | Reordenar seccoes, importar TransformationSection, remover MirrorCopySection |
