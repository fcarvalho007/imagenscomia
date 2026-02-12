

## Refinamentos necessarios ao tracking e E-goi

### Problemas encontrados

**1. E-goi attach-tag usa tag name em vez de tag ID (critico)**

No `sync-egoi/index.ts`, quando um contacto ja existe (409), o codigo tenta anexar a tag com `tag_id: "webinar_imagens_com_ia_18_fev"`. A API do E-goi espera um **ID numerico** no campo `tag_id`, nao o nome da tag. Isto significa que o PATCH para contactos existentes esta a falhar silenciosamente.

Solucao: Antes de anexar, fazer GET a `/lists/5/contacts/{contactId}` ou usar a API de tags para obter o ID numerico. Em alternativa, usar o endpoint correcto que aceita tag por nome.

**2. Email case-sensitivity no saveStepData (critico)**

O `register-free` guarda o email com `.toLowerCase().trim()`. Mas o `Upsell.tsx` le o email do URL param (`searchParams.get("email")`) e usa-o directamente no `.eq("email", userData.email)`. Se o email no URL tiver maiusculas, o update nao encontra o registo e falha silenciosamente.

Solucao: Normalizar o email no Upsell com `.toLowerCase().trim()` antes de usar.

**3. "SKIPPED" aparece como fonte no grafico de origens**

Quando o utilizador salta o Passo 1, grava-se `sources = "SKIPPED"`. No Dashboard, isto e interpretado como uma fonte real e aparece no grafico "Fontes de Origem" como "SKIPPED".

Solucao: Filtrar "SKIPPED" no calculo de fontes no Dashboard.

**4. Duvida "SKIPPED" aparece na lista de duvidas**

Mesmo problema — duvidas com valor "SKIPPED" aparecem na seccao "Duvidas dos Inscritos".

Solucao: Filtrar registos com `duvida === "SKIPPED"` da lista de duvidas.

**5. Limite de 1000 registos no CRM**

O `useInscritos` faz `.select("*")` sem paginacao. Com a base de 2000+ contactos mencionada, so aparecem os primeiros 1000.

Solucao: Adicionar `.limit(5000)` ou implementar paginacao (para ja, um limite alto resolve).

---

### Alteracoes tecnicas

| Ficheiro | O que muda |
|---|---|
| `src/pages/Upsell.tsx` | Normalizar `userData.email` com `.toLowerCase().trim()` |
| `src/components/crm/DashboardView.tsx` | Filtrar "SKIPPED" dos graficos de fontes e da lista de duvidas |
| `src/hooks/useInscritos.ts` | Adicionar `.limit(5000)` ao query para suportar bases maiores |
| `supabase/functions/sync-egoi/index.ts` | Corrigir attach-tag: usar endpoint que aceita tag por nome, ou fazer lookup do tag_id numerico primeiro |

### Prioridade

1. Email case-sensitivity (sem isto, o tracking nao funciona para muitos utilizadores)
2. E-goi attach-tag (sem isto, contactos existentes nao entram na automacao)
3. Filtrar SKIPPED (cosmetico mas confuso no CRM)
4. Limite de registos (necessario quando a base crescer)
