

# Redesign do fluxo de Automações — agrupamento por dia + UX visual

## Problema actual

O fluxo é uma lista vertical plana de 20+ cards individuais separados por linhas tracejadas finas. Não há hierarquia visual clara — é difícil perceber rapidamente "o que acontece no Dia 1 vs Dia 3 vs Dia 5". As secções existentes (PRÉ-WEBINAR, APÓS O WEBINAR, etc.) são apenas linhas com texto minúsculo.

## Proposta

### 1. Agrupamento em blocos por fase/dia

Substituir os `SectionDivider` por **containers visuais** (cards grandes com fundo subtil e borda lateral colorida). Cada bloco agrupa os nodes que pertencem ao mesmo momento temporal:

```text
┌──────────────────────────────────────────────┐
│  ₀   PRÉ-WEBINAR                            │
│  D                                           │
│      [Trigger] [Confirmação] [Follow-up]     │
│      [Lembrete 48h] [Lembrete 24h] [1h]     │
└──────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│  ₀   DIA DO WEBINAR                         │
│  D                                           │
│      [Email pós-webinar]                     │
└──────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│  ₁   DIA 1 — 6 MARÇO                        │
│  D                                           │
│      [Email Dia 1] [SMS follow-up Dia 1]     │
│      [Recursos Premium] [Recursos MC]        │
│      [Recursos Bundle] [SMS Recursos x3]     │
└──────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│  ₃   DIA 3 — 8 MARÇO                        │
│  D                                           │
│      [Email Dia 3] [SMS pós-webinar]         │
└──────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│  ₅   DIA 5 — FECHO                          │
│  D                                           │
│      [Email de fecho]                        │
│      [SMS lembrete Q&A] [SMS Masterclass]    │
└──────────────────────────────────────────────┘
```

### 2. Números cinematográficos grandes

Cada bloco terá um **número grande** (font-size ~48px, font-weight 800, cor muito clara como `#e2e8f0`) posicionado no canto superior esquerdo do container, com o texto da secção ao lado. Ex: `0` para pré-webinar, `1` para Dia 1, `3` para Dia 3, `5` para fecho.

### 3. Conectores com setas

Substituir as linhas tracejadas entre blocos por um conector com **seta sólida para baixo** (`▼` ou ícone SVG `ChevronDown`), centrado, com cor `#cbd5e1`.

### 4. Cores por fase

Cada bloco terá uma borda esquerda grossa (4px) com cor temática:
- Pré-webinar: `#3b82f6` (azul)
- Confirmações de compra: `#16a34a` (verde) — já existente como sub-bloco
- Dia 1: `#f59e0b` (âmbar)
- Dia 3: `#f59e0b` (âmbar)
- Fecho: `#ef4444` (vermelho)

### 5. Cards internos simplificados

Dentro de cada bloco, os cards individuais mantêm a estrutura actual mas **sem a borda esquerda grossa** (já está no container pai). Ficam mais leves — sem `box-shadow`, fundo branco, borda fina `#f1f5f9`.

## Implementação técnica

### Ficheiro alterado
- `src/components/crm/AutomationFlowTab.tsx`

### Alterações:
1. **Adicionar `dayGroup` a cada `NodeDef`** — novo campo opcional (`dayGroup?: string`) que define a que bloco pertence (ex: `"pre"`, `"d0"`, `"d1"`, `"d3"`, `"d5"`, `"compra"`)
2. **Novo componente `DayGroupContainer`** — renderiza o bloco visual com número grande, título, borda colorida e background subtil
3. **Refactoring do render na `Timeline`** — agrupar nodes consecutivos com o mesmo `dayGroup` num único container, em vez de renderizar individualmente
4. **Novo componente `ArrowConnector`** — substitui o `Connector` actual com uma seta `ChevronDown`
5. **Manter todo o comportamento existente** — SMS send, email editor, contadores, drawer — apenas muda a apresentação visual

Não há alterações de base de dados nem de edge functions.

