
# Redesign do InscritoModal — Nova Arquitectura de Layout

## Resumo

Reestruturar completamente o modal de detalhe do inscrito no CRM, mantendo toda a funcionalidade e dados existentes. O modal passa de um layout linear (sidebar + scroll longo) para sidebar reorganizada com Status Block + Funnel compacto, e area direita com 4 tabs (Resumo, Actividade, Historico, Link e Pagamento).

---

## Ficheiros a modificar/criar

| Ficheiro | Accao |
|---|---|
| `src/components/crm/InscritoModal.tsx` | Reescrever layout completo — 2 colunas com tabs |
| `src/components/crm/modal/StatusBlock.tsx` | **Novo** — card de estado (A/B/C/D) para sidebar |
| `src/components/crm/modal/SidebarActions.tsx` | **Novo** — accoes em 3 tiers (substitui accoes inline) |
| `src/components/crm/modal/SidebarFunnel.tsx` | **Novo** — mini-funil vertical compacto para sidebar |
| `src/components/crm/modal/TabResumo.tsx` | **Novo** — tab Resumo com cards info + duvida + funil horizontal + historico |
| `src/components/crm/modal/TabActividade.tsx` | **Novo** — wrapper do ActivityTimeline com summary bar |
| `src/components/crm/modal/TabHistorico.tsx` | **Novo** — historico cross-webinar + notas |
| `src/components/crm/modal/TabLinkPagamento.tsx` | **Novo** — link/followup + faturacao + premium grant |
| `src/components/crm/FunnelView.tsx` | Sem alteracao (reutilizado dentro de TabResumo) |
| `src/components/crm/modal/ActionsSection.tsx` | Mantido como esta (reutilizado internamente por SidebarActions para logica de pagamento) |
| `src/components/crm/modal/ActivityTimeline.tsx` | Sem alteracao |
| `src/components/crm/modal/LinkFollowUpSection.tsx` | Sem alteracao (movido para TabLinkPagamento) |
| `src/components/crm/modal/InvoiceSection.tsx` | Sem alteracao (movido para TabLinkPagamento) |
| `src/components/crm/modal/ClientHeader.tsx` | Removido do right panel (funcionalidade absorvida pelo header e StatusBlock) |

---

## 1. Modal Header — status badge adicionado

O header mantem "Ficha . [Nome]" a esquerda e Anterior/Proximo/X a direita.

Adicionar ao centro um badge compacto de estado:
- "Aguarda pagamento" com icone relogio (amber)
- "Pago -- EUR18,45" com check (green)
- "Gratuito . Passo 3/5" (grey)

Logica de determinacao:
- `inscrito.paid_at` presente -> "Pago -- EUR[valor]"
- `inscrito.payment_status === "awaiting_payment"` -> "Aguarda pagamento"
- `inscrito.payment_status === "selected"` -> "Seleccionou e saiu"
- default -> `"Gratuito . Passo ${inscrito.step_reached}/5"`

---

## 2. StatusBlock.tsx — card de estado na sidebar

Componente novo. Recebe `inscrito` como prop.

4 estados visuais mutuamente exclusivos:

**State A — Aguarda pagamento** (`payment_status === "awaiting_payment"`)
- Background amber claro, border amber
- Badge "Aguarda pagamento"
- Plano pendente (Premium/Masterclass/Bundle + preco)
- Idade do link: calcular `linkAgeH` a partir de `payment_link_created_at`
  - Se < 24h: "Link criado ha Xh . valido por Yh restantes"
  - Se >= 24h: "Link expirado" em vermelho
- Botao inline "Reenviar link" (chama callback)

**State B — Pago** (`paid_at !== null`)
- Background green claro
- Badge "Pago"
- Plano + valor (ex: "Premium Pass . EUR18,45")
- Data de pagamento
- Fatura: se `invoice_sent` false -> "Fatura por enviar" laranja + botao assinalar; se true -> "Fatura enviada" cinza

**State C — Gratuito, flow incompleto** (`payment_status === "free"` e `step_reached < 5`)
- Background slate claro
- Badge "Gratuito"
- "Passo N/5" com mini dots de progresso (5 circulos, preenchidos ate step_reached)
- "Saiu no passo N — [nome do passo]" se aplicavel

**State D — Flow completo gratuito** (`payment_status === "free"` e `step_reached >= 5`)
- Background blue claro
- Badge "Flow completo"
- "Completou todos os passos . Gratuito"
- "Nao converteu para pago"

Nomes dos passos para referencia: Inscricao(0), Origem(1), Duvida(2), Premium(3), Masterclass(4), Conclusao(5)

---

## 3. SidebarActions.tsx — accoes em 3 tiers

**TIER 1 — 1 botao primario, full width, preenchido:**
Determinado dinamicamente:
- Aguarda pagamento + link valido -> "Reenviar link de pagamento" (green)
- Aguarda pagamento + link expirado -> "Regenerar link" (amber)
- Pago + sem fatura -> "Assinalar fatura enviada" (green)
- Gratuito + flow completo -> "Enviar link de pagamento" (green)
- Gratuito + incompleto -> "Enviar Email" (blue)

**TIER 2 — 2-3 botoes secundarios, outlined:**
- "Enviar Email" (mailto)
- "Marcar Follow-up" (toggle)
- "Enviar check-in backlog" (se aplicavel: nao pago + plan_selected + nao do_not_contact)

