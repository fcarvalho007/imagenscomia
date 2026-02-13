

## Correcoes e melhorias na ficha do CRM

### 1. Genero nao gravou (explicacao)

O sistema funciona correctamente — o genero e gravado em `localStorage`, que e separado por dominio. Se alterou no site publicado (`imagenscomia.lovable.app`), essa alteracao nao aparece no preview do Lovable porque sao dominios diferentes com localStorage independente. Nao ha bug a corrigir.

### 2. Editar nome do inscrito

Adicionar um botao de edicao ao lado do nome na ficha (icone de lapis). Ao clicar, o nome transforma-se num input editavel. Ao confirmar:
- Actualiza o registo na base de dados (tabela `registrations`, colunas `name`, `first_name`, `last_name`)
- Actualiza o state local imediatamente

**Ficheiros afectados:**
- `src/components/crm/InscritoModal.tsx` — adicionar modo de edicao de nome inline
- `src/hooks/useInscritos.ts` — adicionar funcao `updateName(id, fullName)` que faz UPDATE na BD e actualiza o state
- `src/pages/CRM.tsx` — passar `onUpdateName` ao modal

### 3. Redesign da ficha individual (UX/UI)

Problemas actuais:
- "Gratuito" aparece 3x (badge sidebar + card Plano + card Pago em)
- Avatar com iniciais ("VF") ainda aparece apesar de decisao anterior de remover
- Cards "Ref. EuPago" e "Pago em" vazios ocupam espaco sem utilidade para planos gratuitos
- Informacao de Plano/Valor repetida entre sidebar e conteudo

**Solucao — reorganizar a hierarquia:**

**Sidebar (painel esquerdo escuro):**
- Remover avatar de iniciais — manter apenas emoji de genero + nome (18px bold)
- Manter: genero selector, email, WhatsApp, data de inscricao, passo X/5
- Remover badge de plano da sidebar (ja aparece no conteudo)
- Manter accoes (Email, Follow-up, Arquivar, Eliminar)

**Conteudo (painel direito branco) — nova ordem:**

1. **Resumo** (topo) — Uma unica linha/card com: Plano + Valor + Passo + Data inscricao
   - Se plano gratuito: mostrar apenas "Gratuito · Passo 3/5"
   - Se pago: "Premium · EUR15 · Pago em 13 Fev 2026"
   - Ref. EuPago so aparece se existir (nao mostrar card vazio)

2. **Funil do Inscrito** — igual ao actual, logo a seguir

3. **Origem** — badges das fontes

4. **Duvida** — bloco com citacao (so se existir)

5. **Notas** — formulario e lista

Isto elimina a repeticao de "Gratuito", remove cards vazios, e cria uma hierarquia clara.

---

### Resumo de ficheiros

| Ficheiro | Alteracao |
|---|---|
| `src/hooks/useInscritos.ts` | Nova funcao `updateName(id, fullName)` com UPDATE na BD |
| `src/pages/CRM.tsx` | Passar `onUpdateName` ao InscritoModal |
| `src/components/crm/InscritoModal.tsx` | (1) Edicao inline do nome, (2) Remover avatar iniciais, (3) Redesign do painel direito: resumo compacto no topo, esconder cards vazios, eliminar repeticoes de "Gratuito" |

