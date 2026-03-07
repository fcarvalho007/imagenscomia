

# Plano: Webinar Switcher — Dropdown compacto na Sidebar

## Problema
O switcher de webinar está duplicado em 5 headers de vistas. Movê-lo para a sidebar como botões verticais não escala (2 webinars hoje, 5 amanhã). Além disso, mudar de webinar **já mantém** a aba activa (o estado `activeView` é independente do `webinarContext`), por isso não há bug a corrigir aí.

## Solução
Substituir os 5 `WebinarSwitcherBar` por um **dropdown compacto** na sidebar, logo abaixo do logo, que ocupa sempre o mesmo espaço independentemente do número de webinars.

```text
┌─────────────────────┐
│ ⚡ WebinarCRM        │
│ ┌─────────────────┐ │
│ │ 🎬 Vídeo IA   ▾ │ │  ← dropdown (select)
│ └─────────────────┘ │
├─────────────────────┤
│ Dashboard           │
│ Pipeline            │
│ Tabela              │
│ Faturação           │
│ ...                 │
└─────────────────────┘
```

O dropdown lista todas as opções: `⊕ Todos` / `📷 Imagens` / `🎬 Vídeo` — gerado dinamicamente a partir de `WEBINAR_CONFIG`. Escala para N webinars sem afectar a sidebar.

## Alterações (6 ficheiros)

### `src/components/crm/CRMSidebar.tsx`
- Importar `useWebinarContext` e `WEBINAR_CONFIG`
- Adicionar um `<select>` estilizado (fundo escuro, texto branco, border subtle) entre o logo e a nav
- O select muda `setWebinarContext` — o `activeView` permanece inalterado
- Opções: "⊕ Todos", e uma entrada por cada key em `WEBINAR_CONFIG` com emoji + label

### Remover `WebinarSwitcherBar` de 5 vistas:
- `src/components/crm/DashboardView.tsx` — remover import e `<WebinarSwitcherBar />`
- `src/components/crm/PipelineView.tsx` — idem
- `src/components/crm/TableView.tsx` — idem
- `src/components/crm/FollowUpView.tsx` — idem
- `src/components/crm/TrashView.tsx` — idem

### Ficheiro `WebinarSwitcherBar.tsx`
Manter — pode ser útil noutros contextos, mas deixa de ser usado nas vistas principais.

## Comportamento confirmado
Mudar de webinar **não reinicia** a vista activa. Se estás em Faturação e mudas para Imagens, continuas em Faturação. Isto já funciona porque `activeView` e `webinarContext` são estados independentes.

