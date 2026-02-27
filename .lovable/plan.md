

# Corrigir followup-abandoned: filtrar apenas webinar Imagens

## Problema identificado

A Edge Function `followup-abandoned` (cron de follow-up para inscritos que nao pagaram) nao filtra pelo campo `webinar`. A query na linha 478-485 seleciona TODOS os registos com `paid_at IS NULL` e `plan_selected != 'free'`, incluindo inscritos do webinar de Video.

Resultado: inscritos do webinar Video recebem emails de follow-up com:
- Data errada: "18 Fev 2026" (Imagens) em vez de "5 Mar 2026" (Video)
- Conteudo errado: referencias ao webinar de Imagens
- Links de upgrade errados: apontam para `/upgrade` em vez de `/upgrade-video`

O webinar de Video ja tem a sua propria funcao de follow-up: `send-video-followup-prewebinar`.

## Correcao

**Ficheiro unico:** `supabase/functions/followup-abandoned/index.ts`

**Alteracao:** Adicionar `.eq("webinar", "imagens")` a query de candidatos (linha 478-485).

Antes:
```
const { data: candidates } = await supabase
  .from("registrations")
  .select(...)
  .is("paid_at", null)
  .eq("do_not_contact", false)
  .not("plan_selected", "is", null)
  .neq("plan_selected", "free")
  .neq("plan_selected", "video-free");
```

Depois:
```
const { data: candidates } = await supabase
  .from("registrations")
  .select(...)
  .is("paid_at", null)
  .eq("do_not_contact", false)
  .eq("webinar", "imagens")
  .not("plan_selected", "is", null)
  .neq("plan_selected", "free")
  .neq("plan_selected", "video-free");
```

Isto garante que:
- Inscritos do webinar Video nao sao contactados por esta funcao
- O fluxo de follow-up do Video (`send-video-followup-prewebinar`) continua a funcionar independentemente
- Nenhum outro ficheiro precisa de ser alterado

## O que NAO muda
- `send-video-followup-prewebinar` (intocavel)
- Todas as outras edge functions
- Logica de manual send (ja recebe o registration_id especifico)
- Templates de email
- CRM

