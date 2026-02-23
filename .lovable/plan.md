

# Integrar E-goi com o Webinar de Video

## Resumo

Criar uma nova edge function `egoi-sync` que centraliza operacoes E-goi para o webinar de video, e ligar aos fluxos de registo e pagamento existentes com as tags correctas.

---

## Ficheiros a criar/modificar

| Ficheiro | Accao |
|---|---|
| `src/config/webinarConfig.ts` | Adicionar constantes `EGOI_CONFIG` |
| `supabase/functions/egoi-sync/index.ts` | **Criar** — nova edge function para sincronizar contactos e tags |
| `supabase/config.toml` | Adicionar `[functions.egoi-sync]` com `verify_jwt = false` |
| `supabase/functions/register-free/index.ts` | Chamar `egoi-sync` (action=register) para webinar=video |
| `supabase/functions/eupago-webhook/index.ts` | Adicionar tags video (34/35) alem das existentes imagens (32/33) |

---

## PASSO 1 — Constantes de configuracao

**Ficheiro:** `src/config/webinarConfig.ts`

Adicionar ao final do ficheiro:

```typescript
export const EGOI_CONFIG = {
  baseUrl: "https://api.egoiapp.com",
  listId: 5,
  tags: {
    videoWebinar: 34,     // webinar_video_com_ia_5_marco
    premiumPass: 35,      // premium_pass_webinar_video
    masterclass: 33,      // masterclass (partilhada)
  }
} as const;
```

---

## PASSO 2 — Nova edge function `egoi-sync`

**Ficheiro:** `supabase/functions/egoi-sync/index.ts` (criar)

Funcao interna chamada por outras edge functions. Aceita:

```json
{
  "email": "...",
  "fname": "...",
  "phone": "+351912345678",
  "action": "register" | "tag",
  "tagId": 34,
  "registrationId": "uuid"
}
```

### Logica para action = "register":

1. Procurar contacto por email: `GET /lists/5/contacts?email=...`
2. Se nao existe: criar com `POST /lists/5/contacts` (base: email, first_name, cellphone se fornecido, status active)
3. Se ja existe: nada a fazer (contacto ja activo)
4. Anexar tag 34 (videoWebinar): `POST /lists/5/contacts/actions/attach-tag`
5. Registar em `message_logs` com `template_key: "egoi_sync"`, `provider: "egoi"`

### Logica para action = "tag":

1. Procurar contacto por email
2. Se encontrado: anexar `tagId` especificado
3. Se nao encontrado: retornar `{ success: false, reason: "contact_not_found" }`
4. Registar em `message_logs` com `template_key: "egoi_tag"`, `provider: "egoi"`

### Tratamento de erros:

- Todos os fetch com try/catch
- Nunca bloquear — sempre retornar resposta estruturada `{ success, contact_id?, error? }`
- Logs detalhados para debug

### Formato do telefone:

- Se phone e string vazia ou nula, omitir campo `cellphone` do payload E-goi
- Se fornecido, usar formato `351-{digits}` (formato que o E-goi espera, consistente com `sync-egoi` existente)

---

## PASSO 3 — config.toml

Adicionar:

```toml
[functions.egoi-sync]
verify_jwt = false
```

---

## PASSO 4 — Trigger no registo video

**Ficheiro:** `supabase/functions/register-free/index.ts`

Actualmente, para webinar=video, a funcao ja chama `sync-egoi` (que aplica tag 31 do webinar imagens). Para o video, adicionar chamada adicional a `egoi-sync` com action=register.

Apos o insert bem-sucedido e apos o bloco existente de `sync-egoi`, quando `webinar === "video"`:

```typescript
// Video webinar: sync to E-goi with video tag (non-blocking)
if ((webinar || "imagens") === "video") {
  fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/egoi-sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify({
      action: "register",
      email: email.toLowerCase().trim(),
      fname: firstName.trim(),
      phone: cleanPhone ? `+351${cleanPhone.replace(/\D/g, "")}` : "",
    }),
  }).catch(err => console.error("egoi-sync (video register) failed:", err));
}
```

Tambem adicionar a mesma logica no bloco de "existing registration" quando o webinar e video.

---

## PASSO 5 — Tags de compra no webhook EuPago

**Ficheiro:** `supabase/functions/eupago-webhook/index.ts`

O webhook ja tem logica de tagging nas linhas 202-253 que aplica Tags 32/33 para compras do webinar imagens. Expandir esta logica para incluir tags do video:

Apos obter `regForTags`, verificar tambem o campo `webinar`:

```typescript
const { data: regForTags } = await supabase
  .from("registrations")
  .select("email, plan_selected, webinar")
  .eq("id", matchedRegId)
  .maybeSingle();

if (regForTags?.email && regForTags?.plan_selected) {
  const plan = regForTags.plan_selected;
  const webinar = regForTags.webinar || "imagens";
  
  // Normalizar plan (remover prefixo "video-")
  const normalizedPlan = plan.replace(/^video-/, "");
  
  // Tags por webinar
  const TAG_MAP = {
    imagens: { premium: 32, masterclass: 33 },
    video:   { premium: 35, masterclass: 33 },
  };
  const tags = TAG_MAP[webinar] || TAG_MAP.imagens;

  // ... lookup contactId (codigo existente) ...

  if (["premium", "bundle"].includes(normalizedPlan)) {
    await attachTag(tags.premium);
  }
  if (["masterclass", "bundle"].includes(normalizedPlan)) {
    await attachTag(tags.masterclass);
  }
}
```

---

## PASSO 6 — Visibilidade no CRM (ActivityTimeline)

Os eventos ja serao visiveis na timeline porque sao registados em `message_logs` com `provider: "egoi"`.

No mapeamento de labels existente em `ActivityTimeline.tsx`, adicionar:

```typescript
egoi_sync: "Sincronizado com E-goi",
egoi_tag: "Tag E-goi aplicada",
```

---

## O que NAO muda

- Funcao `sync-egoi` existente (continua a funcionar para imagens webinar com tag 31)
- Funcao `grant-premium-egoi` existente
- Emails de confirmacao (Resend)
- Fluxos de pagamento
- CRM views
- Autenticacao ou routing
- Qualquer logica do webinar de imagens

## Notas tecnicas

- O `EGOI_API_KEY` ja existe nos secrets do Supabase — nao e preciso adicionar
- A tag 33 (masterclass) e partilhada entre os dois webinars
- A funcao `egoi-sync` usa `SUPABASE_SERVICE_ROLE_KEY` apenas para logging em `message_logs`
- Todas as chamadas E-goi sao fire-and-forget (non-blocking) nos fluxos de registo e pagamento
