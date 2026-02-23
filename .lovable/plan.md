

# Templates Tab — Filtro por Webinar + Badges

## Resumo

3 alteracoes cirurgicas: filtrar templates pelo webinarContext, adicionar badge de webinar a cada linha, e mudar o default de "imagens" para "video".

---

## Ficheiros a modificar

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/TemplatesView.tsx` | Import useWebinarContext, filtrar activeTemplates, adicionar badges, render com grupos no modo consolidado |
| `src/contexts/WebinarContext.tsx` | Mudar useState default de "imagens" para "video" |

---

## 1. WebinarContext.tsx — mudar default

Linha 12: mudar `useState<WebinarCtxType>("imagens")` para `useState<WebinarCtxType>("video")`.

---

## 2. TemplatesView.tsx — import e filtragem

Adicionar import no topo:
```
import { useWebinarContext } from "@/contexts/WebinarContext";
```

Dentro do componente, chamar o hook:
```
const { webinarContext } = useWebinarContext();
```

Criar helper para classificar templates:
```
function getTemplateWebinar(key: string): "imagens" | "video" {
  if (key.startsWith("video_")) return "video";
  return "imagens"; // followup_ and imagens_ both belong to imagens
}
```

Criar memo `filteredTemplates` derivado de `activeTemplates`:
- Se `webinarContext === "imagens"`: filtrar onde `key.startsWith("imagens_") || key.startsWith("followup_")`
- Se `webinarContext === "video"`: filtrar onde `key.startsWith("video_")`
- Se `webinarContext === "consolidado"`: manter todos (agrupamento visual no render)

---

## 3. TemplatesView.tsx — badges na coluna Nome

Na celula `<td>` do Nome (linha 224), abaixo do nome do template, adicionar badge inline:

- `video_*`: Badge "🎬 Video" — `background: rgba(22,163,74,0.1)`, `color: #16a34a`
- `imagens_*`: Badge "📷 Imagens" — `background: rgba(30,64,175,0.1)`, `color: #1e40af`
- `followup_*`: Badge "📷 Imagens . Follow-up" — mesma cor azul

Estilo do badge: `font-size: 9px`, `padding: 2px 7px`, `border-radius: 10px`, `font-weight: 600`, `display: inline-block`, `margin-top: 3px`

---

## 4. TemplatesView.tsx — render com grupos no modo consolidado

No tbody:

Se `webinarContext !== "consolidado"`: render simples das `filteredTemplates` (como actualmente, mas com badge).

Se `webinarContext === "consolidado"`: render em 2 grupos:

**Grupo 1** — header row com colspan total:
- "📷 WEBINAR IMAGENS IA"
- Estilo: `font-size: 11px`, `font-weight: 700`, `color: #888`, `letter-spacing: 1.5px`, `text-transform: uppercase`, `padding: 8px 16px`, `border-bottom: 1px solid #f0f0f0`
- Seguido das rows de templates `imagens_*` e `followup_*`

**Grupo 2** — header row:
- "🎬 WEBINAR VIDEO IA"
- Mesmo estilo
- Seguido das rows de templates `video_*`

Os group headers sao `<tr>` com um unico `<td colSpan={8}>`.

---

## O que NAO muda

- Logica de edicao, save, versioning, restore, toggle active
- Modal de edicao (permanece identico)
- Historico de versoes inline
- Nenhuma outra tab de Automacoes (Fluxo, Metricas, Pessoas)
- Nenhuma outra view do CRM

