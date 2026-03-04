

# Correcções na integração E-goi Transactional

## Problemas encontrados no `send-email/index.ts`

Após análise da documentação oficial da API Transactional V2, encontrei **2 bugs** que vão causar falhas no envio:

1. **`to` está como array** — o código envia `to: [to]` mas o endpoint `/send/single` espera uma **string** (`"to": "john-doe@email.com"`)
2. **`senderId` está como número** — o código envia `senderId: 2` (number) mas a API espera uma **string** (`"senderId": "2"`)

## Melhorias baseadas na documentação

3. **Activar tracking** — a tua conta E-goi tem tracking de aberturas e cliques activado (vi na imagem). Podemos passar `openTracking: true` e `clickTracking: true` para ter métricas de aberturas/cliques por email
4. **Campo `group`** — permite agrupar emails por tipo (ex: "confirmation", "reminder_48h") para depois ver estatísticas no painel E-goi por grupo

## Alterações

### Ficheiro: `supabase/functions/send-email/index.ts`

```typescript
// ANTES (bugs)
senderId: EGOI_SENDER_ID,     // number 2
to: [to],                      // array

// DEPOIS (corrigido)
senderId: String(EGOI_SENDER_ID),  // string "2"
to: to,                             // string
openTracking: true,
clickTracking: true,
```

Apenas 1 ficheiro alterado. As 8 Edge Functions que chamam `send-email` não precisam de mudanças — a interface é a mesma.

