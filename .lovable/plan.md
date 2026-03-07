

# Auditoria: Faturação — Consistência Mobile/Tablet/Desktop

## Problemas identificados

### 1. KPIs Hero — valores cortados em mobile (screenshot confirma)
Os valores grandes (`€1355,22`) usam `text-2xl sm:text-4xl md:text-5xl` nos cards de 3 colunas. Em tablets estreitos e mobile, os valores transbordam do card porque `grid-cols-1 md:grid-cols-3` salta de 1 para 3 colunas sem estágio intermédio. O screenshot mostra claramente valores cortados no card "Margem Operacional".

**Fix**: Reduzir a escala tipográfica do valor nos hero cards para `text-2xl sm:text-3xl md:text-4xl` e usar `truncate` como fallback. Adicionar breakpoint intermédio `sm:grid-cols-2 lg:grid-cols-3` para tablets.

### 2. Tabs (Todos/Imagens/Vídeo) sem indicação de contagem
As abas mostram apenas o nome. Não se sabe quantos pagantes ou que receita corresponde a cada aba sem clicar.

**Fix**: Adicionar contagem de pagantes entre parênteses: `Imagens (15)` / `Vídeo (30)`.

### 3. InvoiceTable — coluna "Plano" mostra key técnica
Mostra `premium`, `masterclass`, `bundle` em vez de labels legíveis como "Premium Pass", "Masterclass", "Pack Completo".

**Fix**: Mapear plan keys para labels no InvoiceTable.

### 4. InvoiceTable — sem badge de webinar na tab "Todos"
Quando se vê todos os pagantes, não se distingue a que webinar pertence cada registo.

**Fix**: Adicionar badge `IMG`/`VID` compacto na coluna Nome quando `webinarFilter === "all"`.

### 5. Botões de ação em mobile apertados
Os 3 botões de bulk (Gerar Rascunhos, Enviar, Emitir) ficam apertados em 375px. O `flex-wrap` já existe, mas o botão verde "Emitir e Enviar Todas" tem texto longo.

**Fix**: Abreviar o label em mobile: `Emitir Todas` em vez de `Emitir e Enviar Todas`. Usar `hidden sm:inline` para a parte extra.

### 6. PLSummary (Mapa de Contas) — max-w-lg em mobile
O card tem `md:max-w-lg` que está correcto, mas em mobile ocupa 100% sem padding lateral consistente — está OK mas o `w-full` pode ser melhorado com `max-w-full` explícito.

### 7. CostsSection — tabela de custos sem coluna "Webinar" na tab Todos
Quando se está na aba "Todos", a tabela de custos não indica a que webinar pertence cada custo.

**Fix**: Adicionar coluna "Webinar" condicional (apenas quando `activeTab === "todos"`). Requer passar `activeTab` como prop.

---

## Plano de implementação (4 ficheiros)

### `src/components/crm/faturacao/FaturacaoKPIs.tsx`
- Hero grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` (tablet mostra 2 cards por linha)
- Reduzir font hero values: `text-2xl sm:text-3xl lg:text-4xl`
- ROAS value: `text-2xl sm:text-4xl lg:text-5xl`
- Adicionar `truncate` nos valores para prevenir overflow

### `src/components/crm/FaturacaoView.tsx`
- Calcular contagens por webinar para exibir nas tabs: `Imagens (15)` / `Vídeo (30)`
- Passar `activeTab` como prop ao CostsSection

### `src/components/crm/faturacao/InvoiceTable.tsx`
- Mapear plan keys → labels legíveis (Premium Pass, Masterclass, Pack Completo)
- Badge `IMG`/`VID` no nome quando `webinarFilter === "all"`
- Label do botão verde: `Emitir <span className="hidden sm:inline">e Enviar</span> Todas`

### `src/components/crm/faturacao/CostsSection.tsx`
- Receber prop `showWebinarColumn: boolean`
- Quando true, adicionar coluna "Webinar" com badge `IMG`/`VID`

