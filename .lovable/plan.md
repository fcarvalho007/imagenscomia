

# Auditoria CRM pós-webinar — Preços e dados desactualizados

## Problemas encontrados

### 1. Preços errados em todo o CRM (`PLAN_VALUES`)
O ficheiro `src/hooks/useInscritos.ts` (linha 7-11) tem preços antigos que não correspondem à nova estrutura:

| Plano | Valor actual no CRM | Valor correcto (c/ IVA) |
|---|---|---|
| premium (vídeo) | €15 | €33,21 |
| masterclass (vídeo) | €57,81 | €82,41 |
| bundle (vídeo) | €76,26 | €131,61 |

Isto afecta **todas as métricas de receita** no Dashboard (total, ticket médio, pipeline).

### 2. Labels de preço desactualizados no Dashboard e Pipeline
- `DashboardView.tsx` linha 75-78: "Premium €15", "MC €57,81", "Bundle €76,26"
- `PipelineView.tsx` linha 60-62: "Premium Pass — €15", "Masterclass — €57,81", "Bundle — €76,26"

### 3. Contagem de pessoas pós-evento
A base de dados tem **5 registos** criados após 5 de Março 11:00 UTC (Susana Vieira, Jéssica, Lúcia Furtado, Diana Ramos, Rita). Os 5 pagamentos pós-webinar (Andre Cunha, Jessica Castro, José Moreira, Vanessa Amaral, Susana Vieira) são de pessoas que se inscreveram **antes** do webinar — estão correctamente no fluxo pré-webinar. A separação pré/pós-evento baseia-se na data de inscrição, não na data de pagamento, o que está correcto.

Se o utilizador vê apenas 2 no CRM, pode ser um problema de cache ou de renderização no componente — vou verificar e corrigir.

## Correcções

### `src/hooks/useInscritos.ts`
- Tornar `PLAN_VALUES` sensível ao webinar:
  - **Imagens**: premium=18.45, masterclass=57.81, bundle=76.26
  - **Vídeo**: premium=33.21, masterclass=82.41, bundle=131.61
- Actualizar `mapRegistration` para usar o webinar do registo no cálculo do `valor`

### `src/components/crm/DashboardView.tsx`
- Actualizar `PLAN_BADGE_MAP` com preços correctos para vídeo:
  - premium → "€33,21", masterclass → "€82,41", bundle → "€131,61"
- Tornar os labels dinâmicos com base no contexto do webinar

### `src/components/crm/PipelineView.tsx`
- Actualizar `COLUMNS` e `PLAN_BADGE` com preços correctos
- Tornar dinâmico por webinar

