

## Corrigir: chamar sync-egoi para registos existentes

### Problema
Quando um email ja existe na base de dados, a funcao `register-free` retorna imediatamente sem chamar `sync-egoi`. A tag nunca e adicionada no E-goi e a automacao nao arranca.

### Confirmacao do E-goi
- A configuracao do trigger "Tag adicionada" esta correta (tag 31, aceita re-entradas)
- O `sync-egoi` ja lida corretamente com contactos existentes no E-goi (409 -> attach-tag)
- O unico problema e que `register-free` nunca chama `sync-egoi` para emails ja registados na DB

### Solucao
Alterar `supabase/functions/register-free/index.ts` para adicionar uma chamada nao-bloqueante ao `sync-egoi` dentro do bloco `if (existing)`, antes do return.

### Alteracao tecnica

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/register-free/index.ts` | Adicionar select de `first_name`, `last_name`, `whatsapp` no query do existing. Adicionar chamada ao sync-egoi antes do return do bloco existing. |

### Detalhes

1. Alterar a query do existing para tambem buscar `first_name`, `last_name` e `whatsapp`:
   - De: `.select("referral_code, premium_unlocked")`
   - Para: `.select("referral_code, premium_unlocked, first_name, last_name, whatsapp")`

2. Antes do return dentro do `if (existing)`, adicionar chamada nao-bloqueante ao sync-egoi (mesmo padrao ja usado para novos registos):
   - Envia first_name, last_name, email, cellphone (whatsapp) e referral_code
   - Wrapped em try/catch para nao falhar o registo se o E-goi falhar

### Fluxo corrigido

```text
Email ja existe na DB?
  SIM -> chama sync-egoi (nao-bloqueante) -> return dados existentes
  NAO -> insere na DB -> chama sync-egoi (nao-bloqueante) -> return novos dados
```

### Resultado
- Contacto novo no E-goi: criado com tag -> automacao arranca
- Contacto existente no E-goi: tag adicionada via attach-tag -> automacao arranca
- Em ambos os casos, a automacao "Tag adicionada" dispara corretamente

