

# Bug: Drawer mostra 0 registos para `video_masterclass_thankyou`

## Causa raiz

Na linha 1687 do `AutomationFlowTab.tsx`, o código remove o prefixo `video_` do `templateKeyMatch` antes de passar ao drawer:

```javascript
const rawKey = node.templateKeyMatch[0]; // "video_masterclass_thankyou"
const emailKey = rawKey.startsWith(`${webinar}_`) ? rawKey.slice(webinar.length + 1) : rawKey;
// resultado: "masterclass_thankyou"
```

Mas na tabela `email_send_logs`, o `email_key` armazenado é `"video_masterclass_thankyou"` (sem remoção de prefixo). Logo, a query no drawer não encontra nenhum registo.

Esta lógica de strip do prefixo faz sentido para templates como `video_confirmation` → `confirmation` (que são armazenados sem prefixo na `email_send_logs`), mas para templates da Masterclass o `email_key` inclui o prefixo `video_`.

## Correção

No `AutomationFlowTab.tsx` (linha ~1687), passar o `rawKey` completo (sem strip do prefixo) ao drawer. A lógica de strip deve ser condicional — só remover o prefixo para templates que realmente armazenam o `email_key` sem ele.

A forma mais simples: para os templates de masterclass (`video_masterclass_*`), usar o key completo. Podemos verificar se o `rawKey` contém `masterclass` e, nesse caso, não fazer o strip.

```typescript
const emailKey = rawKey.includes("masterclass") || rawKey.includes("mc_sales")
  ? rawKey
  : rawKey.startsWith(`${webinar}_`) ? rawKey.slice(webinar.length + 1) : rawKey;
```

### Ficheiro alterado
| Ficheiro | Alteração |
|----------|-----------|
| `src/components/crm/AutomationFlowTab.tsx` | Corrigir lógica de strip do prefixo no `emailKey` passado ao drawer |

