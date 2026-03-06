

# Reenviar SMS falhados por saldo insuficiente

## Situação actual
- **222 SMS falharam** no total: 214 por "INSUFICIENT_BALANCE", 8 por números inválidos
- **13 SMS enviados** com sucesso
- O saldo E-goi já foi reposto pelo utilizador
- Os 8 números inválidos não são recuperáveis (números fixos, brasileiros, ou vazios)

## Problema
A função `handleBulkSms` **não tem dedup** — se re-disparar, envia novamente aos 13 que já receberam. É necessário adicionar lógica de dedup antes do reenvio.

## Alteração — `src/components/crm/AutomationFlowTab.tsx`

Na função `handleBulkSms` (linha ~1108), antes de enviar, consultar `message_logs` para obter os IDs dos registos que já têm `status = 'sent'` com o mesmo `template_key` e `channel = 'sms'`. Filtrar esses da lista de elegíveis.

```typescript
// Após filtrar eligible (linha ~1101), adicionar dedup:
const { data: alreadySent } = await supabase
  .from("message_logs")
  .select("registration_id")
  .eq("template_key", templateKey)
  .eq("channel", "sms")
  .eq("status", "sent");

const sentIds = new Set((alreadySent || []).map(m => m.registration_id));
eligible = eligible.filter(p => !sentIds.has(p.id));
```

Isto garante que:
- Os 13 já enviados não recebem duplicado
- Os 214 que falharam por saldo são reincluídos (não têm `status = 'sent'`)
- Os 8 com números inválidos serão tentados novamente mas falharão com erro claro (já corrigido na versão anterior do `send-sms`)

## Resultado esperado
Ao clicar "Enviar SMS" no mesmo node, o sistema envia apenas aos ~214 que falharam por saldo, saltando os 13 já enviados.

