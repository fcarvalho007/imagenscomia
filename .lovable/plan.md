

## Adaptar Webhook para Aceitar GET (classico) e POST (2.0)

### Problema

A EuPago esta a enviar notificacoes via GET com query parameters (`valor`, `canal`, `referencia`, `transacao`, `identificador`), mas o webhook so aceita POST com JSON body. O `req.json()` falha em requests GET, causando erro 500 silencioso.

### Solucao

Adaptar o webhook para detectar o metodo HTTP e extrair dados do formato correcto:

- **GET** (classico): ler de `URL.searchParams` — params: `valor`, `canal`, `referencia`, `transacao`, `identificador`
- **POST** (Webhooks 2.0): ler de `req.json()` como actualmente

### Mapeamento de campos

| GET param | Equivalente no codigo actual |
|---|---|
| `transacao` | `transactionID` |
| `referencia` | `reference` |
| `valor` | `amount` |
| `canal` | `paymentMethod` |
| `identificador` | `identifier` |

No formato GET classico nao ha campo `transactionStatus`. Um GET callback da EuPago significa **pagamento confirmado** (so dispara em sucesso).

### Logica de matching

1. Extrair `transacao` (transactionID) do GET
2. Procurar na DB por `eupago_ref = transacao` (guardado pelo create-payment)
3. Se encontrar, actualizar `paid_at`
4. Fallback: extrair email do `identificador` (formato `WEBINAR-BUNDLE-email@example.com-timestamp`)

### Ficheiro afectado

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/eupago-webhook/index.ts` | Detectar GET vs POST, extrair params de query string para GET, manter JSON para POST. Tratar GET como pagamento confirmado. |

### Detalhes tecnicos

```text
Request chega
    |
    +-- GET? --> extrair searchParams (valor, canal, referencia, transacao, identificador)
    |            tratar como pagamento confirmado
    |
    +-- POST? --> req.json() (formato actual, Webhooks 2.0)
    |             verificar transactionStatus === "Success"
    |
    +-- OPTIONS? --> CORS (sem alteracao)
```

- Nao e necessario mudar nada no painel EuPago
- O sistema classico ja configurado comeca a funcionar imediatamente apos deploy
- Se no futuro configurares Webhooks 2.0, tambem funciona sem alteracoes adicionais

