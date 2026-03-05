
# Corrigir datas do email pós-webinar Dia 1

## Problema
O cron job está correcto (6 de Março às 13h), mas o CRM mostra a data errada em dois locais:

1. **AutomationFlowTab.tsx** (linha 240): subtitle diz "5 de Março · 13h00" — deve ser **"6 de Março · 13h00"**
2. **AutomationFlowTab.tsx** (linha 245): tag diz "5 MAR · 13H" — deve ser **"6 MAR · 13H"**
3. **FollowUpPessoasVideo.tsx** (linha 62): `POSTWEBINAR_DAY1` está definido como `2026-03-05T13:00:00Z` — deve ser **`2026-03-06T13:00:00Z`**

## Validação completa

| Email | Cron (UTC) | Data real | UI actual | Estado |
|-------|-----------|-----------|-----------|--------|
| Pós-webinar (manual) | 5 Mar 13h | 5 Mar 13h | ✅ Correcto | OK |
| Dia 1 | **6 Mar 13h** | 6 Mar 13h | ❌ Diz "5 Mar" | **Corrigir** |
| Dia 3 | 8 Mar 10h | 8 Mar 10h | ✅ Correcto | OK |
| Fecho | 10 Mar 10h | 10 Mar 10h | ✅ Correcto | OK |

O email pós-webinar "manual" permanece como está — sem alteração.

## Ficheiros a alterar
- `src/components/crm/AutomationFlowTab.tsx` — corrigir subtitle e tag do Day 1
- `src/components/crm/FollowUpPessoasVideo.tsx` — corrigir data POSTWEBINAR_DAY1

## Detalhes técnicos
As Edge Functions e os cron jobs estão correctos — o envio real vai acontecer na data certa. O problema é apenas visual no CRM.
