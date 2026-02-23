

# Redesign Follow-up para "Automacoes"

## Resumo

Renomear a seccao "Follow-up" para "Automacoes" no sidebar e header, reorganizar os tabs, e criar um novo tab "Fluxo" com timeline visual dos emails automaticos por webinar.

---

## 1. Sidebar rename

**Ficheiro:** `src/components/crm/CRMSidebar.tsx` (linha 18)

Alterar:
```
{ icon: Zap, label: "Follow-up", view: "templates" },
```
Para:
```
{ icon: Zap, label: "Automações", view: "templates" },
```

---

## 2. Page header

**Ficheiro:** `src/components/crm/FollowUpView.tsx`

Alterar titulo e subtitulo (linhas 90-91 e 106-107):

- Titulo: `"Automações de Email"`
- Subtitulo: `"Fluxo de emails automáticos, estado dos envios e edição de templates"`
- Mesma alteracao no empty state do video (linhas 90-91)

---

## 3. Nova estrutura de tabs

**Ficheiro:** `src/components/crm/FollowUpView.tsx`

Substituir os 3 tabs actuais por 4 novos:

| Tab | Value | Conteudo |
|-----|-------|----------|
| Fluxo | `fluxo` | Novo componente `AutomationFlowTab` |
| Metricas | `metricas` | Componente `FollowUpOverview` existente (sem alteracoes) |
| Pessoas | `pessoas` | Conteudo actual do tab "audit" (sub-tabs Pessoas/Envios, sem alteracoes) |
| Templates | `templates` | Componente `TemplatesView` existente (sem alteracoes) |

Default active: `fluxo` (em vez do actual `overview`).

Estilo dos tabs: pill tabs com active = filled blue, inactive = ghost (mesmo estilo ja usado no switcher de sub-tabs Pessoas/Envios — botoes com `background: "#2563EB"` quando activo).

Substituir o `TabsList`/`TabsTrigger` do Radix por botoes pill custom (consistente com o padrao existente no CRM):

```tsx
const TABS = [
  { key: "fluxo", label: "Fluxo" },
  { key: "metricas", label: "Métricas" },
  { key: "pessoas", label: "Pessoas" },
  { key: "templates", label: "Templates" },
];
```

---

## 4. Novo componente `AutomationFlowTab`

**Novo ficheiro:** `src/components/crm/AutomationFlowTab.tsx`

### Props

```ts
interface Props {
  inscritos: Inscrito[];
  logs: MessageLog[];
  logsLoading: boolean;
}
```

### Logica de dados

Para cada node de email, contar envios e falhas a partir dos `logs` existentes (ja carregados em `FollowUpView`). Mapear `template_key` para cada node:

| Node | template_key esperado |
|------|----------------------|
| Confirmacao imediata | Logs com `template_key` que contem "confirmation" ou "stage_0" |
| Lembrete 48h | `send-video-reminder-48h` ou similar |
| Lembrete 24h | `send-video-reminder-24h` ou similar |
| Comeca em 1 hora | `send-video-reminder-1h` ou similar |
| Pos-webinar | `send-video-postwebinar` ou similar |

Abordagem pragmatica: agrupar logs por `template_key`, mostrar contagens reais. Se nenhum log corresponder a um node, mostrar "—".

### Status bar (CHANGE 5)

Acima da timeline, barra horizontal de resumo:

```text
[circulo verde] Sistema operacional  ·  [icone email] N emails enviados  ·  [X] N falhas  ·  [relogio/check] Proximo envio ou Ciclo completo
```

- Contar total de emails enviados: `logs.filter(l => l.provider === "resend" && l.status === "sent").length`
- Contar falhas: `logs.filter(l => l.status === "failed").length`
- Para video: "Proximo envio: Lembrete 48h - 3 Mar as 10h00" (calculado a partir de `VIDEO_WEBINAR_DATE`)
- Para imagens: "Ciclo completo — webinar realizado a 18 Fev"

Estilo:
- `background: rgba(22,163,74,0.04)`, `border: 1px solid rgba(22,163,74,0.15)`, `border-radius: 8px`, `padding: 10px 16px`, `font-size: 12px`
- Items separados por ` · `

### Timeline visual

Layout: `max-w-[800px] mx-auto`, linha vertical tracejada `#e2e8f0` a ligar os nodes.

