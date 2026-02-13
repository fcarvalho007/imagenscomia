
## Melhorias no CRM: localStorage, duvidas e funil

### 1. Migrar genero de localStorage para a base de dados

**Problema**: O genero alterado manualmente no CRM e gravado em `localStorage`, que e isolado por dominio. Se alterar no site publicado, nao aparece no preview do Lovable (e vice-versa).

**Solucao**: Adicionar uma coluna `gender_override` (texto, nullable) a tabela `registrations`. Quando o utilizador altera o genero no CRM, grava na BD em vez do localStorage. Assim sincroniza entre todos os dominios.

| Ficheiro | Alteracao |
|---|---|
| Migration SQL | `ALTER TABLE registrations ADD COLUMN gender_override text;` |
| `src/hooks/useInscritos.ts` | Remover funcoes `loadGenderOverrides`/`saveGenderOverride` do localStorage. O `setGender` passa a fazer `supabase.update({ gender_override })`. O `mapRegistration` usa `r.gender_override \|\| detectGender(r.name)` |

### 2. Distinguir duvidas personalizadas ("Outro") na lista

**Problema**: Actualmente nao ha forma de saber se a duvida foi texto livre personalizado ou apenas uma seleccao das opcoes pre-definidas.

**Solucao**: Na lista "Duvidas dos Inscritos" do Dashboard, as entradas que contem "Outro:" recebem um badge especial (ex: etiqueta "Personalizada" em destaque). Alem disso, as duvidas que contem texto livre aparecem primeiro na lista (ordenadas por prioridade), para facilitar a leitura das respostas mais relevantes.

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/DashboardView.tsx` | Na seccao "Duvidas dos Inscritos": (1) ordenar colocando as que contem "Outro:" no topo, (2) adicionar badge "Personalizada" em cor diferente (ex: amber) quando a duvida inclui "Outro:", (3) para as restantes manter o badge actual |

### 3. Grafico de dificuldades mais comuns (barras horizontais)

**Problema**: Nao ha visibilidade sobre quais as dificuldades mais escolhidas no passo de multi-seleccao.

**Solucao**: Adicionar um novo bloco no Dashboard com um grafico de barras horizontais que conta quantas vezes cada opcao das 5 pre-definidas foi seleccionada. Inclui tambem a contagem de respostas "Outro" como categoria separada.

As 5 opcoes pre-definidas sao:
- "Nao sei descrever o estilo visual que quero"
- "Os resultados ficam sempre genericos, sem identidade"
- "Nao percebo que ferramenta usar (ChatGPT, Google, outros...)"
- "Quero criar imagens para a minha marca mas nao sei por onde comecar"
- "Tenho dificuldade em editar ou refinar as imagens geradas"

O grafico fica entre a seccao "Fontes de Origem / Distribuicao por Plano" e a seccao "Duvidas dos Inscritos".

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/DashboardView.tsx` | Novo bloco "Dificuldades Mais Comuns" com barras horizontais. Parse de cada `duvida` (split por ", ") e contagem por opcao. Labels abreviados para caber (ex: "Descrever estilo visual", "Resultados genericos", "Ferramenta certa", "Comecar do zero", "Editar/refinar"). Barra + contagem + percentagem. |

### 4. Funil com indicadores de drop-off entre passos

**Problema**: O funil actual mostra os numeros absolutos mas nao evidencia onde esta a maior perda de pessoas.

**Solucao**: Adicionar entre cada passo do funil uma linha de "drop-off" que mostra quantas pessoas sairam nesse ponto e a percentagem de perda. O maior drop-off recebe destaque visual (cor vermelha/texto bold) para identificacao rapida.

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/DashboardView.tsx` | No bloco "Funil de Inscricao": entre cada barra, inserir uma linha compacta com seta para baixo + texto "−X pessoas (Y% drop)" em cinza. O passo com maior drop-off fica destacado em vermelho. Adicionar um callout no final tipo "Maior saida: entre Passo X e Passo Y" |

---

### Resumo de ficheiros afectados

| Ficheiro | Alteracoes |
|---|---|
| Migration SQL | Nova coluna `gender_override` |
| `src/hooks/useInscritos.ts` | Migrar genero de localStorage para BD |
| `src/components/crm/DashboardView.tsx` | (1) Grafico de dificuldades, (2) Drop-off no funil, (3) Badge "Personalizada" nas duvidas |