**TIER 3 — destrutivos, separados por 8px gap, menores:**
- "Arquivar inscrito" (cinza, pequeno)
- "Eliminar definitivamente" (red text link, sem background)

Toda a logica de handlers existente (backlog, resend, regen, etc.) e passada via props do InscritoModal.

---

## 4. SidebarFunnel.tsx — mini-funil vertical compacto

5 linhas (uma por passo), cada com:
- Icone: checkmark (concluido) / seta (corrente) / circulo vazio (nao atingido) / traco (saltou)
- Nome do passo (11px)
- Estado a direita: "Concluido" / "Saltou" / "Nao atingiu"
- Passo actual em azul

Linha vermelha "SAIU AQUI" entre ultimo concluido e primeiro nao atingido (mesma logica do FunnelView existente).

Altura total: compacta, ~120px.

Substitui o selector de circulos numerados (1-5) que existe actualmente na sidebar. O selector de step_reached move-se para dentro deste componente ou para o TabResumo.

---

## 5. LEFT SIDEBAR — estrutura final

Ordem das seccoes (dark background #0F172A):

1. **Identity**: Avatar com iniciais, nome editavel + gender icons, badge de relacao (Cliente anterior / Inscrito anterior / Primeira vez), email, WhatsApp, "Inscrito em [data]"
2. **Divider** (1px rgba(255,255,255,0.06), margin 16px)
3. **StatusBlock** — card de estado (A/B/C/D)
4. **Divider**
5. **SidebarActions** — 3 tiers de accoes
6. **Divider**
7. **SidebarFunnel** — mini-funil vertical

---

## 6. RIGHT CONTENT — 4 tabs

Tab bar com pill style, left-aligned. Activo: #2563eb filled, white text. Inactivo: transparent, #666.

### Tab "Resumo" (default)

**ROW 1 — 3 cards compactos** (grid 3 colunas, gap 12px):
- Card A "Origem": icone, valor = source[0] abreviado, sub = "Como chegou"
- Card B "Webinar": icone (camera ou video), valor = "Video IA . 5 Mar" / "Imagens IA . 18 Fev", sub = "Evento inscrito"
- Card C "Qualificacao": icone, valor = role || "Nao preenchido", sub = team_size || ""

Cards: bg #f8fafc, border 1px solid #e2e8f0, border-radius 8px, padding 10px 14px

**ROW 2 — Duvida** (full width):
- Label "DUVIDA / OBJECTIVO" (uppercase, 11px, #888)
- Conteudo: texto da duvida em italic, bg grey card
- Se saltou: "Saltou esta pergunta" italic cinza

**ROW 3 — Funil horizontal** (full width, compacto):
- 5 pills horizontais: check (green) / traco (grey) / circulo (outline)
- Marcador "SAIU AQUI" entre passos
- "60% (3/5)" a direita

**ROW 4 — Historico cross-webinar** (collapsible, existente):
- Reutilizar exactamente o mesmo codigo/render dos cards de historico

### Tab "Actividade"

- Summary bar acima dos filtros: "[N] eventos . [N] emails . [N] pagamentos . [N] erros" (11px, #888)
- Abaixo: ActivityTimeline existente (sem alteracoes)

### Tab "Historico"

- Cards de historico cross-webinar (mesmos que no Resumo, mas aqui como seccao principal)
- Seccao de Notas (textarea + lista de notas existentes)

### Tab "Link e Pagamento"

- LinkFollowUpSection (existente, sem alteracao)
- InvoiceSection (existente, sem alteracao)
- Premium Grant toggle (existente)
- Gmail reminder card (quando gerado)
- ActionsSection de pagamento (botoes de link, reenvio, regenerar — existente)

---

## 7. Mobile (< 768px)

- Sidebar passa a strip horizontal compacta no topo: avatar + nome + badge de estado inline
- StatusBlock renderiza compacto (sem card, so badge)
- Area de conteudo full width
- Tab bar com scroll horizontal
- SidebarActions e SidebarFunnel movem-se para dentro do conteudo (abaixo das tabs)

---

## 8. Detalhes tecnicos

1. O smart alert de Masterclass cross-sell (linha 601-615 actual) move-se para dentro do Tab "Resumo", acima dos cards.

2. O ResendModal e SendPaymentModal continuam como overlay por cima do modal — sem alteracao.

3. Todos os hooks de estado (notaText, editingName, reminderData, messageLogs, crossHistory, etc.) permanecem no InscritoModal e sao passados via props aos sub-componentes.

4. As props do InscritoModal (interface InscritoModalProps) nao mudam.

5. Tipografia seguindo as specs:
   - Section labels: 10px, weight 700, letter-spacing 1.5px, #888, uppercase
   - Primary values: 14px, weight 600, #111
   - Secondary text: 12px, #666
   - Muted: 11px, #aaa

6. O "Primeira vez" badge (novo) aparece quando `!hasPaidBefore && !hasAttendedBefore`:
   - Background rgba(100,116,139,0.1), border rgba(100,116,139,0.2), color #64748b

7. O step_reached selector (botoes 1-5 com confirmacao) e removido da sidebar e integrado no SidebarFunnel como funcionalidade de click nos passos, ou movido para o tab Resumo como accao secundaria.
