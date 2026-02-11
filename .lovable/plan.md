
# Coesao Tipografica da Landing Page

## Problema Identificado
A landing page tem tamanhos de fonte inconsistentes entre seccoes. O mesmo tipo de elemento (etiqueta, titulo, corpo de texto) usa tamanhos diferentes conforme a seccao, o que quebra a coesao visual.

## Auditoria Actual vs. Proposta

### Etiquetas Uppercase (kickers)
| Seccao | Actual | Proposta |
|--------|--------|----------|
| Hero | 13px | **14px** |
| MirrorCopy | 12px (text-xs) | **14px** |
| Presenter | 11px | **14px** |
| Program | 12px (text-xs) | **14px** |
| Gallery | 11px | **14px** |
| Testimonials | 11px | **14px** |
| Audience | 12px (text-xs) | **14px** |
| Pricing | 12px (text-xs) | **14px** |

**Regra: todas as etiquetas uppercase passam a `text-[14px]`** (respeita o minimo de 14px do style guide)

### Titulos H2
| Seccao | Actual | Proposta |
|--------|--------|----------|
| Challenges | 22/28/30px | **24/30/34px** |
| Program | 22/28/30px | **24/30/34px** |
| Gallery | 24px/32px | **24/30/34px** |
| Testimonials | 24px/32px | **24/30/34px** |
| Audience | 22/28/30px | **24/30/34px** |
| Pricing | 22/28/30px | **24/30/34px** |
| FAQ | 22/28/30px | **24/30/34px** |
| CTA Final | 28/32/36px | **28/34/38px** (maior, e o fecho da pagina) |

**Regra: H2 padrao = `text-[24px] sm:text-[30px] md:text-[34px]`; CTA final ligeiramente maior**

### Corpo de Texto / Descricoes
| Seccao | Actual | Proposta |
|--------|--------|----------|
| Hero descricao | 19/21px | **18/20px** (hero sub-headline, ok ser maior) |
| MirrorCopy pontos | 16px | **17px** |
| Challenges cards | 17px | **17px** (manter) |
| Program desc | 16px | **17px** |
| Program bullets | 14px (text-sm) | **15px** |
| Program deliverable | 13px | **14px** |
| Gallery desc | 16px | **17px** |
| Testimonials quotes | 15px | **16px** |
| Audience items | 16px | **17px** |
| Audience sub | 13px | **14px** |
| Pricing features | 16px | **17px** |
| Pricing sub-desc | 12px | **14px** |
| FAQ perguntas | 16px (text-base) | **17px** |
| FAQ respostas | 16px | **17px** |
| CTA Final desc | 18px | **18px** (manter) |
| Closing disclaimers | 13px | **14px** |

**Regra: corpo padrao = `text-[17px]`; sub-texto minimo = `14px`; nenhum texto abaixo de 14px**

### Outros Elementos Pequenos
| Elemento | Actual | Proposta |
|----------|--------|----------|
| Hero info cards | 15-16px | **16px** |
| Presenter credential title | 13px | **14px** |
| Presenter credential sub | 12px | **14px** |
| Presenter stat labels | 12px | **14px** |
| Testimonials role | 12px (text-xs) | **14px** |
| Google badge text | 11px | **14px** |
| Video placeholder | 12px (text-xs) | **14px** |
| Pricing "sem compromisso" | 13px | **14px** |
| Hero RGPD text | 13px | **14px** |
| Footer links | 13px | **14px** |

---

## Ficheiros a Editar

| Ficheiro | Alteracoes |
|----------|-----------|
| `HeroSection.tsx` | Kicker 13->14px, RGPD 13->14px, video text 12->14px, Google badge 11->14px, info cards 15->16px |
| `MirrorCopySection.tsx` | Kicker xs->14px, body 16->17px |
| `PresenterSection.tsx` | Kicker 11->14px, credential titles 13->14px, credential subs 12->14px, stat labels 12->14px, bio 17px (manter) |
| `ChallengesSection.tsx` | H2 22/28/30->24/30/34px, closing text 16->17px |
| `ProgramSection.tsx` | Kicker xs->14px, H2 22/28/30->24/30/34px, desc 16->17px, bullets sm->15px, deliverable 13->14px, sub-desc 17px (manter) |
| `GallerySection.tsx` | Kicker 11->14px, H2 uniforme 24/30/34px, desc base->17px |
| `TestimonialsSection.tsx` | Kicker 11->14px, H2 uniforme 24/30/34px, quotes 15->16px, role xs->14px, footer 11->14px, badge 13->14px |
| `AudienceSection.tsx` | Kicker xs->14px, H2 22/28/30->24/30/34px, body 16->17px, sub 13->14px |
| `PricingCardsSection.tsx` | Kicker xs->14px, H2 22/28/30->24/30/34px, features 16->17px, sub-desc 12->14px, "sem compromisso" 13->14px |
| `FAQSection.tsx` | H2 22/28/30->24/30/34px, questions base->17px, answers 16->17px |
| `CTAFinalSection.tsx` | H2 28/32/36->28/34/38px, desc 18px (manter), CTA button text-base->text-lg |
| `FooterSection.tsx` | Links 13->14px, copyright 13->14px |

## Principios Aplicados
- Nenhum texto na pagina abaixo de **14px**
- Etiquetas uppercase: **14px** em todo o lado
- H2 padrao: **24/30/34px** (mobile/tablet/desktop)
- Corpo padrao: **17px**
- Sub-texto/disclaimers: **14px**
