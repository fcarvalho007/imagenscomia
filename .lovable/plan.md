

# Fix: Filtros de Comunicação + Deselecção de destinatários

## Problemas identificados

1. **Filtro "Imagens IA" mostra 0 resultados**: O CRM.tsx já filtra os inscritos pelo contexto do webinar activo (ex: "video") via `filterByWebinar()` antes de os passar ao ComunicacaoView. Dentro do EmailTab/SmsTab existe um **segundo filtro** de webinar. Resultado: se o contexto é "Vídeo", seleccionar "Imagens IA" no filtro interno filtra uma lista que já só tem registos de vídeo — dá 0.

2. **Planos no contexto Vídeo**: Os planos são normalizados (`video-premium` → `premium`), por isso os filtros de plano funcionam. Mas o pool está pré-filtrado pelo contexto, limitando a visibilidade.

3. **Impossível desmarcar destinatários em lote**: Não existe botão para limpar todos os destinatários seleccionados, nem forma de desmarcar os filtros para enviar individualmente.

## Solução

### 1. Passar todos os inscritos ao ComunicacaoView (sem pré-filtragem)

Em `CRM.tsx`, passar `inscritos` (não `filteredInscritos`) ao ComunicacaoView, uma vez que este componente já tem os seus próprios filtros internos de webinar e plano.

### 2. Adicionar botão "Limpar todos" nos destinatários

Em `EmailTab.tsx` e `SmsTab.tsx`, ao lado de "Seleccionar todos", adicionar um botão "Limpar todos" que esvazia a lista de destinatários. Aparece apenas quando há destinatários seleccionados.

### 3. Sincronizar contadores do filtro

Na `FilterBar`, mostrar o número de inscritos que correspondem a cada opção de filtro (ex: "Imagens IA (42)", "Premium (12)") para feedback imediato. Isto requer passar a lista completa de inscritos à FilterBar.

## Ficheiros a editar

- `src/pages/CRM.tsx` — passar `inscritos` em vez de `filteredInscritos` ao ComunicacaoView
- `src/components/crm/comunicacao/EmailTab.tsx` — adicionar "Limpar todos", contadores nos filtros
- `src/components/crm/comunicacao/SmsTab.tsx` — mesmo: "Limpar todos", contadores nos filtros

