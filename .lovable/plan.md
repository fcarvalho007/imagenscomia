

# Refinamentos para /video

## Problemas detectados

### 1. Seccao Storytelling invisivel (critico)
A seccao 6 (Storytelling — "A cena tipica" + "Caminho A/B") nao aparece visualmente na pagina. Ha um grande espaco vazio entre "Para quem e" e "Promessa operacional". O conteudo existe no codigo (linhas 357-385) mas o componente Reveal nao esta a animar correctamente naquela zona, provavelmente porque a seccao e escura sobre fundo escuro e o viewport margin nao dispara. Confirma-se visualmente no screenshot: bloco completamente vazio.

**Correcao:** Verificar se o `Reveal` esta a funcionar (pode ser problema de `useInView` com margin negativo nao a detectar a seccao). Alternativa: remover o wrapper `Reveal` nessa seccao ou ajustar o `margin` de `-60px` para `0px`. Tambem adicionar um fundo diferenciado (`DARK_CARD` em vez de `DARK`) para contraste visual.

### 2. Sticky bar overflow em mobile
O badge e o botao CTA sobrepoe-se em ecras pequenos (390px). O badge ocupa demasiado espaco.

**Correcao:** Reduzir o tamanho do badge em mobile (`text-[11px]`), truncar texto para "GRATUITO · 2 MAR 2026", ou esconder o badge em mobile e manter apenas o CTA.

### 3. Titulos com alinhamento inconsistente
Algumas seccoes tem titulos centrados (Problema, Transformacao, CTA), outras alinhados a esquerda (Ferramentas, Entregaveis, Para quem e, Promessa operacional).

**Correcao:** Centrar todos os titulos de seccao para manter consistencia com o estilo geral da pagina.

### 4. Smooth scroll nao aplicado ao html
O `scrollBehavior: "smooth"` esta no div wrapper, mas os cliques em anchors (`href="#inscricao"`) usam o comportamento do `html`. Pode nao animar.

**Correcao:** Adicionar `scroll-behavior: smooth` ao `html` via useEffect, ou converter os anchors para `onClick` com `document.getElementById().scrollIntoView({ behavior: 'smooth' })`.

### 5. Componente Reveal duplica ScrollReveal
O projecto ja tem `ScrollReveal` em `src/components/landing/ScrollReveal.tsx` com a mesma funcionalidade. O `Reveal` local e uma duplicacao.

**Correcao:** Substituir `Reveal` por `ScrollReveal` importado do projecto, eliminando o componente local duplicado.

---

## Resumo das alteracoes

| Ficheiro | Alteracao |
|---|---|
| `src/pages/Video.tsx` | Corrigir storytelling invisivel; fixar sticky bar mobile; centrar todos os titulos; substituir Reveal local por ScrollReveal; implementar smooth scroll nos CTAs |

Nenhum ficheiro novo. Apenas refinamentos no ficheiro existente.

---

## Detalhe tecnico

### A) Storytelling visivel
- Verificar se o bloco das linhas 357-385 esta de facto a renderizar (nao ha condicional que o esconda)
- Mudar o fundo da seccao de `DARK` para `DARK_CARD` para distinguir visualmente do bloco anterior/posterior
- Simplificar ou remover o `Reveal` wrapper se o `useInView` nao estiver a disparar

### B) Sticky bar responsiva
- Adicionar classes responsivas: `hidden sm:inline-block` no badge para esconder em mobile
- Ou reduzir o texto do badge em mobile para algo mais curto

### C) Titulos centrados
- Adicionar `text-center` aos containers de titulo das seccoes 5 (Qualification), 7 (Operational Promise), 8 (Agenda), 9 (Deliverables), 10 (Tools)

### D) Smooth scroll
- Converter todos os `<a href="#inscricao">` para `onClick` handlers com `scrollIntoView({ behavior: 'smooth' })`

### E) Reutilizar ScrollReveal
- Remover o componente `Reveal` local (linhas 18-33)
- Importar `ScrollReveal` de `@/components/landing/ScrollReveal`
- Substituir todas as ocorrencias de `<Reveal>` por `<ScrollReveal>` (mesma API: `children`, `className`, `delay`)
