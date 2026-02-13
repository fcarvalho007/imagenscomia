

## Hero: "Inteligencia Artificial" + Auditoria Tipografica da Pagina

### 1. Hero — Titulo e largura

**Ficheiro:** `src/components/landing/HeroSection.tsx`

Substituir o texto do H1:
```text
Aprende a Criar Imagens<br />Profissionais com IA
```
por:
```text
Aprende a Criar Imagens<br />Profissionais com<br />Inteligência Artificial
```

Ajustar `max-width` do H1 para `760px` (em vez de 700) e do container para `760px` para acomodar o texto mais longo em 3 linhas equilibradas.

Reduzir ligeiramente o `fontSize` para `clamp(32px, 5vw, 46px)` para que as 3 linhas caibam de forma elegante sem ocupar demasiado espaco vertical.

---

### 2. Auditoria de fontes — correcoes de coesao

Regra base do projecto: nenhum texto inferior a 14px. H2 padrao: `24px / 30px / 34px`. Corpo: 17px. Kickers: 14px uppercase.

| Ficheiro | Elemento | Actual | Corrigido |
|---|---|---|---|
| `HeroSection.tsx` | Badge "WEBINAR GRATUITO" fontSize | 11px | 14px |
| `HeroSection.tsx` | Spec badge labels (ONLINE, HORARIO...) | 11px | 14px |
| `HeroSection.tsx` | Spec badge values (18 Fev, 10h00...) | 13px | 14px |
| `HeroSection.tsx` | Microcopy RGPD | 12px | 14px |
| `TransformationSection.tsx` | Kicker "DEPOIS DO WEBINAR" | 12px | 14px |
| `TransformationSection.tsx` | H2 "O que muda em 60 minutos" | 26/32px | 24/30/34px |
| `TransformationSection.tsx` | Before/after text | 14px | 15px |
| `PresenterSection.tsx` | H2 "Frederico Carvalho" | 26/32px | 24/30/34px |
| `PricingCardsSection.tsx` | "(nao inclui gravacao)" | 13px | 14px |
| `CTAFinalSection.tsx` | H2 principal | 28/34/38px | 24/30/34px |
| `CTAFinalSection.tsx` | H2 secundario (azul) | 28/34/38px | 24/30/34px |

### 3. Resumo de ficheiros alterados

| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/HeroSection.tsx` | Titulo "Inteligencia Artificial", max-width 760, fontSize ajustado, badge 14px, spec labels/values 14px, microcopy 14px |
| `src/components/landing/TransformationSection.tsx` | Kicker 14px, H2 escala padrao 24/30/34, texto before/after 15px |
| `src/components/landing/PresenterSection.tsx` | H2 escala padrao 24/30/34 |
| `src/components/landing/PricingCardsSection.tsx` | Microcopy 14px |
| `src/components/landing/CTAFinalSection.tsx` | H2s escala padrao 24/30/34 |

Nenhuma pagina fora da landing page e alterada (/upgrade, /confirmacao, /crm).

