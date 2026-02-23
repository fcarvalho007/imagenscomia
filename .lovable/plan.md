
# Diagnostico: Registo video nao aparece no CRM + Tag E-goi nao aplicada

## Dois problemas encontrados

### Problema 1 -- Registo nao aparece no CRM (area Video)

A base de dados tem apenas **1 registo** para `fredericodigital@gmail.com` com `webinar: imagens` (criado a 17 Fev). 

Quando o utilizador se inscreve no `/video`, o `register-free` detecta que o email ja existe (linha 49) e segue o caminho "existing" — que **nao cria um novo registo** nem actualiza o `webinar` para `video`. Apenas dispara o egoi-sync e retorna. Como o CRM filtra por `webinar === "video"`, o registo nunca aparece nessa vista.

**Solucao**: No caminho "existing" do `register-free`, quando `webinar === "video"` e o registo existente tem `webinar !== "video"`, criar um **segundo registo** com `webinar: video` (ou actualizar o existente). A opcao mais segura e criar um segundo registo, pois o utilizador pode ter dados diferentes em cada webinar (plan_selected, paid_at, etc.).

Alteracao em `supabase/functions/register-free/index.ts`, dentro do bloco `if (existing)` (apos linha 49):

```
Se webinar === "video" E o registo existente tem webinar !== "video":
  1. Verificar se ja existe um registo com este email E webinar = "video"
  2. Se nao existir, criar novo registo com webinar: "video"
  3. Retornar os dados do novo registo
```

### Problema 2 -- Formato do telefone E-goi (REGRESSAO)

Os logs mostram:

```
'+351915015508' is not a valid phone format (/^(\d){1,3}-(\d){4,20}$/)
```

O E-goi exige o formato `351-915015508` (digitos-traco-digitos, SEM sinal `+`). A funcao `sync-egoi` usa este formato correctamente e funciona. A minha correcao anterior no `egoi-sync` mudou de `351-` para `+351`, o que introduziu uma regressao.

**Solucao**: Em `supabase/functions/egoi-sync/index.ts`, linha 102, mudar de:

```typescript
? `+351${localDigits}`
```

para:

```typescript
? `351-${localDigits}`
```

Tambem corrigir o `register-free` (linhas 87 e 203) que envia `+351XXXXXXXXX` — deve enviar apenas os digitos locais e deixar o `egoi-sync` formatar:

Linha 87: `phone: existing.whatsapp || ""`
Linha 203: `phone: cleanPhone || ""`

---

## Ficheiros a modificar

| Ficheiro | Alteracao |
|---|---|
| `supabase/functions/egoi-sync/index.ts` | Linha 102: `+351` para `351-` |
| `supabase/functions/register-free/index.ts` | Linhas 87, 203: enviar telefone cru sem prefixo |
| `supabase/functions/register-free/index.ts` | Bloco existing (apos linha 49): criar registo video se nao existir |

## Detalhe tecnico -- Novo registo video para utilizador existente

Dentro do bloco `if (existing)` em `register-free`, antes do return (linha 92):

```typescript
// If registering for video webinar and existing reg is not video,
// check if a video registration already exists; if not, create one
if ((webinar || "imagens") === "video") {
  const { data: existingVideo } = await supabase
    .from("registrations")
    .select("id, referral_code")
    .eq("email", email.toLowerCase().trim())
    .eq("webinar", "video")
    .maybeSingle();

  if (!existingVideo) {
    // Create a video-specific registration
    const videoReferralCode = generateCode();
    const videoEditToken = crypto.randomUUID().replace(/-/g, "") 
      + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    const videoOrderId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);

    await supabase.from("registrations").insert({
      name: `${existing.first_name || ""} ${existing.last_name || ""}`.trim(),
      first_name: existing.first_name || firstName.trim(),
      last_name: existing.last_name || (lastName || "").trim(),
      email: email.toLowerCase().trim(),
      whatsapp: existing.whatsapp || cleanPhone || null,
      referral_code: videoReferralCode,
      referred_by: referredBy || null,
      edit_token: videoEditToken,
      edit_token_created_at: new Date().toISOString(),
      order_id: videoOrderId,
      registration_source: registrationSource || "webinar",
      webinar: "video",
    });
  }
}
```

## Deploy

Re-deploy de `register-free` e `egoi-sync` apos as alteracoes.

## O que NAO muda

- Nenhum ficheiro frontend
- Nenhuma alteracao de base de dados (schema)
- Logica de tags (tag 34 ja esta correcta no egoi-sync)
- Funcao sync-egoi (formato ja correcto)
