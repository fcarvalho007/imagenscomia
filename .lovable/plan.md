

# Fix: Masterclass Reminder não enviou — bug no filtro de planos

## Problema crítico encontrado

O cron job disparou às 09:00:03 UTC, a função arrancou mas **não enviou nenhum email**. Motivo: **filtro errado nos nomes dos planos**.

A query atual:
```
.eq("webinar", "video")
.in("plan_selected", ["masterclass", "bundle"])
```

Mas os planos na base de dados são:
- Webinar Vídeo: `video-masterclass`, `video-bundle`
- Webinar Imagens: `masterclass`, `bundle`

Resultado: **0 correspondências**, 0 emails enviados.

## Audiência real elegível (dados da DB)

| Webinar | Plano | Pagos | Nomes |
|---------|-------|-------|-------|
| imagens | bundle | 3 | Maria, Silvana, Pedro |
| imagens | masterclass | 1 | Maria |
| video | video-bundle | 9 | Fornecedores/Daniela, Hermana, Susana, Carla, Nuno, Bruno, Jorge, Frederico*, Pedro |
| video | video-masterclass | 8+ | Inês, Olga, Sofia, Beatriz, Teresa, Diana, Romeo, Rita, Júlio... |
| **Total** | | **~21+** | |

*Frederico via premium_granted_at

## Plano de correção

### 1. Corrigir filtro no edge function (`send-video-masterclass-reminder/index.ts`)

Alterar linhas 88-94 de:
```js
.eq("webinar", "video")
.in("plan_selected", ["masterclass", "bundle"])
```
Para:
```js
.in("plan_selected", ["masterclass", "bundle", "video-masterclass", "video-bundle"])
```

Remover `.eq("webinar", "video")` — a Masterclass é para todos os compradores de ambos os webinars.

### 2. Re-disparar manualmente

Após deploy, invocar a função para enviar os emails agora (~09:10). A idempotência garante que não há duplicados (nenhum foi enviado antes).

### 3. Template — manter "Daqui a 1 hora"

O envio às 09:00 para sessão às 10:00 = 1 hora antes. O texto está correcto. Se preferir, posso alterar para "A Masterclass começa às 10h00 — falta menos de 1 hora" para ser mais preciso dado o ligeiro atraso.

### Ficheiros alterados

| Ficheiro | Alteração |
|----------|-----------|
| `supabase/functions/send-video-masterclass-reminder/index.ts` | Fix filtro plan_selected |
| Deploy + invoke manual | Re-enviar imediatamente |

