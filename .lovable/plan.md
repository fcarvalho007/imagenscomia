

## Auditoria Mobile e Correcoes de Otimizacao

Apos revisao completa em viewport 390x844 (iPhone 14), identifiquei os seguintes problemas e melhorias:

---

### Problemas encontrados

| # | Seccao | Problema | Severidade |
|---|--------|----------|------------|
| 1 | TransformationSection | As linhas before/after usam `flex` horizontal com 5 elementos (XCircle + texto + seta + CheckCircle + texto) numa unica linha. Em mobile, o texto fica ilegivel e comprimido | Alta |
| 2 | FooterSection | Copyright diz "2025" em vez de "2026" | Baixa |
| 3 | TestimonialsSection | Quote font-size a 16px — abaixo do padrao 17px definido no projeto | Baixa |
| 4 | ProgramSection | Botao CTA "Sim, assistir gratis!" nao e full-width em mobile (usa `inline-block`) | Media |
| 5 | CTAFinalSection | Botao CTA "Sim, assistir gratis!" nao e full-width em mobile | Media |

---

### Correcoes propostas

**1. TransformationSection — layout mobile empilhado**

Mudar de layout horizontal para vertical em mobile. Em vez de uma linha com 5 elementos, cada transformacao sera um card com "antes" em cima e "depois" em baixo, separados por uma seta para baixo. Em desktop (`md:`), manter o layout horizontal actual.

```text
Mobile:
+----------------------------+
| X  Texto antigo (riscado)  |
|         arrow-down         |
| check  Texto novo (bold)   |
+----------------------------+

Desktop: manter layout horizontal actual
```

**2. FooterSection — ano actualizado**

Mudar "2025" para "2026".

**3. TestimonialsSection — fonte consistente**

Mudar quote font-size de `16px` para `17px` para manter consistencia com o resto da pagina.

**4. ProgramSection — CTA full-width mobile**

Adicionar `w-full sm:w-auto` ao botao para ocupar toda a largura em mobile.

**5. CTAFinalSection — ja tem `w-full sm:w-auto`**

O botao ja tem as classes correctas. Sem alteracao necessaria.

---

### Ficheiros afectados

| Ficheiro | Alteracao |
|---|---|
| `src/components/landing/TransformationSection.tsx` | Layout empilhado em mobile |
| `src/components/landing/FooterSection.tsx` | Ano 2025 para 2026 |
| `src/components/landing/TestimonialsSection.tsx` | Quote font 16px para 17px |
| `src/components/landing/ProgramSection.tsx` | Botao CTA full-width mobile |

### O que esta bem

- Hero: botao CTA full-width, font ok, badges em grid 2x2
- Galeria: masonry 2 colunas em mobile, funciona bem
- PresenterSection: foto + texto empilhados correctamente
- AudienceSection: listas empilhadas em mobile
- FAQSection: accordion funcional, font 17px consistente
- PricingCardsSection: card centrado, botao full-width

