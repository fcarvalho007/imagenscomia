

# Configurar E-goi com o CNAME verificado

## Descoberta

O CNAME transacional `mkt.digitalfc.pt → t896690.kmitd.com` esta verificado e activo no E-goi (confirmado no screenshot). O erro anterior era `INVALID_DOMAIN_STATUS` para `digitalfc.pt` — o dominio transacional registado no Slingshot e `mkt.digitalfc.pt`, nao `digitalfc.pt`.

## Alteracao

### Ficheiro: `supabase/functions/send-email/index.ts`

Mudar o dominio de `digitalfc.pt` para `mkt.digitalfc.pt`:

```typescript
// ANTES
const EGOI_DOMAIN = "digitalfc.pt";

// DEPOIS
const EGOI_DOMAIN = "mkt.digitalfc.pt";
```

### Apos deploy

1. Invocar `test-send-email` para enviar teste para `fredericodigital@gmail.com`
2. Se o teste chegar, invocar `resend-failed-emails` para os ~166 emails falhados (reminder_24h, followup_prewebinar, confirmation)

