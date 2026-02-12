

## Duas alteracoes: imagem do livro + leaderboard de convites no CRM

### 1. Substituir imagem do livro no Passo 5

**Problema:** A imagem atual e um placeholder gerado. O utilizador enviou a capa real do livro "Guia Essencial SEO".

**Solucao:**
- Copiar a imagem enviada para `src/assets/livro-guia-seo.png`
- No ficheiro `src/components/upgrade/StepConfirmation.tsx`, importar a imagem como modulo ES6 e substituir o `src="/guia-essencial-seo.png"` pela importacao

### 2. Adicionar Leaderboard de Convites ao CRM Dashboard

**Objetivo:** Mostrar no Dashboard quem esta a convidar amigos, quantos convites cada pessoa fez, e quem ja atingiu o minimo de 2 convites (habilitado a ganhar o livro). Assim o utilizador sabe quantos livros precisa de oferecer.

**Implementacao:**
- No `DashboardView.tsx`, adicionar um novo bloco "Leaderboard de Convites" que:
  - Busca dados da edge function `get-leaderboard` (ja existente)
  - Mostra uma tabela/lista com: posicao, nome (anonimizado), numero de convites
  - Destaca com check verde quem tem 2 ou mais convites (habilitado ao livro)
  - Mostra um resumo no topo: "X participantes habilitados ao livro"
  - Usa medalhas dourada/prateada/bronze para o Top 3

**Dados:** Reutiliza a edge function `get-leaderboard` que ja existe e retorna `{ name, count, referralCode }[]` ordenado por count descendente.

### Resumo tecnico

| Ficheiro | Alteracao |
|---|---|
| `src/assets/livro-guia-seo.png` | Novo - imagem real do livro copiada do upload |
| `src/components/upgrade/StepConfirmation.tsx` | Import da imagem e substituicao do src |
| `src/components/crm/DashboardView.tsx` | Novo bloco "Leaderboard de Convites" com fetch a get-leaderboard, lista com medalhas, indicador de habilitados ao livro |

