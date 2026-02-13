

## Correcoes: Precos, Pipeline e Funil

### 1. Corrigir preco do Bundle (bug)

O bundle esta com valor errado em dois sitios:

**`src/hooks/useInscritos.ts` (linha 10)**:
- De: `bundle: 72.81`
- Para: `bundle: 76.26`

**`src/components/crm/DashboardView.tsx` (linha 41)**:
- De: `bundle: { ..., label: "Bundle €72,81" }`
- Para: `bundle: { ..., label: "Bundle €76,26" }`

### 2. Simplificar o funil de inscricao — remover duplicacao

Actualmente o drop-off aparece duas vezes:
- Inline entre barras (ex: "-5 pessoas (19% drop)")
- Box vermelho no final ("Maior saida: entre Passo 3 e Passo 4...")

**Remover o box vermelho do final** (linhas 236-242). A informacao inline ja e suficiente e mais clara porque esta no sitio exacto onde acontece a perda.

### 3. Adicionar secccao Pipeline abaixo dos KPIs

Criar um card dedicado entre os KPIs e o alerta de pendentes que mostra:
- Numero de pendentes e valor potencial total
- Breakdown: "X Premium (Y euros) + Z Bundle (W euros)"
- Subtexto: "Receita que pode converter se pagarem"

Isto separa claramente dados confirmados (KPIs) de intencoes (Pipeline).

### Ficheiros afectados

| Ficheiro | Alteracao |
|---|---|
| `src/hooks/useInscritos.ts` | Corrigir bundle: 72.81 para 76.26 |
| `src/components/crm/DashboardView.tsx` | Corrigir label bundle; remover box duplicado do funil; adicionar card Pipeline |

