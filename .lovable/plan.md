

# Refinamentos finais do CRM — Footer, WhatsApp e limpeza de dados

## 1. Footer: Link discreto para o CRM

Adicionar `crm` como link no footer da homepage, ao lado dos existentes.

**Ficheiro**: `src/components/landing/FooterSection.tsx`
- Adicionar `<a href="/crm">crm</a>` depois de "Ver os teus convites"
- Mesmo estilo discreto (text-white/30, hover text-white/60)

## 2. WhatsApp: Correcao do URL bloqueado

O erro `ERR_BLOCKED_BY_RESPONSE` acontece porque o `api.whatsapp.com` bloqueia pedidos vindos de iframes (como o preview do Lovable). Isto e uma limitacao do ambiente de preview, nao um bug do codigo.

O codigo actual ja usa o formato correcto `https://wa.me/NUMERO` (tanto no modal como no pipeline). No site publicado real, os links funcionarao normalmente porque abrem num separador do browser sem restricoes de iframe.

**Accao**: Nenhuma alteracao de codigo necessaria. Os links `wa.me` ja estao correctos. O erro so acontece dentro do preview do Lovable.

## 3. Remover contactos dummy

**Ficheiro**: `src/pages/crm/mockData.ts`
- Esvaziar o array `MOCK_DATA` para `[]`
- Manter os tipos `Inscrito` e `Nota` intactos (sao necessarios para a estrutura)

Nota: O `useInscritos.ts` verifica primeiro o sessionStorage. Se ja tiver dados la (de sessoes anteriores com mock), vai continuar a mostrar os antigos. Ao limpar o sessionStorage (logout e re-login), o CRM arrancara vazio.

## 4. Revisao geral do sistema

Apos rever todos os ficheiros:

| Area | Estado | Notas |
|------|--------|-------|
| Login (so email) | OK | Valida `fredericodigital@gmail.com`, sem password |
| Dashboard (funil, KPIs, origens, planos, duvidas) | OK | Todos os calculos derivados dos dados |
| Dashboard ("Para Fazer Hoje") | OK | Filtra follow-ups activos |
| Pipeline (6 colunas kanban) | OK | Receita por coluna, WhatsApp hover |
| Tabela (filtros, ordenacao, paginacao) | OK | Checkbox + accoes em massa, CSV export |
| Modal individual (2 paineis) | OK | Timeline, notas, navegacao anterior/proximo |
| WhatsApp links | OK | Formato `wa.me` correcto; erro so no preview |
| Sidebar + mobile drawer | OK | Responsive, logout funcional |
| sessionStorage (persistencia) | OK | Grava alteracoes automaticamente |
| Rotas (nenhuma pagina existente alterada) | OK | So `/crm` adicionado |

**Conclusao**: O sistema esta pronto para ir para o ar. O unico "problema" reportado (WhatsApp bloqueado) e uma limitacao do ambiente de preview e nao afecta o site publicado.

## Ficheiros a editar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/FooterSection.tsx` | Adicionar link "crm" |
| `src/pages/crm/mockData.ts` | Esvaziar array MOCK_DATA para [] |
