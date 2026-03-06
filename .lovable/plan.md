

# Pipeline: Uniformizar headers e corrigir naming

## Problemas identificados

1. **Formatação inconsistente**: No filtro "Pós-webinar", os títulos das colunas incluem preços c/IVA no título (ex: "Sessão Prática · €33,21") E o `ColumnFinancials` mostra novamente o preço +IVA — duplicação. No "Pré-webinar" só aparece o `ColumnFinancials`, que é o formato correcto.

2. **Bundle naming**: "Pack IA Completo" no pré-webinar deveria indicar que é "Sessão Prática + Masterclass".

3. **Preço errado no título pós-webinar do bundle**: Mostra €131,61 mas o preço correcto c/IVA é €115,62.

## Alterações — `src/components/crm/PipelineView.tsx`

### 1. Remover preços dos títulos no `visibleColumns` (linhas 192-201)
Eliminar o `.map()` que adiciona preços ao título no filtro `gravacao`. Os títulos ficam sempre iguais ("Sessão Prática", "Masterclass Vídeo", "Pack IA Completo") e os preços são mostrados apenas pelo `ColumnFinancials`.

### 2. Corrigir UNIT_PRICES do bundle pós-webinar (linha 34)
De `"€107+IVA"` → `"€94+IVA"` (ou manter o c/IVA: `"€115,62 c/IVA"`). Confirmar qual o utilizador quer.

### 3. Actualizar título do bundle pré-webinar
No `COLUMNS` (linha 100), manter "Pack IA Completo" mas adicionar subtítulo no `ColumnFinancials` para pré-webinar: "(SP + MC)".

### 4. Uniformizar `ColumnFinancials` 
Mostrar sempre: preço unitário (quando filtro não é "all"), faturado e pendente — em ambos os filtros, sem diferenças de layout.

Resultado: ambos os filtros terão exactamente o mesmo layout visual nos headers.

