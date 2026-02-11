
## Avaliação da página Webinar Live: Melhorias e Refinamentos Propostos

### ✅ O que está bem implementado
- **Estrutura limpa e modular**: Componentes bem separados (VideoArea, Sidebar, Content, Footer)
- **Estados claros**: Waiting, Live e Ended implementados correctamente
- **Countdown dinâmico**: Actualiza-se a cada segundo
- **Config centralizado**: Fácil de reutilizar para futuros webinars
- **Tipografia consistente**: Montserrat para títulos, Inter para corpo
- **Responsiveness**: Layout 2-col em desktop, 1-col em mobile
- **Accessibility básica**: Contraste, spacing, tags semânticas

---

### 🎯 Melhorias propostas (5 áreas)

#### 1. **Refinamento visual do card de aguardar**
**Problema**: Card de espera no estado "waiting" é visualmente simples; grid pattern muito subtil (~4% opacity).

**Solução**:
- Aumentar opacity do grid pattern para ~8-12% para mais definição visual
- Adicionar animação suave ao badge "A transmissão começa em breve" (pulse leve)
- Melhorar o contraste do texto do countdown: usar `text-white` em vez de `text-ink-900` para clareza na escuridão

#### 2. **Visibilidade do estado "Live" com badge de urgência**
**Problema**: Quando live começa, não há feedback visual claro para utilizadores que estão na página.

**Solução**:
- Implementar "Live badge" sticky na header quando `isLive === true`
- Adicionar transição suave (fade-in) quando muda de waiting → live
- Usar badge vermelha com pulse animation quando em direto

#### 3. **Layout sidebar em mobile (melhoria UX)**
**Problema**: Sidebar full-width em mobile pode parecer desconectada da área de vídeo.

**Solução**:
- Em mobile, mover sidebar ABAIXO do vídeo e conteúdo (não acima)
- Adicionar separador visual entre conteúdo principal e offers
- Tornar sticky a barra de ofertas em desktop apenas (já está, mas confirmar comportamento)

#### 4. **Melhorias no FAQ accordion**
**Problema**: FAQ importa `ScrollReveal` mas não o usa; accordion sem espaçamento entre questões.

**Solução**:
- Remover import não utilizado de `ScrollReveal`
- Aumentar gap entre acordeões de `space-y-2` para `space-y-3`
- Adicionar animação suave ao abrir (já tem via Radix, mas verificar timing)
- Adicionar border-bottom subtil no último item para definição

#### 5. **Tratamento de edge cases e acessibilidade**
**Problema**: Link "Adicionar ao calendário" apontando para `#`; falta de aria-labels.

**Solução**:
- Adicionar `aria-label` descritivo em links e botões
- Alterar CALENDAR_URL para placeholder mais realista (ex: Google Calendar link template)
- Adicionar skip link invisível no topo para acessibilidade (keyboard nav)
- Melhorar focus states em links (actualmente via hover, mas falta focus ring)

#### 6. **Performance e SEO**
**Problema**: Sem meta tags (title, description) ou structured data para webinar.

**Solução**:
- Adicionar `useEffect` para actualizar `document.title` quando página carrega
- Considerar adicionar schema.org Event JSON-LD na página
- Adicionar meta description dinâmica baseada em WEBINAR_CONFIG

#### 7. **Refinamento do CTA no Premium Pass**
**Problema**: Card Premium tem gradient sutil que pode passar despercebido em mobile.

**Solução**:
- Aumentar ligeiramente o gradiente visual (ajustar `from-blue-50/60` para `from-blue-50/80`)
- Adicionar subtle shadow no card accent para depth
- Assegurar CTA "Garantir Premium Pass" está claramente destacado

---

### 🔧 Implementação proposta

**Prioridade ALTA** (impact visual + UX):
1. Aumentar visibilidade do grid pattern no waiting state
2. Adicionar live badge na header quando `isLive === true`
3. Melhorar espaçamento e definição do FAQ
4. Refinar focus/hover states nos links

**Prioridade MÉDIA** (polish):
5. Adicionar aria-labels e accessibility improvements
6. Melhorar card accent gradient
7. Actualizar CALENDAR_URL com template real

**Prioridade BAIXA** (futura):
8. Adicionar schema.org Event JSON-LD
9. Implementar analytics tracking

---

### 📋 Resumo das mudanças
- Ficheiros a modificar: `WebinarVideoArea.tsx`, `WebinarSidebar.tsx`, `WebinarContent.tsx`, `WebinarLive.tsx`
- Linhas estimadas a alterar: ~15-20 mudanças pequenas, focadas em CSS classes + accessibility
- Tempo estimado: 15-20 minutos

