

## Corrigir Tag E-goi - Aplicacao Explicita Apos Criacao

### Problema

Os contactos estao a ser criados no E-goi com sucesso, mas **sem a tag 31** (`webinar_imagens_com_ia_18_fev`). O campo `tags` no payload de criacao do contacto nao esta a funcionar como esperado pela API do E-goi.

### Causa raiz

A API do E-goi aparentemente ignora o campo `tags: ["webinar_imagens_com_ia_18_fev"]` no payload de criacao. Apenas o endpoint dedicado `attach-tag` aplica tags de forma fiavel.

### Solucao

**Ficheiro:** `supabase/functions/sync-egoi/index.ts`

1. Apos criar um contacto com sucesso (status 200/201), extrair o `contact_id` da resposta
2. Chamar o endpoint `POST /lists/5/contacts/actions/attach-tag` com o `tag_id: 31` e o `contact_id`
3. Isto garante que **todos** os contactos (novos e existentes) recebem a tag

Alem disso, re-executar a funcao `bulk-sync-egoi` para aplicar a tag aos contactos que ja foram criados sem ela.

### Alteracoes tecnicas

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/sync-egoi/index.ts` | Apos criacao bem-sucedida, extrair contact_id da resposta e chamar attach-tag explicitamente |

### Passos de execucao

1. Atualizar a funcao `sync-egoi` com a chamada explicita ao attach-tag
2. Fazer deploy da funcao
3. Re-executar `bulk-sync-egoi` para aplicar a tag a todos os contactos existentes no E-goi
4. Verificar no E-goi que os contactos tem a tag 31

