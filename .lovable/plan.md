

# Criar pagina /crm — CRM privado do webinar

## Resumo

Nova pagina `/crm` com login simples (sessionStorage), sidebar fixa, e 3 vistas: Dashboard, Pipeline e Tabela. Inclui painel slide-over para ficha individual de cada inscrito. Dados mock com 20 inscritos. Nenhuma pagina existente sera alterada.

## Ficheiros a criar

### 1. Dados e estado
- **`src/pages/crm/mockData.ts`** — tipos `Inscrito` e `Nota`, array `MOCK_DATA` com 20 inscritos
- **`src/hooks/useInscritos.ts`** — custom hook que gere o array de inscritos (ler/gravar sessionStorage, CRUD de notas, alterar status/follow-up). Comentario `// TODO: substituir MOCK_DATA por fetch() da API`

### 2. Pagina principal
- **`src/pages/CRM.tsx`** — componente raiz da rota `/crm`
  - Verifica `sessionStorage("crm_auth")` — se nao existe, mostra login
  - Se autenticado, mostra layout sidebar + area de conteudo
  - Gere `activeView` (dashboard | pipeline | tabela) e `selectedInscrito` (para slide-over)

### 3. Componentes CRM

| Ficheiro | Descricao |
|----------|-----------|
| `src/components/crm/CRMLogin.tsx` | Card de login centrado, fundo escuro #0F172A |
| `src/components/crm/CRMSidebar.tsx` | Sidebar 240px fixa, navegacao, badge evento, logout. Drawer em mobile |
| `src/components/crm/DashboardView.tsx` | Vista dashboard com funil, KPIs, origens, planos, duvidas |
| `src/components/crm/PipelineView.tsx` | Vista kanban com 6 colunas, cartoes arrastáveis |
| `src/components/crm/TableView.tsx` | Vista tabela com filtros, ordenacao, paginacao, exportar CSV |
| `src/components/crm/InscritoSlideOver.tsx` | Painel lateral direito com ficha completa, notas, accoes rapidas |

### 4. Rota
- **`src/App.tsx`** — adicionar `<Route path="/crm" element={<CRM />} />`

## Detalhes tecnicos

### Autenticacao
- Login hardcoded: `fredericodigital@gmail.com` / `fc2026crm`
- Sessao em `sessionStorage("crm_auth")`
- Logout limpa sessionStorage e volta ao ecra de login

### Estado (useInscritos hook)
```text
useInscritos() retorna:
  inscritos: Inscrito[]
  addNota(inscritoId, texto)
  removeNota(inscritoId, notaId)
  updateStatus(inscritoId, status)
  toggleFollowUp(inscritoId)
```
- Inicializa com sessionStorage se existir, senao MOCK_DATA
- Persiste em sessionStorage a cada alteracao

### Dashboard — calculos derivados
- Total inscritos = inscritos.length
- Receita = soma de `valor` de todos
- Conversao = (inscritos com plan !== "free") / total
- Ticket medio = receita / n_pagantes
- Funil: 5 etapas baseadas em step_reached e duvida
- Origens: agregar todos os source[] e contar ocorrencias
- Planos: agrupar por plan e calcular contagens

### Pipeline — 6 colunas kanban
- Colunas: Inscrito, Flow Completo, Premium, Masterclass, Bundle, Follow-up
- Cartoes com avatar (iniciais + gradiente rotativo), badges, duvida truncada
- Drag-and-drop: implementar com botoes de mover (sem dependencia externa, conforme regra 7 do prompt — evitar deps extras)
- Pesquisa por nome/email

### Tabela
- 10 colunas: Nome, Email, WhatsApp, Plano, Valor, Passo, Duvida, Inscricao, Notas, Accao
- Ordenacao por qualquer coluna (asc/desc)
- Filtros: pesquisa texto, plano, passo
- Paginacao 10 por pagina
- Exportar CSV (blob download, separador `;`, UTF-8 BOM)
- Ocultar Email e WhatsApp em mobile

### Ficha slide-over
- Painel fixo direito 420px (100vw mobile)
- Overlay com blur
- Progresso visual 5 passos
- Detalhes em grid 2 colunas
- Duvida em card destacado
- CRUD de notas (adicionar/apagar)
- Accoes: abrir WhatsApp, enviar email, marcar follow-up, arquivar

### Responsivo
- Sidebar: 240px desktop, drawer com overlay em mobile (< 768px)
- Hamburger no topo da area de conteudo em mobile
- KPIs: 4 colunas desktop, 2 mobile
- Pipeline: scroll horizontal
- Tabela: colunas ocultas em mobile

### Design
- Usa CSS variables existentes do projecto (--ink-900, --blue-600, --surface, etc.)
- Montserrat para titulos, Inter para corpo
- Sidebar fundo #0F172A, login fundo #0F172A, conteudo --off-white
- Sem dark mode

