

# Refinar /gravacao + /upgrade-gravacao — Remover "Gravacao", reordenar seccoes, logo strip, hero mais largo

## Resumo

Alteracoes em 4 ficheiros para: (1) reordenar seccoes da landing page e adicionar logo strip + seccao Transformacao, (2) alargar o hero para max-w-7xl com 2 colunas em desktop, (3) remover todas as ocorrencias de "Gravacao"/"gravacao" no copy visivel, (4) limpar o funnel /upgrade-gravacao.

---

## Ficheiros a alterar

| Ficheiro | Tipo de alteracao |
|---|---|
| `src/pages/Gravacao.tsx` | Reordenar seccoes, alargar hero (2 colunas), adicionar logo strip e seccao Transformacao |
| `src/pages/UpgradeGravacao.tsx` | Remover "Gravacao" do copy (titulo, sidebar, banner, botoes, usePageMeta) |
| `src/components/upgrade/GravacaoConfirmation.tsx` | Renomear "Gravacao HD + Pack de Apoio" para "Sessao completa + Pack de Apoio" |
| `src/components/upgrade/StepMasterclass.tsx` | Renomear bullet "Gravacao incluida" para "Acesso a sessao incluido" |
| `src/components/recursos/RecursosUpsell.tsx` | Substituir "gravacao incluida" por "acesso a sessao incluido" |

---

## A) Gravacao.tsx — Hero 2 colunas + Logo strip + Reordenacao

### Hero (2 colunas desktop, max-w-7xl)

Manter o dark/neon existente. Alterar container de `maxWidth: 860` para `max-w-7xl` (1280px).

**Desktop (md+):** grid 2 colunas
- Coluna esquerda (60%): badge, H1, subheadline, "Ver hoje. Aplicar amanha.", 3 micro-bullets (consistencia visual, menos bloqueios, templates reutilizaveis)
- Coluna direita (40%): card de compra semi-transparente com preco 27 EUR, CTA verde ElectricBorder, trust microcopy, GoogleBadge dark

**Mobile:** layout empilhado (como actualmente, com card de compra abaixo do texto)

### Logo strip (novo, apos hero)

Inserir seccao slim usando logos existentes de `src/assets/logos/`:
- google.png e chatgpt.webp (como representantes de Google e OpenAI/ChatGPT)
- Titulo: "Tecnologia e ferramentas referidas na sessao"
- Fundo escuro (#060D1A) para continuidade com o hero, logos monocromaticos (filter: brightness(0) invert(1), opacity 0.5)
- Formato: linha horizontal estatica, nao marquee

### Reordenacao das seccoes

Nova ordem:
1. Hero (dark, 2 colunas)
2. Logo strip (dark)
3. Bloqueios (6 cards) — mover de posicao 4 para 3
4. Transformacao (NOVA) — "No final, vais ser capaz de..."
5. Metodo (3 blocos) — mantém
6. O que recebes (Pack 27 EUR) — mover de posicao 2 para 6
7. Galeria — mantém
8. Audiencia — mantém
9. Formador + Testemunhos — mantém
10. FAQ + Suporte — mantém
11. CTA Final — mantém

### Seccao Transformacao (nova, entre Bloqueios e Metodo)

Fundo branco. Titulo: "No final, vais ser capaz de..."

4 bullets com icones Check verdes:
- "Criar imagens prontas a publicar (IG, LinkedIn, Ads)"
- "Manter consistencia visual entre pecas"
- "Escolher a ferramenta certa para cada caso"
- "Produzir mais criativos sem depender de terceiros"

Linha de fecho: "Processo replicavel — nao uma lista de truques soltos."

---

## B) UpgradeGravacao.tsx — Remover "Gravacao" do copy

Alteracoes de texto (sem mudar logica):

| Onde | De | Para |
|---|---|---|
| usePageMeta title | "Upgrade — Gravacao Imagens com IA" | "Upgrade — Pack Imagens com IA" |
| usePageMeta description | "...pack de gravacao" | "...pack completo" |
| Recovery error msg | "...pagina de gravacao" | "...pagina do pack" |
| Sidebar item | "Gravacao + Pack de Apoio" | "Sessao completa + Pack de Apoio" |
| Step 2 banner | "Gravacao + Pack de apoio garantidos" | "Sessao + Pack de apoio garantidos" |
| Mobile footer | "Continuar so com a gravacao" | "Continuar so com o pack" |
| Mobile footer (27 EUR) | "Continuar so com a gravacao (27 EUR)" | "Continuar so com o pack (27 EUR)" |

Nota: os valores tecnicos `plan_selected: "gravacao"` e `plan: "gravacao"` NAO sao alterados — sao identificadores de backend.

---

## C) GravacaoConfirmation.tsx — Renomear label

| De | Para |
|---|---|
| "Gravacao HD + Pack de Apoio" | "Sessao completa + Pack de Apoio" |
| "Gravacao + Pack de Apoio — Confirme o pagamento." | "Pack completo — Confirme o pagamento." |

---

## D) StepMasterclass.tsx — Renomear bullet

| De | Para |
|---|---|
| bullet title "Gravacao incluida" | "Acesso a sessao incluido" |
| bullet sub "Rever e replicar quando necessario." | mantém |

---

## E) RecursosUpsell.tsx — Renomear texto

| De | Para |
|---|---|
| "Sessao ao vivo + gravacao incluida" (2 ocorrencias) | "Sessao ao vivo + acesso a sessao incluido" |

---

## Verificacao final

- Zero ocorrencias de "Gravacao"/"gravacao" em copy visivel (excepto identificadores tecnicos de backend como `plan_selected`, `registrationSource`, nomes de ficheiro/rota)
- Hero dark com 2 colunas em desktop, card de compra a direita
- Logo strip com Google + ChatGPT logos imediatamente apos hero
- Seccao "O que recebes" movida para posicao 6 (depois de Metodo)
- Nova seccao "Transformacao" entre Bloqueios e Metodo

