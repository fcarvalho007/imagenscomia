

# Refinamentos do CRM — Login simplificado e revisao geral

## Resumo

Duas frentes: (1) simplificar o login para aceitar apenas email, sem password; (2) corrigir detalhes em falta ou incoerentes na estrutura actual do CRM.

## Alteracao 1 — Login so com email

### CRMLogin.tsx
- Remover o campo password (state, input e label)
- Validar apenas `email === "fredericodigital@gmail.com"`
- Mensagem de erro: "Email nao autorizado."
- Manter todo o design visual (card escuro, fundo #0F172A)

## Alteracao 2 — Refinamentos encontrados na revisao

Apos rever todos os ficheiros, identifiquei os seguintes pontos a corrigir:

### A) Coluna WhatsApp em falta na tabela (TableView.tsx)
O plano original previa 10 colunas incluindo WhatsApp, mas a implementacao actual so tem 8 (falta WhatsApp e a coluna Accao esta simplificada). Adicionar coluna WhatsApp entre Email e Plano, oculta em mobile (`max-md:hidden`).

### B) Pipeline — filtro da coluna "Inscrito" demasiado restritivo
Actualmente filtra `step_reached < 5`, mas deveria ser `step_reached >= 1` (todos os free que nao completaram o flow). O inscrito com `step_reached === 1` (Helena, id 013) ja aparece, mas o filtro deveria ser mais claro: qualquer free que nao chegou ao passo 5 e nao esta em follow-up.
- Revisao: o filtro actual `plan === "free" && step_reached < 5 && !follow_up` esta correcto. Nenhuma alteracao necessaria.

### C) Animacao do funil (DashboardView.tsx)
O plano original pedia animacao de width 0 para o valor em 800ms. A implementacao usa `transition-all duration-700` mas sem estado inicial a 0. Nao e critico mas pode ser melhorado com um state `mounted` para animar na primeira renderizacao.

### D) Sidebar — fechar drawer ao trocar de vista em mobile
Ja esta implementado correctamente na `CRMSidebar.tsx` (linha 152). OK.

### E) Tabela — coluna WhatsApp e ordenacao
Adicionar WhatsApp como coluna sortable.

### F) CSV Export — incluir first_name/last_name
A tabela `registrations` agora tem `first_name` e `last_name`. O mock data ainda usa `nome` (campo unico). Para consistencia futura, o CSV deve exportar o nome completo como esta, ja que o mock usa `nome`.

## Detalhes tecnicos

### Ficheiros a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/crm/CRMLogin.tsx` | Remover password state/input, validar so email |
| `src/components/crm/TableView.tsx` | Adicionar coluna WhatsApp |

### CRMLogin.tsx — nova logica

```text
Estado: apenas email e error (remover password)
Validacao: email === "fredericodigital@gmail.com"
Erro: "Email nao autorizado."
```

### TableView.tsx — coluna WhatsApp

Adicionar entre Email e Plano:
- Header: "WhatsApp", min-w-[140px], max-md:hidden, sortable
- Celula: Inter 400, 13px, --ink-600, max-md:hidden

