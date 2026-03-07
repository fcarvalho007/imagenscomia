

# Melhorias de Faturacao — Auditoria e Plano

## Problemas identificados

### 1. Precos hardcoded e inconsistentes em 3 edge functions

Os precos fallback (`PRICES`) estao duplicados e **divergem** entre funcoes:

| Funcao | `bundle` | `video-premium` | `video-bundle` |
|--------|----------|-----------------|----------------|
| `bulk-emit-invoices` | 57.0 | 27.0 | 107.0 |
| `bulk-create-invoices` | **62.0** | **15.0** | **57.0** |
| `create-invoice` | 57.0 | 27.0 | 107.0 |

Estes valores ja existem na tabela `webinar_settings` (criada na ultima migracao). As 3 funcoes deviam ler de la em vez de hardcoded.

### 2. `bulk-create-invoices` nao suporta grupos

Cria rascunhos individuais para cada membro do grupo. Deveria consolidar como o `bulk-emit-invoices` ja faz — um unico rascunho para o comprador com `quantity = N`.

### 3. `create-invoice` nao suporta grupos

Ao clicar "Emitir e Enviar" na ficha individual de um membro de grupo, cria fatura individual com o `paid_amount` repartido (valor por pessoa). Deveria detectar o `group_payment_ref` e emitir a fatura consolidada ao comprador.

### 4. `bulk-finalize-invoices` tem PLAN_LABELS hardcoded

Tem a sua propria copia de labels e nao verifica o estado do documento antes de finalizar (ao contrario do `bulk-emit-invoices` que ja tem `getIEDocumentState`).

## Plano de correcao

### Ficheiro 1: `supabase/functions/bulk-create-invoices/index.ts`
- Adicionar logica de agrupamento por `group_payment_ref` (igual ao `bulk-emit-invoices`)
- Para grupos: criar UM rascunho para o comprador com `quantity = N` e total consolidado
- Ler precos fallback de `webinar_settings` em vez de hardcoded

### Ficheiro 2: `supabase/functions/create-invoice/index.ts`
- Detectar `group_payment_ref` e buscar todos os membros do grupo
- Emitir fatura consolidada ao comprador (membro com `invoice_details`)
- Marcar todos os membros como `invoice_sent = true`
- Ler precos fallback de `webinar_settings`

### Ficheiro 3: `supabase/functions/bulk-emit-invoices/index.ts`
- Substituir `PRICES` hardcoded por leitura de `webinar_settings`
- Manter toda a logica de grupos existente (ja correcta)

### Ficheiro 4: `supabase/functions/bulk-finalize-invoices/index.ts`
- Adicionar verificacao de estado do documento (`getIEDocumentState`) antes de finalizar
- Substituir `PLAN_LABELS` hardcoded por leitura de `webinar_settings`
- Marcar todos os membros do grupo como `invoice_sent` quando a fatura do grupo e finalizada

## Resumo: 4 ficheiros editados, 0 migracoes

