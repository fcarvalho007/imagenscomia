

## Refinar a pagina /convites

### Problema
Muitos utilizadores chegam a esta pagina vindos de um email e nao sabem como funciona o sistema de referrals. A pagina actual so mostra um campo de email para verificar convites -- nao explica a mecanica, nao tem leaderboard, e nao permite inscrever-se directamente.

### Solucao: Redesenhar a pagina em 3 blocos

#### Bloco 1 -- Hero explicativo (visivel antes de introduzir email)
- Titulo: "Convida amigos, ganha premios"
- Explicacao curta e visual da mecanica em 3 passos (estilo icon + texto):
  1. "Partilha o teu link pessoal"
  2. "2 amigos inscrevem-se"
  3. "Desbloqueia o Premium Pass gratis"
- Nota de bonus: badge/destaque com "Top 3 referrers ganham o livro fisico 'Guia Essencial SEO' + surpresas"
- Manter o formulario de email para quem ja esta inscrito ("Ja te inscreveste? Verifica os teus convites")
- Adicionar link "Ainda nao te inscreveste?" que abre o modal de registo existente (`useRegistrationModal`)

#### Bloco 2 -- Painel pessoal (visivel apos verificar email -- ja existe, refinar)
- Manter: barra de progresso, link pessoal, botoes WhatsApp/Email, lista de amigos registados
- Adicionar: nota do bonus do livro se estiver no top 3 (ou motivacional se nao estiver)

#### Bloco 3 -- Leaderboard publico (visivel sempre, abaixo do hero ou do painel pessoal)
- Mostrar top 10 referrers (primeiro nome + inicial do ultimo nome + numero de convites)
- Destacar top 3 com badge dourado/prata/bronze
- Se o utilizador ja verificou o email, destacar a sua posicao no ranking
- Dados vem de uma nova edge function `get-leaderboard` que retorna dados anonimizados

### Nova edge function: `get-leaderboard`
- Query: agrupa registrations por `referred_by`, conta convites, junta com o nome do referrer
- Retorna array ordenado: `[{ name: "Frederico C.", count: 5 }, ...]`
- Nao requer autenticacao (dados publicos, nomes parcialmente anonimizados)

### Ficheiros a criar/modificar
1. `src/pages/Convites.tsx` -- redesenhar com os 3 blocos
2. `supabase/functions/get-leaderboard/index.ts` -- nova edge function

### Detalhes tecnicos

**Edge function `get-leaderboard`:**
```sql
-- Logica interna:
-- 1. Buscar todos os referred_by distintos com count >= 1
-- 2. Para cada, buscar o nome do referrer (quem tem esse referral_code)
-- 3. Anonimizar: "Frederico Carvalho" -> "Frederico C."
-- 4. Ordenar por count DESC, limitar a 10
```

**Pagina Convites:**
- Usa `useRegistrationModal` para o link "Ainda nao te inscreveste?"
- Chama `get-leaderboard` no mount para mostrar o ranking
- Chama `check-referrals` quando o utilizador introduz o email (comportamento actual)
- Layout responsivo, max-width 560px, estilo consistente com o resto do site

