
# Corrigir pagamento de Ana Teresa + prevenir race conditions

## 1. Correcao imediata dos dados

Actualizar o registo de `anateresa.bras@hotmail.com` para reflectir o plano correcto:

```sql
UPDATE registrations
SET plan_selected = 'video-premium'
WHERE id = 'b54eee29-f156-41d7-b273-7e41b84dcd2e';
```

## 2. Causa raiz: race condition entre saveStepData e create-payment

O fluxo actual tem duas chamadas async a competir:
- `saveStepData(4, { plan_selected: "video-premium" })` — chamado ao clicar "Quero Premium"
- `create-payment` — chamado em Step 5 e faz `UPDATE ... SET plan_selected = plan WHERE email = X`

Ambos usam `.eq("email", email)` sem filtro de webinar. Se as chamadas se sobrepuserem (ou se uma recarrega da pagina disparar `saveStepData` com dados antigos), o `plan_selected` pode ser sobrescrito.

### Correcoes no codigo

**Ficheiro: `src/pages/UpgradeVideo.tsx`**
- Adicionar filtro `.eq("webinar", "video")` ao `saveStepData` (linha 109), garantindo que so actualiza o registo correcto

**Ficheiro: `supabase/functions/create-payment/index.ts`**
- Nas queries de lookup (linhas 85-91 e 118-124) e no update (linha 200-201), adicionar filtro de webinar baseado no prefixo do plano (`video-` → webinar `"video"`, caso contrario `"imagens"`)
- Isto previne que pagamentos de um webinar afectem registos de outro

## Resumo tecnico

| Accao | Ficheiro | Tipo |
|---|---|---|
| UPDATE plan_selected para video-premium | DB | Dados |
| Adicionar .eq("webinar","video") ao saveStepData | UpgradeVideo.tsx | Codigo |
| Adicionar filtro webinar ao create-payment | create-payment/index.ts | Edge Function |
