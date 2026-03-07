

# Sincronizar FaturacaoView com o contexto do sidebar

## Problema

A `FaturacaoView` **ignora** o switcher do sidebar (WebinarContext). No `CRM.tsx` linha 139, passa `inscritos` (sem filtro), não `filteredInscritos`. A FaturacaoView tem tabs internas independentes. Quando trocas no sidebar para "Imagens IA", a secção Faturação continua a mostrar "Todos" e o botão emite para `webinar=all`.

## Solução

Sincronizar o `activeTab` da FaturacaoView com o `webinarContext` do sidebar:

1. **`FaturacaoView.tsx`**: importar `useWebinarContext`, e usar um `useEffect` para sincronizar `activeTab` quando `webinarContext` muda:
   - `"imagens"` → `activeTab = "imagens"`
   - `"video"` → `activeTab = "video"`  
   - `"consolidado"` → `activeTab = "todos"`

2. **`CRM.tsx`**: manter `inscritos` (sem filtro) no prop, porque a FaturacaoView filtra internamente via `activeTab`.

Desta forma, ao trocar o sidebar para "Imagens IA", a tab e o botão de emissão actualizam automaticamente para mostrar apenas os participantes do webinar Imagens.

## Ficheiro alterado (1)
- `src/components/crm/FaturacaoView.tsx` — adicionar sync com WebinarContext

