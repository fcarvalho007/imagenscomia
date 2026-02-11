

# Melhorar UX/UI da pagina /confirmacao

## Problemas identificados

1. **Conteudo duplicado** — O `ReferralWidget` (plano referral) e o `ConfirmacaoExtras` mostram ambos blocos de referral, criando redundancia
2. **Hierarquia visual plana** — Todos os blocos tem o mesmo peso visual, sem fluxo claro
3. **Emoji no topo e texto simples** — Sem animacao de sucesso envolvente
4. **Botao "Voltar ao site" demasiado proeminente** — Fundo escuro full-width compete com as accoes importantes
5. **Link WhatsApp com numero ficticio** (351000000000)
6. **Sem animacoes sequenciais** — Os blocos aparecem todos ao mesmo tempo
7. **Blocos extras (referral, calendario, Instagram) sem coesao** — Estilos inline inconsistentes, espacamento irregular
8. **Email de contacto "orfao"** — Texto solto entre botoes e extras
9. **Mobile: padding apertado** — p-4 exterior + p-8 interior em ecras pequenos

---

## Alteracoes

### Ficheiro: `src/pages/Confirmacao.tsx`

**1. Animacao de entrada melhorada**
- Substituir o emoji de texto por um circulo animado com icone Check (lucide-react) dentro, fundo verde claro, com escala spring
- Manter emoji como fallback visual pequeno abaixo

**2. Animacoes sequenciais (staggered)**
- Usar `motion.div` com delays incrementais (0.1, 0.2, 0.3...) para cada bloco aparecer em cascata
- Fade-in + translateY suave (opacity 0 para 1, y 12px para 0)

**3. Remover ReferralWidget duplicado**
- Remover o componente `ReferralWidget` inline (linhas 157-234) — a funcionalidade de referral ja esta no `ConfirmacaoExtras`
- Remover a condicao `showReferralWidget` e a renderizacao do widget
- Limpar imports nao utilizados (Gift, Copy, Send, ExternalLink)

**4. Reorganizar hierarquia dos botoes**
- "Voltar ao site" passa a link discreto no fundo (texto simples, sem fundo escuro)
- Botao WhatsApp: remover numero ficticio, usar link generico do grupo ou esconder se nao houver link real
- Mover email de contacto para rodape com separador subtil

**5. Melhorar espacamento mobile**
- Container exterior: `p-4 sm:p-6`
- Card interior: `p-6 sm:p-8 md:p-10`
- Garantir que os blocos extras nao transbordam

**6. Agrupar blocos extras visualmente**
- Adicionar `mt-8` e separador fino antes dos extras
- Os 3 blocos (referral, calendario, Instagram) ficam dentro de um wrapper com espacamento consistente

### Ficheiro: `src/components/landing/ConfirmacaoExtras.tsx`

**7. Melhorar estilo dos botoes extras**
- Remover estilos inline (`style={}`) e usar classes Tailwind puras
- Espacamento uniforme entre blocos: `mt-3` para todos
- Botao Instagram: usar classe `bg-[#E1306C]` em vez de style inline
- Botao referral: hover state mais visivel

---

## Ficheiros a editar

| Ficheiro | Tipo de alteracao |
|----------|-------------------|
| `src/pages/Confirmacao.tsx` | Remover ReferralWidget duplicado, melhorar animacoes, reorganizar hierarquia, ajustar spacing |
| `src/components/landing/ConfirmacaoExtras.tsx` | Substituir estilos inline por Tailwind, espacamento uniforme |

Sem dependencias novas. Apenas reorganizacao e polish visual.
