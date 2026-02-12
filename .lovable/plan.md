

## Re-sincronizar Contactos Existentes com E-goi

### Problema identificado

A funcao `sync-egoi` esta a funcionar correctamente (testei agora e o contacto foi criado com sucesso no E-goi com a tag). Contudo, os 8 registos anteriores na base de dados nunca foram sincronizados — provavelmente porque a funcao nao estava deployed no momento dos registos.

### Solucao

Criar uma edge function `bulk-sync-egoi` que:

1. Le todos os registos da tabela `registrations`
2. Para cada registo, chama a funcao `sync-egoi` existente
3. Regista sucesso/falha por contacto
4. Pode ser chamada manualmente uma vez para sincronizar o backlog

### Alteracoes tecnicas

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/bulk-sync-egoi/index.ts` | Nova edge function que percorre todos os registos e chama sync-egoi para cada um |

### Funcionamento

1. A funcao le todos os registos da tabela `registrations`
2. Para cada um, faz POST para `sync-egoi` com os dados (first_name, last_name, email, cellphone, referral_code)
3. Aguarda 200ms entre cada chamada para nao sobrecarregar a API do E-goi
4. Devolve um resumo: quantos sincronizados com sucesso, quantos falharam
5. Contactos que ja existam no E-goi (409) serao tratados normalmente — a tag e adicionada

### Apos execucao

Depois de correr a funcao uma vez, todos os contactos existentes terao a tag `webinar_imagens_com_ia_18_fev` no E-goi. Os novos registos continuarao a ser sincronizados automaticamente pelo fluxo normal (`register-free` -> `sync-egoi`).
