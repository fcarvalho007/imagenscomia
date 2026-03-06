

# Alinhar Pipeline CRM com /comprar

## Problema

O Pipeline no CRM mostra nomes e preços antigos (ex: "Premium Pass — €27", "Masterclass — €57,81", "Bundle — €76,26") que não correspondem à estrutura actual do /comprar:

| /comprar | Pipeline actual | Pipeline correcto |
|---|---|---|
| Sessão Prática · €27+IVA | "Premium" | "Sessão Prática" |
| Masterclass Vídeo · €67+IVA | "Masterclass" | "Masterclass Vídeo" |
| Pack IA Completo · €107+IVA | "Bundle" | "Pack IA Completo" |

O Pack IA Completo inclui agora a secção de Imagens com IA, o que deve ser reflectido nos badges e cards.

## Alterações

### `src/components/crm/PipelineView.tsx`

1. **Actualizar `COLUMNS`** — renomear títulos para alinhar com /comprar:
   - `premium` → "Sessão Prática"
   - `masterclass` → "Masterclass Vídeo"
   - `bundle` → "Pack IA Completo"

2. **Actualizar `PLAN_BADGE`** — labels nos cards:
   - `premium` → "Sessão Prática"
   - `masterclass` → "MC Vídeo"
   - `bundle` → "Pack Completo"
   - `gravacao` → "Sessão Prática" (consistência)

3. **Pós-webinar `visibleColumns`** — no filtro pós-webinar, mostrar os preços correctos com IVA nos títulos das colunas (€33,21 / €82,41 / €131,61) para referência rápida.

4. **Card do Pack IA Completo** — adicionar indicador visual no badge quando `plan === "bundle"` para mostrar que inclui Imagens (ex: badge extra "IMG+VID" ou sub-texto).

