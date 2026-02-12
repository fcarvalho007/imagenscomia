

## Detetar genero por nome e mostrar emoji no CRM

### Resumo

Adicionar detecao automatica de genero baseada em nomes portugueses comuns, com emoji junto ao nome em todas as vistas do CRM, possibilidade de correcao manual na ficha individual, e estatisticas no dashboard.

### Alteracoes

#### 1. Criar utilitario de detecao de genero

**Novo ficheiro:** `src/lib/genderDetection.ts`

Uma funcao `detectGender(nome: string)` que:
- Extrai o primeiro nome
- Compara contra um dicionario de ~150 nomes portugueses comuns (masculinos e femininos)
- Retorna `"M"`, `"F"` ou `"U"` (indefinido)

Dicionario incluira nomes como: Ana, Maria, Sofia, Joana, Catarina, Ines, Mariana, Beatriz, Rita, Sara (femininos) e Joao, Pedro, Miguel, Andre, Tiago, Diogo, Rui, Nuno, Hugo, Carlos (masculinos), entre muitos outros.

#### 2. Adicionar campo gender ao tipo Inscrito

**Ficheiro:** `src/pages/crm/mockData.ts`

Adicionar campo opcional `gender?: "M" | "F" | "U"` ao tipo `Inscrito`.

#### 3. Aplicar detecao automatica no hook

**Ficheiro:** `src/hooks/useInscritos.ts`

Na funcao `mapRegistration`, chamar `detectGender(nome)` para preencher o campo `gender` automaticamente.

#### 4. Persistir correcoes manuais em localStorage

Quando o utilizador altera o genero manualmente na ficha, guardar num mapa `{ [id]: "M"|"F"|"U" }` em localStorage (`crm_gender_overrides`). Ao carregar os dados, aplicar os overrides por cima da detecao automatica.

Adicionar funcao `setGender(id, gender)` ao hook `useInscritos`.

#### 5. Mostrar emoji junto ao nome em todas as vistas

Criar funcao helper `genderEmoji(gender)` que retorna:
- `"M"` → `"🔵"`
- `"F"` → `"🌸"`
- `"U"` → `"⚪"`

Aplicar em:
- **DashboardView** — na lista de duvidas e no bloco "Para Fazer Hoje"
- **TableView** — na coluna Nome
- **PipelineView** — nos cards
- **InscritoModal** — junto ao nome no header
- **TrashView** — se aplicavel

#### 6. Botao de correcao manual na ficha individual

**Ficheiro:** `src/components/crm/InscritoModal.tsx`

Junto ao nome, adicionar os 3 emojis clicaveis (🔵 🌸 ⚪) como pequenos botoes. O ativo fica com fundo destacado. Ao clicar, chama `onSetGender(id, gender)` que atualiza o estado e persiste no localStorage.

#### 7. Estatistica de genero no Dashboard

**Ficheiro:** `src/components/crm/DashboardView.tsx`

Adicionar um bloco novo abaixo das "Fontes de Origem" ou "Distribuicao por Plano" com:

| Elemento | Detalhe |
|---|---|
| Titulo | "Genero (estimativa por nome)" |
| Barras | 3 barras horizontais: Masculino (🔵), Feminino (🌸), Indefinido (⚪) |
| Contagem | Numero e percentagem para cada |

### Resumo tecnico

| Ficheiro | Alteracao |
|---|---|
| `src/lib/genderDetection.ts` | Novo — dicionario de nomes PT e funcao de detecao |
| `src/pages/crm/mockData.ts` | Adicionar campo `gender` ao tipo `Inscrito` |
| `src/hooks/useInscritos.ts` | Detecao automatica + overrides localStorage + funcao `setGender` |
| `src/components/crm/DashboardView.tsx` | Emoji nos nomes + bloco de estatisticas de genero |
| `src/components/crm/TableView.tsx` | Emoji junto ao nome na tabela |
| `src/components/crm/PipelineView.tsx` | Emoji junto ao nome nos cards |
| `src/components/crm/InscritoModal.tsx` | Emoji + botoes de correcao manual |
| `src/pages/CRM.tsx` | Passar `setGender` ao modal |

