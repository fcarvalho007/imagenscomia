

# 5 Refinamentos propostos para o CRM

Analisei todas as views do CRM (Dashboard, Pipeline, Tabela, Faturação, Automações, Comunicação) e o modelo de dados. Seguem 5 melhorias por ordem de impacto operacional:

---

## 1. Exportação CSV inteligente na Tabela

**Problema**: Não existe forma de exportar dados filtrados do CRM. O ícone `Download` existe na Tabela mas sem funcionalidade de exportação com os filtros activos (plano, pagamento, step, search).

**Solução**: Botão "Exportar CSV" que respeita todos os filtros aplicados e inclui as colunas visíveis (nome, email, whatsapp, plano, valor, estado, data). Útil para importação noutras ferramentas ou relatórios manuais.

**Esforço**: Baixo (1 ficheiro, ~40 linhas)

---

## 2. Notificações em tempo real de novos inscritos e pagamentos

**Problema**: O polling de 30s no `useInscritos` actualiza dados silenciosamente. Quando entra um novo inscrito ou chega um pagamento, não há feedback visual — o admin tem de comparar mentalmente os números.

**Solução**: Toast notification ao detectar novos registos ou pagamentos entre ciclos de polling. Badge com contador "novos desde última visita" no sidebar junto ao item Dashboard.

**Esforço**: Médio (2-3 ficheiros, ~80 linhas)

---

## 3. Busca global com atalho de teclado (⌘K)

**Problema**: A pesquisa existe apenas dentro de cada view (Tabela, Pipeline). Para encontrar um inscrito rapidamente, o admin precisa navegar até à view certa e usar o campo de pesquisa local.

**Solução**: Command palette (⌘K / Ctrl+K) usando o `cmdk` já instalado, que pesquisa por nome/email em todos os inscritos e navega directamente para o modal do inscrito. Pode incluir atalhos rápidos para views.

**Esforço**: Médio (1-2 ficheiros, ~120 linhas)

---

## 4. Dashboard — KPIs de conversão do funil pós-evento

**Problema**: O Dashboard mostra KPIs gerais (inscritos, receita, planos) mas falta uma visão de funil pós-evento: quantos passaram de free → upgrade click → pagamento? Qual a taxa de conversão por step? O bloco Masterclass KPIs é bom, mas falta o equivalente para o funil de vendas geral.

**Solução**: Novo bloco "Funil de Conversão" no Dashboard com barras horizontais mostrando: Inscritos → Viram upgrade → Selecionaram plano → Pagaram. Com taxas de conversão entre cada step e comparação imagens vs vídeo.

**Esforço**: Médio (1 ficheiro, ~150 linhas)

---

## 5. Logs de actividade agregados por inscrito no modal

**Problema**: A tab "Histórico" no modal do inscrito mostra message_logs individuais, mas falta um resumo visual rápido — uma timeline compacta tipo "recebeu email X → abriu link → pagou" que permita ver o percurso do lead num relance.

**Solução**: Mini-timeline visual no topo da tab Resumo (ou como header do modal) com dots/ícones cronológicos para cada evento significativo (registo, emails enviados, click upgrade, pagamento, premium granted).

**Esforço**: Médio (2 ficheiros, ~100 linhas)

---

## Resumo de priorização sugerida

| # | Refinamento | Impacto | Esforço |
|---|---|---|---|
| 1 | Exportação CSV filtrada | Alto (operacional) | Baixo |
| 2 | Notificações tempo real | Alto (awareness) | Médio |
| 3 | Busca global ⌘K | Alto (produtividade) | Médio |
| 4 | Funil de conversão Dashboard | Médio (analítico) | Médio |
| 5 | Mini-timeline no modal | Médio (contexto) | Médio |

Diz-me quais queres priorizar e avanço com a implementação.

