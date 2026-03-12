

# Disparo do email `video_masterclass_thankyou`

## Problema actual

A query filtra apenas `webinar = 'video'`, excluindo compradores de masterclass/bundle do webinar de Imagens.

## Audiência correcta

**Recebe:** Todos os que pagaram (ou receberam acesso premium) com plano `masterclass`, `bundle`, `video-masterclass` ou `video-bundle` — de **ambos** os webinars (imagens e video).

**Não recebe:** Free e Premium (apenas gravação).

## Alteração

### `supabase/functions/send-video-masterclass-thankyou/index.ts`

Remover `.eq("webinar", "video")` da query para abranger ambos os webinars. Adicionar deduplicação por email (mesmo utilizador pode ter registo em ambos os webinars — enviar apenas 1 email).

```diff
- .eq("webinar", "video")
- .eq("do_not_contact", false)
- .in("plan_selected", ["masterclass", "bundle", "video-masterclass", "video-bundle"]);
+ .eq("do_not_contact", false)
+ .in("plan_selected", ["masterclass", "bundle", "video-masterclass", "video-bundle"]);
```

Adicionar deduplicação:
```typescript
// Deduplicate by email (keep first match)
const seen = new Set<string>();
const deduped = eligible.filter(r => {
  if (seen.has(r.email)) return false;
  seen.add(r.email);
  return true;
});
```

### Deploy e disparo

1. Deploy da função actualizada
2. Invocar a função para disparar os emails

