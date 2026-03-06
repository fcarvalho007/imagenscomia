

# Diagnóstico: SMS "enviados" mas nada chegou + Relatório detalhado

## Problema encontrado: fetch sem headers de autenticação

O `handleBulkSms` (linha 749) usa `fetch()` directo em vez de `supabase.functions.invoke()`. O `fetch` envia apenas o header `x-crm-admin-email`, mas **falta o header `apikey`** obrigatório pelo gateway do backend. Resultado: os pedidos são rejeitados **antes** de chegar à função — por isso não há logs da função nem registos em `message_logs`. O frontend recebe provavelmente um erro silencioso ou timeout, mas o `toast.success` corre na mesma se `sent > 0` (o que pode acontecer se o gateway devolver algo inesperado).

**Zero SMS foram realmente entregues.** A interface mostrou "enviado" mas nenhum chegou à E-goi.

## Correcção 1: Usar `supabase.functions.invoke` no bulk SMS

Substituir o `fetch()` na linha 749-764 por `supabase.functions.invoke("send-sms", ...)` que adiciona automaticamente os headers de autenticação. É exactamente o que o `SmsComposer.tsx` já faz (e funciona).

## Correcção 2: Adicionar relatório detalhado clicável após envio

Após o envio em lote, mostrar um painel com:
- Lista de cada destinatário: nome, número de telefone, estado (enviado/falhou), erro se houver
- Clicável para expandir detalhes
- Resumo: X enviados, Y falhados, Z total

Implementação: guardar os resultados por pessoa num array durante o loop de envio e mostrá-los num modal/drawer após conclusão.

## Ficheiros a alterar

- `src/components/crm/AutomationFlowTab.tsx`:
  1. Substituir `fetch()` por `supabase.functions.invoke()` no `handleBulkSms`
  2. Guardar resultados detalhados por pessoa (nome, telefone, sucesso/erro)
  3. Adicionar estado e UI para mostrar o relatório detalhado após envio (drawer/modal com lista clicável)

## Notas
- O `SmsComposer.tsx` e `SmsTab.tsx` já usam `supabase.functions.invoke` — só o bulk send estava com `fetch` directo
- Os SMS dos dois primeiros nodes que clicaste não chegaram a ninguém — vais precisar de reenviar após a correcção

