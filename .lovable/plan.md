

## Refinamento: Hardcode do Tag ID no E-goi

### Problema

No `sync-egoi/index.ts`, quando um contacto ja existe (409), o codigo faz um GET a `https://api.egoiapp.com/tags?name=...` para descobrir o ID numerico da tag antes de a anexar. Isto adiciona latencia desnecessaria e pode falhar se a API de pesquisa devolver um formato inesperado.

O utilizador confirmou que a tag `webinar_imagens_com_ia_18_fev` tem o ID numerico **31** na lista 5.

### Solucao

Hardcode `TAG_ID = 31` e eliminar o pedido GET de lookup. O bloco 409 passa de ~30 linhas para ~15, ficando mais rapido e robusto.

### Alteracoes tecnicas

| Ficheiro | O que muda |
|---|---|
| `supabase/functions/sync-egoi/index.ts` | Substituir a logica de lookup da tag por `const TAG_ID = 31`. Remover o bloco de GET + parse. Usar directamente `tag_id: 31` no attach-tag. |

Nenhuma outra alteracao e necessaria — o resto do tracking, filtros SKIPPED, normalizacao de email e limite de registos ja esta correcto.

