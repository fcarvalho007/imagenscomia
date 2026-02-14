

## Melhorias ao Dashboard: Rastreio de Abandono, Layout Pipeline e Taxa de Conversao

### 1. Rastrear abandono no Passo 5 (seleccionou produto mas nao clicou "Confirmar e pagar")

**Situacao actual:**
O campo `plan_selected` e preenchido quando o utilizador chega ao Passo 3 ou 4 e selecciona um produto. O campo `upgrade_clicked_at` so e preenchido quando clica "Confirmar e pagar" (Passo 5) e e redireccionado para a EuPago.

Isto ja esta a ser rastreado correctamente com os 3 estados implementados na ultima iteracao:
- **Seleccionou** (`plan_selected` existe, `upgrade_clicked_at` null) -- abandonou antes de clicar pagar
- **Aguarda pagamento** (`upgrade_clicked_at` existe, `paid_at` null) -- clicou pagar, foi para EuPago, nao completou
- **Pago** (`paid_at` existe)

**Melhoria proposta:** Tornar esta informacao mais visivel e accionavel no Dashboard, integrando-a na seccao Pipeline de forma clara.

### 2. Juntar "Pipeline Pendente" e "Pagamentos Pendentes +6h" na mesma linha

**Ficheiro:** `src/components/crm/DashboardView.tsx`

Actualmente sao dois cards empilhados verticalmente. A alteracao:
- Colocar ambos numa grid de 2 colunas na mesma linha
- **Coluna esquerda:** Pipeline Pendente (resumo com valor total, breakdown por estado "seleccionou" vs "aguarda pagamento", e breakdown por produto)
- **Coluna direita:** Pendentes ha +6h (lista de nomes clicaveis com tempo decorrido e badge de plano)
- Em mobile (max-md), voltam a empilhar-se verticalmente

### 3. Adicionar taxa de conversao visitantes vs inscritos no Funil

**Dados disponiveis via analytics:**
- Total de visitantes unicos a landing page: **1049** (desde 8 Fev)
- Total de inscritos: **58**
- Taxa de conversao (CTR registo): **~5.5%**

**Implementacao:**
Adicionar uma linha "0." antes de "1. Submeteu inscricao" no funil com:
- Label: "Visitaram a landing page"
- Valor: obtido via chamada a analytics (ou guardado como estado)
- Drop-off entre visitantes e inscritos mostrado inline

**Abordagem tecnica:** Criar uma edge function `get-analytics-summary` que faz um pedido interno a Lovable Analytics API para obter o total de visitantes, ou, mais simples e pragmatico, guardar o numero de visitantes como uma constante configuravel no Dashboard que o utilizador pode actualizar manualmente. A opcao mais fiavel e usar os dados de analytics directamente.

**Opcao escolhida (mais simples e precisa):** Usar a contagem de pageviews da rota "/" como proxy dos visitantes. Com base nos analytics: 1034 visitas a "/". Vamos chamar a API de analytics directamente a partir do Dashboard, usando as datas de inicio da campanha.

**Alternativa pragmatica (recomendada):** Como nao temos acesso directo a API de analytics a partir do frontend, vamos adicionar um campo editavel no topo do funil onde se pode inserir o numero total de visitantes (com valor default de 1034). Isto e actualizado manualmente mas da controlo total e precisao.

### Resumo de alteracoes

| Ficheiro | Alteracao |
|---|---|
| `src/components/crm/DashboardView.tsx` | (1) Juntar Pipeline + Pendentes +6h em grid 2 colunas; (2) Adicionar linha "Visitantes" no topo do funil com input editavel e calculo de CTR; (3) Melhorar clareza visual dos 3 estados no Pipeline |

### Detalhe tecnico do funil

O funil passara a ter 6 linhas:

```text
0. Visitaram a landing page    [input editavel]    (100%)
   drop: -X visitantes (Y% nao inscreveram)
1. Submeteu inscricao           58                  (Z%)
   drop: ...
2. Chegou ao Passo 1            ...
   ...
```

A percentagem do passo 1 sera calculada em relacao ao numero de visitantes (se preenchido), dando a taxa de conversao real da landing page.

### Detalhe do layout Pipeline (2 colunas)

```text
+---------------------------+---------------------------+
| Pipeline Pendente         | Pendentes ha +6h          |
| EUR X,XX total            | Y pagamentos              |
|                           |                           |
| Seleccionaram: N          | [Nome] Premium  ha Xh    |
|   (nao clicaram pagar)    | [Nome] Bundle   ha Xd    |
| Aguardam pagamento: M     | ...                       |
|   (ja tem ref EuPago)     |                           |
|                           |                           |
| X Premium · Y Bundle      | +Z mais                  |
+---------------------------+---------------------------+
```
