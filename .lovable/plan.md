

## Tracking completo dos passos + sincronizacao E-goi para contactos existentes

### Problema 1: Passos nao estao a ser trackeados

Actualmente, os dados do funil (sources, duvida, plan_selected) so sao gravados na base de dados quando o utilizador clica "Confirmar e pagar" no Passo 5. Se abandonar antes, perde-se toda a informacao. Alem disso, nao ha forma de distinguir entre "saltou" e "nunca chegou la".

### Solucao: Gravar cada transicao de passo em tempo real

**1. Nova coluna na base de dados**

Adicionar `step_reached` (integer) a tabela `registrations` para registar o passo maximo atingido.

**2. Gravar dados a cada avanço de passo no Upsell.tsx**

| Transicao | Dados gravados na DB |
|---|---|
| Passo 1 -> 2 | `sources`, `step_reached = 2` |
| Passo 1 (skip) -> 2 | `sources = "SKIPPED"`, `step_reached = 2` |
| Passo 2 -> 3 | `duvida`, `step_reached = 3` |
| Passo 2 (skip) -> 3 | `duvida = "SKIPPED"`, `step_reached = 3` |
| Passo 3 (add premium) -> 4 | `plan_selected = "premium"`, `step_reached = 4` |
| Passo 3 (skip) -> 4 | `step_reached = 4` (plan_selected fica null) |
| Passo 4 (add MC) -> 5 | `plan_selected` actualizado, `step_reached = 5` |
| Passo 4 (skip) -> 5 | `step_reached = 5` |

Cada gravacao e feita com `supabase.from("registrations").update(...)` directamente no `advanceStep`, sem esperar pelo pagamento.

**3. Actualizar useInscritos.ts**

Usar a nova coluna `step_reached` da DB em vez do calculo heuristico actual.

**4. Actualizar o funil no Dashboard**

O funil no CRM passa a usar o valor real de `step_reached` em vez de inferencias.

---

### Problema 2: Contactos existentes no E-goi

O fluxo actual faz POST para criar contacto. Se ja existir (409), ignora. Contactos existentes nao recebem a tag nova nem entram na automacao.

### Solucao: Actualizar contactos existentes

Quando o E-goi devolve 409, o `sync-egoi` passa a:
1. Extrair o `contact_id` da resposta 409
2. Fazer PATCH para adicionar a tag `webinar_imagens_com_ia_18_fev` ao contacto existente
3. Assim o contacto entra na automacao configurada por tag

---

### Alteracoes tecnicas

| Ficheiro | O que muda |
|---|---|
| **Migracao SQL** | `ALTER TABLE registrations ADD COLUMN step_reached integer DEFAULT 1` |
| **src/pages/Upsell.tsx** | `advanceStep` passa a gravar dados na DB a cada transicao (sources, duvida, step_reached) |
| **src/hooks/useInscritos.ts** | `mapRegistration` usa `r.step_reached` da DB em vez do calculo heuristico |
| **src/components/crm/DashboardView.tsx** | Funil usa `step_reached` real para contagens precisas |
| **supabase/functions/sync-egoi/index.ts** | No caso 409, faz PATCH para adicionar tag ao contacto existente |

### Resultado

- Cada passo do funil fica registado em tempo real na base de dados
- O CRM mostra dados precisos de onde cada utilizador parou
- Sabe-se se o utilizador saltou ou respondeu a cada pergunta
- Contactos que ja existiam no E-goi recebem a tag e entram na automacao

