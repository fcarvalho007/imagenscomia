

## Nova Pagina /gravacao: Modal de Inscricao + Funil /upgrade-gravacao + CRM

Tres alteracoes interligadas para suportar o fluxo pos-webinar de venda da gravacao.

---

### 1. Substituir PurchaseModal pelo RegistrationModal na pagina /gravacao

**Problema actual:** A pagina /gravacao usa o `PurchaseModal` (so pede primeiro nome, ultimo nome e email). O modal correcto e o `RegistrationModal` completo (nome completo, email, WhatsApp, checkbox de termos).

**Solucao:** Na pagina `Gravacao.tsx`, substituir o `PurchaseModal` por um formulario de captura inline (mesmo padrao do `CaptureView` dentro do `RegistrationModal`) que, apos registo bem-sucedido, redireciona para `/upgrade-gravacao`.

**Alteracoes no ficheiro `src/pages/Gravacao.tsx`:**
- Remover import e uso do `PurchaseModal`
- Adicionar um modal proprio com os mesmos campos do `RegistrationModal.CaptureView`: nome completo, email, WhatsApp, checkbox de termos, botoes legais
- Ao submeter, chamar `register-free` (com campo extra `registration_source: "gravacao"`) e redirecionar para `/upgrade-gravacao?name=...&email=...`
- Titulo do modal adaptado: "Quero acesso a gravacao + pack de apoio" em vez de "Quero confirmar o meu lugar para o Webinar Gratuito"

---

### 2. Nova pagina /upgrade-gravacao

**Ficheiro novo:** `src/pages/UpgradeGravacao.tsx`

Baseada no `Upsell.tsx` mas com fluxo simplificado de 3 passos:

| Passo | Conteudo |
|-------|----------|
| 1 | StepQualification ("Como soubeste desta formacao?") — reutiliza o componente existente |
| 2 | StepMasterclass (Masterclass a 47 euros + IVA) — reutiliza o componente existente |
| 3 | StepConfirmation — checkout com dados de faturacao e pagamento |

**Diferencas face ao /upgrade original:**
- Nao mostra o passo de personalizacao (StepPersonalization)
- Nao mostra o passo Premium (StepPremium) — salta directo para Masterclass
- O banner de confirmacao diz "Gravacao + Pack de apoio garantidos" em vez de "Vaga garantida no Webinar Gratuito"
- Barra de progresso: 3 passos em vez de 5
- Se o utilizador nao adicionar a Masterclass (skip), vai para o StepConfirmation que mostra so o plano `gravacao` (27 euros)
- O `OrderState` inclui `gravacao: true` por defeito (ja que e a razao de estar nesta pagina)

**Logica de pagamento:**
- Se so gravacao: plan = "gravacao", total = 33.21 euros
- Se gravacao + masterclass: plan = "gravacao-masterclass" (novo bundle), total = 33.21 + 57.81 = 91.02 euros
- O `create-payment` precisa de suportar o novo plan "gravacao-masterclass"

**Rota no `src/App.tsx`:**
- Adicionar `<Route path="/upgrade-gravacao" element={<UpgradeGravacao />} />`

---

### 3. Backend: campo registration_source

**Migracao SQL:**
```sql
ALTER TABLE registrations ADD COLUMN registration_source text NOT NULL DEFAULT 'webinar';
```

Valores possiveis: `'webinar'` (pre-evento, default) e `'gravacao'` (pos-evento).

**Alteracoes no `register-free/index.ts`:**
- Aceitar campo opcional `registrationSource` no body
- Passar `registration_source` no insert (default: `'webinar'`)

**Alteracoes no `create-payment/index.ts`:**
- Adicionar produto `"gravacao-masterclass"` com value 91.02 (74 + 23% IVA), identifier `"WEBINAR-GRAVMC"`, description `"Gravacao + Pack + Masterclass"`

---

### 4. CRM: distinguir pre-webinar vs pos-webinar

**Alteracoes no `useInscritos.ts`:**
- O `mapRegistration` mapeia o novo campo `registration_source` para o objecto `Inscrito`

**Alteracoes no tipo `Inscrito` (`src/pages/crm/mockData.ts`):**
- Adicionar campo `registration_source: "webinar" | "gravacao"`

**Alteracoes no `CRMSidebar.tsx`:**
- Nenhuma alteracao na sidebar — a distincao e feita via filtro dentro das vistas existentes

**Alteracoes no `PipelineView.tsx`:**
- Adicionar um toggle/filtro no topo: "Todos" | "Pre-webinar" | "Pos-webinar (Gravacao)"
- Quando "Pos-webinar" activo, filtrar `inscritos` por `registration_source === "gravacao"`
- Badge visual nos cards: pill "POS-WEBINAR" (cinza escuro) quando `registration_source === "gravacao"`

**Alteracoes no `TableView.tsx`:**
- Adicionar coluna "Origem" que mostra "Webinar" ou "Gravacao"
- Filtro rapido na barra de filtros

**Alteracoes no `DashboardView.tsx`:**
- Novo KPI card: "Pos-webinar" com contagem de inscritos com `registration_source === "gravacao"`
- Receita separada: mostrar receita pre vs pos-webinar

---

### Resumo de ficheiros

| Ficheiro | Accao |
|----------|-------|
| `src/pages/Gravacao.tsx` | Substituir PurchaseModal por modal de inscricao completo |
| `src/pages/UpgradeGravacao.tsx` | **Novo** — funil de 3 passos (qualificacao, masterclass, confirmacao) |
| `src/App.tsx` | Adicionar routes `/upgrade-gravacao` |
| `src/pages/crm/mockData.ts` | Adicionar `registration_source` ao tipo Inscrito |
| `src/hooks/useInscritos.ts` | Mapear `registration_source` |
| `src/components/crm/PipelineView.tsx` | Filtro pre/pos-webinar + badge |
| `src/components/crm/TableView.tsx` | Coluna "Origem" + filtro |
| `src/components/crm/DashboardView.tsx` | KPI pos-webinar |
| `supabase/functions/register-free/index.ts` | Aceitar `registrationSource` |
| `supabase/functions/create-payment/index.ts` | Novo plan `gravacao-masterclass` |
| Migracao SQL | Adicionar coluna `registration_source` |

