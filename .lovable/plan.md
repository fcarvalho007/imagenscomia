

# Corrigir contagem de emails em Automações

## Problema

A tabela `email_send_logs` tem 1813 registos, mas a query de estatísticas em `FollowUpView.tsx` (linha 108-123) não define um limite explícito, herdando o limite padrão de 1000 linhas. Resultado: os contadores nos cards mostram valores inferiores aos reais (ex: 4 em vez de 11 para Premium Pass).

O drawer de destinatários não é afectado porque filtra por `email_key` específico, devolvendo todas as linhas relevantes.

## Solução

Alterar a query de stats em `src/components/crm/FollowUpView.tsx` (linha ~108-123) para usar server-side aggregation via RPC ou, mais simples, adicionar `.limit(10000)` para cobrir o volume actual e futuro previsível.

### Ficheiro: `src/components/crm/FollowUpView.tsx`

Linha 109: adicionar `.limit(10000)` à query:

```typescript
supabase
  .from("email_send_logs")
  .select("email_key, status, webinar")
  .limit(10000)
  .then(...)
```

Uma única linha resolve o problema. Os contadores passarão a reflectir os valores reais: 11 Premium, 9 Masterclass, 5 Bundle.

