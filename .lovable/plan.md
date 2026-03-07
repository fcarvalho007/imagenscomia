

# Corrigir contagens de emails nas Automações

## Problema

O utilizador reporta que o card mostra "76 enviados" mas o painel lateral (drawer) mostra 363. A investigação revela problemas estruturais na lógica de contagem que podem causar números inconsistentes.

## Dados reais na DB

| email_key | sent | fonte |
|-----------|------|-------|
| `video_postwebinar_day1` | 363 | `email_send_logs` (brevo) |
| `postwebinar` | 162 | `email_send_logs` |
| `confirmation` | 238 | `email_send_logs` |
| `reminder_24h` | 278 | `email_send_logs` |

## Bugs identificados

### 1. Substring matching causa contaminação cruzada
`matchTemplate()` usa `.includes()`. O node "Email pós-webinar" (D0) com padrão `"postwebinar"` intercepta logs de `video_postwebinar_day1` e `video_postwebinar_day3`. Isto inflaciona contagens quando o fallback de `message_logs` é usado.

### 2. Duplo prefixo no statsKey é frágil
O statsKey é `${webinar}_${rawKey}` (ex: `video_video_postwebinar_day1`). Funciona por coincidência porque `email_send_logs` também tem `email_key = "video_postwebinar_day1"`. Mas alguns email_keys NÃO têm o prefixo `video_` (ex: `confirmation`, `reminder_24h`), criando assimetrias.

### 3. Drawer e card usam fontes diferentes
- Card: `emailStats` (cached on mount, via chaves compostas)
- Drawer: query fresca a `email_send_logs` com `email_key` directo
- Se `emailStats` falha ou a chave não faz match, o fallback a `message_logs` pode dar números diferentes

## Plano de correcção

### Ficheiro: `AutomationFlowTab.tsx`

**A. Substituir `matchTemplate` por matching exacto**
```typescript
// Antes (substring, perigoso)
function matchTemplate(templateKey: string, patterns: string[]): boolean {
  return patterns.some(p => templateKey.includes(p));
}

// Depois (exacto)
function matchTemplate(templateKey: string, patterns: string[]): boolean {
  const k = templateKey.toLowerCase();
  return patterns.some(p => k === p);
}
```

**B. Normalizar statsKey para remover duplo prefixo**
Linha 1056-1057: ao construir o statsKey, remover o prefixo do webinar do rawKey se já estiver presente, evitando `video_video_...`:
```typescript
const rawKey = n.templateKeyMatch[0]?.replace(/-/g, "_")... || "";
const stripped = rawKey.startsWith(`${webinar}_`) ? rawKey.slice(webinar.length + 1) : rawKey;
const statsKey = `${webinar}_${stripped}`;
```
Isto garante que:
- `video_postwebinar_day1` → `video_postwebinar_day1` (sem duplicação)
- `confirmation` → `video_confirmation` (correcto)

**C. Aplicar mesma normalização na click handler do drawer (linha 1447)**
Para que o `emailKey` passado ao drawer corresponda ao `email_key` na tabela:
```typescript
const rawKey = node.templateKeyMatch[0]?.replace(/-/g, "_")...;
const emailKey = rawKey.startsWith(`${webinar}_`) ? rawKey.slice(webinar.length + 1) : rawKey;
```

### Ficheiro: `FollowUpView.tsx`

**D. Manter consistência no cálculo de `emailStats`**
A chave actual `${row.webinar}_${row.email_key}` está correcta. Com a normalização no ponto B, os statsKeys vão fazer match correctamente.

## Resultado esperado

- Card e drawer mostram o mesmo número (363 para Day 1)
- Nodes D0/D1/D3 não contaminam contagens entre si
- Chaves consistentes eliminam discrepâncias por duplo-prefixo