Implementacao CSS: cada node e um `div` relativo, com um pseudo-elemento ou `div` para a linha tracejada vertical entre nodes.

#### Estrutura de nodes (7 nodes por webinar)

Cada node e um card com:
- Left border 4px solid (cor depende do tag)
- `background: white`, `border: 1px solid #e2e8f0`, `border-radius: 10px`, `padding: 16px 20px`
- Layout: `flex justify-between items-start`
- Esquerda: icone + titulo (font-heading 14px bold) + subtitulo (12px #64748B) + tag badge
- Direita: stats (12px #888) + botao accao opcional

#### Tags (badges)

| Tag | Background | Color |
|-----|-----------|-------|
| IMEDIATO | #dcfce7 | #16a34a |
| AGENDADO | #dbeafe | #1d4ed8 |
| ENVIADO | #dcfce7 | #16a34a |
| MANUAL | #fef3c7 | #d97706 |
| ERRO | #fee2e2 | #dc2626 |

Estilo: `font-size: 9px`, `padding: 2px 8px`, `border-radius: 20px`, `font-weight: 700`, uppercase

#### Logica de tag por node

- Determinar se o webinar ja aconteceu: `WEBINAR_CONFIG[ctx].startDate < now`
- Se sim: tag = "ENVIADO" (se existem logs) ou "—" (se nao)
- Se nao: tag = "AGENDADO"
- Node "Confirmacao imediata": sempre "IMEDIATO" (ou "ENVIADO" se webinar passado)
- Node "Pos-webinar": tag "MANUAL" se webinar video e ainda nao enviado

#### Condicoes entre nodes

Labels centrados na linha tracejada:
- Entre node 2-3: "48H ANTES DO WEBINAR"
- Entre node 3-4: "24H ANTES DO WEBINAR"
- Entre node 4-5: "1H ANTES DO WEBINAR"
- Entre node 5-6: "APOS O WEBINAR"

Estilo: `font-size: 11px`, `color: #aaa`, `letter-spacing: 1px`, uppercase

#### Node especial: Trigger (node 1)

- Left border: `#7c3aed` (purple)
- Icone: Users (lucide)
- Titulo maior: "Inscricao submetida"
- Subtitulo: "Webinar [nome] . imagenscomia.com/video"
- Stat direita: "[N] inscricoes" — `inscritos.filter(i => matchWebinar(i)).length`

#### Node especial: End (node 7)

- Left border: `#94A3B8` (grey)
- Fundo ligeiramente mais claro: `background: #F8FAFC`
- Icone: CheckCircle2 (lucide)
- Titulo: "Fluxo concluido"
- Subtitulo: "Inscrito recebeu todos os emails do ciclo"

#### Botao "Ver email" em cada email node

Cada email node tem um link "Ver email →" a direita.
Ao clicar: `toast("Editor de email — disponível em breve")` (sonner toast).

#### Botao "Enviar agora" no node pos-webinar (video)

So visivel quando `Date.now() > VIDEO_WEBINAR_DATE.getTime()`.
Reutilizar a logica do `PostWebinarAction` existente em `DashboardView.tsx`:
- Ao clicar: modal de confirmacao inline
- Confirmar: chama `supabase.functions.invoke("send-video-postwebinar", { body: { manual: true } })`
- Feedback: alert com resultado

### Contexto consolidado

Quando `webinarContext === "consolidado"`: renderizar duas colunas lado a lado.

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div>
    <h3>📷 Imagens IA · 18 Fev 2026</h3>
    <Timeline webinar="imagens" ... />
  </div>
  <div>
    <h3>🎬 Vídeo IA · 2 Mar 2026</h3>
    <Timeline webinar="video" ... />
  </div>
</div>
```

A status bar no modo consolidado mostra totais agregados.

---

## Ficheiros a criar/modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/crm/CRMSidebar.tsx` | Label "Follow-up" → "Automacoes" |
| `src/components/crm/FollowUpView.tsx` | Header, tabs, default tab, importar AutomationFlowTab |
| `src/components/crm/AutomationFlowTab.tsx` | **NOVO** — status bar + timeline visual |

Nenhuma alteracao a dados, queries, edge functions, autenticacao ou outras views do CRM.

