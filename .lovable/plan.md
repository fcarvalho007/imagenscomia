

# Refinamentos Mobile do CRM

## Problemas identificados

### 1. DashboardView — Acções Manuais overflow em mobile
A secção `PostWebinarAction` (linha ~1148) usa `flex items-center justify-between` com botões de texto longo que não quebram em 375px. Os botões de confirmação ("Sim, enviar agora" + "Cancelar") também ficam lado a lado sem wrap.

### 2. DashboardView — Email Follow-up header overflow
A secção de "Emails de Follow-up Resend" (linha ~682-698) tem o badge de status ("A funcionar normalmente") no `ml-auto` que não encaixa em mobile. Precisa de `flex-wrap` e ajuste.

### 3. DashboardView — Live Results grid
Grid `grid-cols-5 max-md:grid-cols-3 max-sm:grid-cols-2` (linha 661) — adequado, mas os valores grandes de "Duração média" podem truncar. Adicionar `break-words`.

### 4. DashboardView — Dúvidas header badges
A secção de "Dúvidas dos Inscritos" (linha ~1018-1030) tem badges em `flex items-center gap-2` sem `flex-wrap`, causando overflow horizontal em mobile.

### 5. AutomationFlowTab — Node cards SMS right panel
O painel SMS direito (linha ~1383) tem `maxWidth: 300` fixo e o card usa `flex justify-between items-start gap-4`. Em 375px, o conteúdo fica esmagado. Precisa de `flex-wrap` e reduzir `minWidth`.

### 6. AutomationFlowTab — Consolidado 2-column grid
A view consolidada (linha ~1815) usa `grid-cols-1 lg:grid-cols-2` — OK, mas as sub-tab pills e a SheetContent SMS têm `w-[400px]` fixo que transborda em mobile.

### 7. ComunicacaoView — Padding mobile
Padding `p-6 md:p-8` está adequado, mas poderia ser `p-4 md:p-8` para 375px.

### 8. FollowUpView — Tab pills
As tabs "Fluxo", "Métricas", "Pessoas", "Templates" precisam de scroll horizontal em mobile.

## Plano de implementação

| Ficheiro | Alterações |
|---|---|
| `DashboardView.tsx` | (1) PostWebinarAction: wrap botões em mobile com `flex-wrap`; (2) Email Follow-up header: `flex-wrap`; (3) Dúvidas header: `flex-wrap`; (4) KPI font-size `text-[24px] sm:text-[32px]` para caber melhor |
| `AutomationFlowTab.tsx` | (1) Node cards: reduzir `minWidth` para `80` em right panel, adicionar `max-sm:flex-wrap`; (2) SMS SheetContent: `w-full sm:w-[400px] sm:max-w-[400px]`; (3) SMS panel `maxWidth`: remover ou usar `max-sm:max-w-[200px]` |
| `ComunicacaoView.tsx` | Reduzir padding mobile para `p-4 md:p-8` |
| `FollowUpView.tsx` | Tabs com `overflow-x-auto` e `whitespace-nowrap` |

Todas as alterações são CSS/className — sem mudanças de lógica.

