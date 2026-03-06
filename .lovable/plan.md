

# Adicionar contagem de contactos elegíveis por node de automação

## Objectivo
Em cada node de email ou SMS no fluxo pré-webinar, mostrar uma linha com "X contactos elegíveis" — o número de inscritos que se qualificam para receber essa comunicação. Após envio, compara-se com os enviados efectivos.

## Abordagem

### 1. Adicionar `audienceFilter` ao `NodeDef`

Cada node passa a ter uma propriedade opcional que descreve o público-alvo:

```typescript
audienceFilter?: {
  planFilter?: string[];       // ["free"], ["premium"], etc.
  requirePaid?: boolean;       // true = só paid_at != null
  requirePhone?: boolean;      // true = só com whatsapp
  excludePaid?: boolean;       // true = exclui quem já pagou
};
```

Os SMS nodes já têm `smsSendConfig` com filtros semelhantes — reutiliza-se.

### 2. Regras de elegibilidade por node (webinar vídeo pré-webinar)

| Node | Filtro |
|------|--------|
| Confirmação | todos |
| Follow-up upgrade | plan=free, excluir pagos |
| Lembrete 48h/24h/1h | todos |
| Confirmação compra Premium | plan=premium, requirePaid |
| Confirmação compra Masterclass | plan=masterclass, requirePaid |
| Pós-webinar | plan=free |
| Pós-webinar dia 1 | plan=free, excluir pagos |
| Recursos Premium/Master/Bundle | plan respectivo, requirePaid |
| SMS nodes | usa smsSendConfig existente |
| Pós-webinar dia 3 | plan=free, excluir pagos |
| Email fecho | plan=free, excluir pagos |

Aplica-se lógica equivalente aos nodes de imagens.

### 3. Função `computeEligible`

Função que recebe o node e a lista `filteredInscritos` e devolve o count:

```typescript
function computeEligible(node: NodeDef, inscritos: Inscrito[], webinar: WebinarKey): number
```

### 4. UI — linha no card

No `renderNodeCard`, abaixo do subtítulo e acima dos tags, adicionar:

```
👥 42 contactos elegíveis
```

Em cinza discreto (11px). Se houver `counts.sent > 0`, mostrar também a comparação:
```
👥 42 elegíveis · 38 contactados
```

### Ficheiro a alterar

- **`src/components/crm/AutomationFlowTab.tsx`**:
  - Adicionar `audienceFilter` a cada node em `getNodes()` e `getPostEventNodes()`
  - Criar função `computeEligible()`
  - Renderizar a linha de contagem no `renderNodeCard`

