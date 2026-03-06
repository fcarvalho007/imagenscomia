

# Corrigir `computeEligible` para email nodes — incluir `premium_granted_at`

## Problema

Na função `computeEligible()`, linha 117-118, os filtros de email nodes (`audienceFilter`) só verificam `paid_at`:

```typescript
if (f.requirePaid && !i.paid_at) return false;          // linha 117
if (f.excludePaid && i.paid_at) return false;            // linha 118
```

Isto ignora `premium_granted_at`. Resultado:
- **Nodes de clientes pagos** (`requirePaid: true`) — não contam quem teve acesso concedido manualmente (premium_granted_at)
- **Nodes de gratuitos** (`excludePaid: true`) — contam pessoas que já têm premium concedido como se fossem gratuitas

O fix de SMS (linha 102) já verifica ambos (`paid_at` e `premium_granted_at`), mas o fix para email nodes não foi aplicado.

## Solução

Alterar as linhas 117-118 em `computeEligible()`:

**De:**
```typescript
if (f.requirePaid && !i.paid_at) return false;
if (f.excludePaid && i.paid_at) return false;
```

**Para:**
```typescript
if (f.requirePaid && !i.paid_at && !i.premium_granted_at) return false;
if (f.excludePaid && (i.paid_at || i.premium_granted_at)) return false;
```

Isto alinha o comportamento dos email nodes com o dos SMS nodes, garantindo que todos os contadores de elegíveis no fluxo pós-evento (e pré-evento) reflectem correctamente quem pagou ou teve acesso concedido.

### Ficheiro alterado
- `src/components/crm/AutomationFlowTab.tsx` — linhas 117-118

