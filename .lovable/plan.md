

# Documentação Técnica Detalhada — Fase 2

---

## 1. Stack Técnica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Runtime | React + TypeScript | React 18.3.1 |
| Build | Vite | latest |
| CSS | Tailwind CSS + tailwindcss-animate | latest |
| UI Components | Radix UI (26 primitives) + shadcn/ui | latest |
| Routing | react-router-dom | 6.30.1 |
| State/Fetching | @tanstack/react-query | 5.83.0 |
| Animation | Framer Motion 12.33 + GSAP 3.14 | — |
| 3D | @react-three/fiber + drei | 8.18 / 9.122 |
| Forms | react-hook-form + zod + @hookform/resolvers | — |
| Backend | Supabase (Lovable Cloud) | supabase-js 2.95 |
| Calendar | add-to-calendar-button-react | 2.13 |
| Charts | Recharts | 2.15 |

---

## 2. Arquitectura de Ficheiros

```text
src/
├── pages/              # 22 rotas (cada ficheiro = 1 página)
├── components/
│   ├── crm/            # ~40 ficheiros CRM (views, modals, tabs)
│   │   ├── modal/      # Sub-componentes do InscritoModal
│   │   ├── comunicacao/# Email/SMS tabs, previews, send confirmation
│   │   └── faturacao/  # Charts, KPIs, invoice table, P&L
│   ├── landing/        # ~25 componentes de landing pages
│   ├── webinar/        # Live webinar components + configs
│   ├── upgrade/        # Funil de upgrade (steps + invoice)
│   ├── recursos/       # Portal de recursos (login + conteúdo)
│   ├── legal/          # Termos e privacidade (modal)
│   └── ui/             # 50+ shadcn/ui primitives
├── hooks/              # 8 custom hooks
├── contexts/           # WebinarContext (CRM webinar filter)
├── config/             # webinarConfig.ts (constantes centrais)
├── lib/                # utils.ts + genderDetection.ts
├── integrations/supabase/  # client.ts + types.ts (auto-generated)
└── assets/             # Imagens, logos, fotos

supabase/
├── functions/          # 43 Edge Functions (Deno)
├── migrations/         # SQL migrations
└── config.toml         # 31 functions with verify_jwt=false
```

---

## 3. Routing (`src/App.tsx`)

| Rota | Componente | Tipo |
|------|-----------|------|
| `/` | `Index` → redirect para `/gravacao` | Landing |
| `/inicial` | `Inicial` | Landing Imagens |
| `/video` | `VideoPage` | Landing Vídeo pós-evento |
| `/video-lp` | `VideoLPPage` | Landing Vídeo pré-evento |
| `/gravacao` | `Gravacao` | Venda gravação imagens |
| `/comprar` | `Comprar` | Selector de planos vídeo |
| `/confirmacao` | `Confirmacao` | Pós-inscrição/pagamento |
| `/upgrade` | `Upsell` | Funil upgrade imagens |
| `/upgrade-video` | `UpgradeVideo` | Funil upgrade vídeo |
| `/upgrade-gravacao` | `UpgradeGravacao` | Upsell pós-gravação |
| `/upgrade/sucesso` | `UpgradeSucesso` | Confirmação de sucesso |
| `/live` | `WebinarLive` | Webinar ao vivo imagens |
| `/live-video` | `WebinarLiveVideo` | Webinar ao vivo vídeo |
| `/convites` | `Convites` | Programa de referrals |
| `/recursos` | `Recursos` | Portal recursos imagens |
| `/recursos-video` | `RecursosVideo` | Portal recursos vídeo |
| `/pagar` | `Pagar` | Intermediário de pagamento |
| `/fatura` | `Fatura` | Portal NIF/dados fiscais |
| `/termos` | `Termos` | Legal |
| `/crm` | `CRM` | Admin CRM (protegido) |
| `*` | `NotFound` | 404 |

---

## 4. Hooks Customizados

### `useInscritos()` — `src/hooks/useInscritos.ts`
Hook central do CRM. Gere todo o estado dos inscritos.

- **Fetch**: `supabase.from("registrations").select("*").limit(5000)` com polling a cada 30s
- **Mapping**: `mapRegistration()` normaliza os dados do DB → tipo `Inscrito` (normaliza plan prefixes, calcula `payment_status`, detecta género)
- **Acções expostas**: `addNota`, `removeNota`, `updateStatus`, `toggleFollowUp`, `deleteInscrito`, `setGender`, `updateName`, `toggleDoNotContact`, `fetchMessageLogs`, `fetchPaymentEvents`, `fetchFailedEmailIds`, `sendBacklogCheckin`, `fetchMessageLogsSummary`, `regenerateLink`, `resendPaymentEmail`, `updateStepReached`, `toggleInvoiceSent`, `grantPremium`, `updatePlan`, `markAsPaid`, `markAsLost`
- **Padrão optimista**: Todas as acções actualizam o state local imediatamente e depois persistem no DB

### `useWebinarSettings()` — `src/hooks/useWebinarSettings.ts`
- Singleton com cache em memória (`_cache`, `_fetchPromise`)
- Fetch único de `webinar_settings` → `Map<string, WebinarSettings>`
- `getPlanPrices(webinar, settingsMap)` — extrai preços por webinar com fallback hardcoded
- Usado no Dashboard, Pipeline, Faturação

### `useCountdown(targetDate)` — `src/hooks/useCountdown.ts`
- Timer a cada 1s, retorna `{days, hours, minutes, seconds, isUrgent, isVeryUrgent, isExpired}`
- `isUrgent` = <24h, `isVeryUrgent` = <1h

### `useRegistrationModal()` — `src/hooks/useRegistrationModal.tsx`
- Context Provider com estado do modal de inscrição
- Props: `variant` ("free"|"premium"), `referredBy` (from URL `?ref=`), `redirectPath`, `subtitle`, `webinar`

### `useCountUp(end, duration)` — Animação de contagem numérica
### `usePageMeta()` — Gestão de `<title>` e meta tags
### `useIsMobile()` — `src/hooks/use-mobile.tsx` — Media query `(max-width: 768px)`

---

## 5. Contextos React

### `WebinarContext` — `src/contexts/WebinarContext.tsx`
- Provider no `CRM.tsx`, wraps `CRMInner`
- Estado: `webinarContext: "imagens" | "video" | "consolidado"` (default: `"video"`)
- Usado pelo `CRMSidebar` (switcher) e por `filterByWebinar()` em todas as views

### `RegistrationModalProvider` — `src/hooks/useRegistrationModal.tsx`
- Usado nas landing pages para gerir o modal de inscrição
- Suporta `?ref=CODE` para tracking de referrals

---

## 6. Schema da Base de Dados

### Tabela `registrations` (tabela principal — ~50 colunas)
```sql
-- Chave primária
id          UUID DEFAULT gen_random_uuid()

-- Identificação
name        TEXT NOT NULL
email       TEXT NOT NULL
first_name  TEXT
last_name   TEXT
whatsapp    TEXT

-- Webinar + Plano
webinar           TEXT NOT NULL DEFAULT 'imagens'    -- UNIQUE com email
plan_selected     TEXT                                -- "premium", "video-masterclass", etc.
registration_source TEXT NOT NULL DEFAULT 'webinar'  -- "webinar" | "gravacao"

-- Pagamento
paid_at               TIMESTAMPTZ
paid_amount           NUMERIC
eupago_ref            TEXT
eupago_transaction_id TEXT
order_id              TEXT DEFAULT left(replace(gen_random_uuid()::text,'-',''),12)
last_payment_link     TEXT
payment_link_created_at TIMESTAMPTZ
last_payment_link_sent_at TIMESTAMPTZ

-- Faturação
edit_token          TEXT        -- 40 chars (UUID+8)
edit_token_created_at TIMESTAMPTZ
invoice_sent        BOOLEAN DEFAULT false
invoice_document_id TEXT

-- Funil
step_reached        INTEGER DEFAULT 1
upgrade_clicked_at  TIMESTAMPTZ
sources             TEXT        -- comma-separated
duvida              TEXT
role                TEXT
team_size           TEXT

-- Follow-up
followup_stage      INTEGER DEFAULT 0
last_followup_at    TIMESTAMPTZ
next_followup_at    TIMESTAMPTZ
do_not_contact      BOOLEAN DEFAULT false

-- Premium
premium_unlocked    BOOLEAN DEFAULT false
premium_granted_at  TIMESTAMPTZ
premium_granted_by  TEXT

-- Referrals
referral_code       TEXT NOT NULL   -- 6 chars, unique
referred_by         TEXT

-- Grupo
group_payment_ref   UUID
is_gift             BOOLEAN DEFAULT false
gift_code           TEXT
gifted_at           TIMESTAMPTZ

-- Estado
gender_override     TEXT
lost_at             TIMESTAMPTZ
lost_reason         TEXT
attended_live_at    TIMESTAMPTZ
created_at          TIMESTAMPTZ DEFAULT now()
```

**Índice único**: `(email, webinar)` — permite o mesmo email em webinars diferentes.

**RLS**: SELECT e UPDATE abertos para anon. INSERT e DELETE bloqueados (feitos via Edge Functions com service_role).

### Tabela `invoice_details`
```sql
registration_id  UUID PRIMARY KEY
invoice_name     TEXT NOT NULL
invoice_vat      TEXT NOT NULL    -- 9 dígitos
invoice_address  TEXT NOT NULL
invoice_zip      TEXT NOT NULL    -- XXXX-XXX
invoice_city     TEXT NOT NULL
invoice_email    TEXT NOT NULL
updated_at       TIMESTAMPTZ
```
**RLS**: SELECT aberto. INSERT/UPDATE/DELETE bloqueados — escrita exclusivamente via `invoice-upsert` com `service_role`.

### Tabela `message_logs`
```sql
id                  UUID PRIMARY KEY
registration_id     UUID NOT NULL
channel             TEXT DEFAULT 'email'    -- "email" | "sms"
provider            TEXT NOT NULL           -- "resend" | "brevo" | "egoi" | "smsonline" | "internal" | "system"
template_key        TEXT NOT NULL           -- "video_confirmation", "invoice_request", etc.
status              TEXT DEFAULT 'queued'   -- "queued" | "sent" | "failed"
provider_message_id TEXT
error               TEXT
payment_url         TEXT
created_at          TIMESTAMPTZ DEFAULT now()
updated_at          TIMESTAMPTZ DEFAULT now()
```
**RLS**: SELECT, INSERT e UPDATE abertos para anon. DELETE bloqueado.

### Tabela `email_send_logs`
```sql
id               UUID PRIMARY KEY
webinar          TEXT NOT NULL
email_key        TEXT NOT NULL       -- template key
recipient_email  TEXT NOT NULL
fname            TEXT
status           TEXT NOT NULL       -- "sent" | "failed"
resend_id        TEXT
error_message    TEXT
sent_at          TIMESTAMPTZ
metadata         JSONB
```
**RLS**: SELECT e INSERT abertos. UPDATE e DELETE bloqueados.

### Tabela `payment_events`
```sql
id              UUID PRIMARY KEY
registration_id UUID
event_type      TEXT NOT NULL    -- "webhook_received" | "link_created" | "payment_confirmed" | "unmatched_payment"
eupago_ref      TEXT
idempotency_key TEXT NOT NULL    -- UNIQUE — garante dedup
payload         JSONB DEFAULT '{}'
received_at     TIMESTAMPTZ DEFAULT now()
processed_at    TIMESTAMPTZ
```
**RLS**: SELECT e INSERT abertos. UPDATE e DELETE bloqueados.

### Tabela `email_templates`
```sql
id           UUID PRIMARY KEY
template_key TEXT NOT NULL
name         TEXT NOT NULL
channel      TEXT DEFAULT 'email'
subject      TEXT NOT NULL
html_body    TEXT
text_body    TEXT
variables    JSONB DEFAULT '[]'
is_active    BOOLEAN DEFAULT true
version      INTEGER DEFAULT 1
updated_by   TEXT
updated_at   TIMESTAMPTZ DEFAULT now()
```
**RLS**: SELECT aberto. INSERT/UPDATE/DELETE bloqueados (protegido contra modificações não autorizadas).

### Tabela `webinar_settings`
```sql
webinar          TEXT PRIMARY KEY    -- "imagens" | "video"
label            TEXT NOT NULL
emoji            TEXT DEFAULT ''
color            TEXT DEFAULT '#1e40af'
event_date       TIMESTAMPTZ
price_premium    NUMERIC DEFAULT 0
price_masterclass NUMERIC DEFAULT 0
price_bundle     NUMERIC DEFAULT 0
landing_visitors INTEGER DEFAULT 0
cutoff_date      TIMESTAMPTZ
live_views       INTEGER
live_avg_duration TEXT
live_peak_viewers INTEGER
live_likes       INTEGER
live_new_subs    INTEGER
live_date        TEXT
```
**RLS**: SELECT e UPDATE abertos (admin edita preços/métricas no CRM). INSERT e DELETE bloqueados.

### Tabela `acquisition_costs`
```sql
id          UUID PRIMARY KEY
platform    TEXT NOT NULL
amount      NUMERIC NOT NULL
cost_date   DATE DEFAULT CURRENT_DATE
description TEXT DEFAULT ''
category    TEXT DEFAULT 'paid_media'
webinar     TEXT DEFAULT 'video'
```
**RLS**: CRUD completo aberto.

### Tabela `scheduled_sends`
```sql
id           UUID PRIMARY KEY
channel      TEXT DEFAULT 'email'
subject      TEXT
html_body    TEXT
text_body    TEXT
recipients   JSONB DEFAULT '[]'
scheduled_at TIMESTAMPTZ NOT NULL
status       TEXT DEFAULT 'pending'
metadata     JSONB
```
**RLS**: CRUD completo para authenticated users.

### Tabela `analytics_cache`
```sql
key        TEXT PRIMARY KEY
value      INTEGER NOT NULL
source     TEXT DEFAULT 'manual'
updated_at TIMESTAMPTZ DEFAULT now()
```
**RLS**: SELECT aberto. Escrita bloqueada (via Edge Functions).

### Tabela `user_roles`
```sql
id      UUID PRIMARY KEY
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
role    app_role NOT NULL   -- ENUM: 'admin' | 'moderator' | 'user'
UNIQUE(user_id, role)
```
**RLS**: SELECT apenas para o próprio utilizador (`auth.uid() = user_id`). INSERT/UPDATE/DELETE bloqueados.

---

## 7. Funções de Base de Dados

### `has_role(_user_id UUID, _role app_role) → BOOLEAN`
- `SECURITY DEFINER` — executa com privilégios do owner, bypassa RLS
- Usada nas políticas RLS e na verificação de admin no CRM

### `auto_assign_admin() → TRIGGER`
- Trigger em `auth.users` (on INSERT)
- Se `email = 'fredericodigital@gmail.com'` → insere role `admin` em `user_roles`

### `ensure_admin_role() → VOID`
- `SECURITY DEFINER` — chamada após MFA verify no login do CRM
- Insere role `admin` se o utilizador autenticado é `fredericodigital@gmail.com`

---

## 8. Autenticação e Segurança do CRM

### Fluxo de Login (`CRMLogin.tsx`)
```text
1. Email + Password → supabase.auth.signInWithPassword()
2. Check MFA factors → supabase.auth.mfa.listFactors()
   ├── Has verified TOTP → Screen "totp-verify"
   └── No TOTP → supabase.auth.mfa.enroll() → Screen "totp-setup"
3. TOTP Verify:
   a) supabase.auth.mfa.challenge({ factorId })
   b) supabase.auth.mfa.verify({ factorId, challengeId, code })
4. ensure_admin_role() → garante role admin
5. has_role(uid, 'admin') → verifica acesso
6. Se não admin → signOut + erro
```

### Verificação Contínua (`CRM.tsx`)
```typescript
// On mount:
const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
if (aal?.currentLevel !== aal?.nextLevel) → não autenticado (MFA pendente)

// + verifica has_role('admin')
// + onAuthStateChange para detectar logout
```

### Protecção de Edge Functions
- Maioria das Edge Functions: `verify_jwt = false` no `config.toml`
- Autenticação manual via:
  - `Authorization: Bearer <service_role_key>` (para chamadas internas)
  - `x-cron-secret` header (para cron jobs)
  - `x-crm-admin-email` + allowlist (para `delete-registration`)

---

## 9. Edge Functions — Detalhes Técnicos

### `register-free` — Fluxo de Registo
```text
Input: { firstName, lastName, email, whatsapp, referredBy, registrationSource, webinar }

1. Check existing by (email, webinar)
   ├── Exists → return referralCode + sync E-goi (non-blocking)
   │            └── If video webinar & no video registration → create one
   └── Not exists:
       a) Generate unique referral_code (6 chars, A-Z2-9)
       b) Generate edit_token (40 chars UUID)
       c) Generate order_id (12 chars)
       d) INSERT into registrations
       e) If referredBy → check count(referred_by) ≥ 2 → unlock premium
       f) Sync E-goi (imagens: sync-egoi, video: egoi-sync)
       g) Send video confirmation email (non-blocking)

Output: { referralCode, referralLink, alreadyRegistered, premiumUnlocked, editToken }
```

### `create-payment` — Criação de Pagamento
```text
Input: { plan, email, nome }

1. Derive webinar from plan prefix ("video-" → "video")
2. Idempotency: check recent eupago_ref (< 1h) → reuse
3. Lookup registration (id, edit_token, order_id)
4. Build identifier: "ORD-{name}-{planTag}" (SP/MC/PK)
5. Call EuPago API: paybylink/create
   - Methods: CC, MBWAY, MB
   - successUrl: /upgrade/sucesso?rid={id}&t={token}
   - callbackUrl: /functions/v1/eupago-webhook
6. Save transactionID, payment link to DB
7. Log to payment_events

Output: { paymentLink, reference }
```

### `eupago-webhook` — Reconciliação de Pagamentos (1154 linhas)
```text
Input: POST/GET com transactionStatus, reference, amount, identifier, paymentMethod, transactionID

Estratégias de matching (em cascata):
1. Strategy 1 (DIAG) — eupago_ref match (raro, IDs diferentes)
2. Strategy 1b — ORD-{name}-{planTag} → lookup por eupago_transaction_id ou planTag
3. Strategy GROUP — GROUP-{ref12} → actualiza todos os membros do grupo
4. Strategy 2 (PRIMARY) — ORDER-{order_id}-{name} → match por order_id (12 chars)
5. Strategy 3 (LEGACY) — extrai email do identifier antigo
6. Strategy 3b — WEBINAR-{PLAN}-{email}-{timestamp}

Pós-match:
a) derivePlanFromAmount() — safety net para corrigir plano baseado no montante pago
b) Auto-invoice: se NIF exists → create-invoice (emit), senão draft
c) Log payment_confirmed em payment_events
d) E-goi: attach tags (premium:35, masterclass:33) por webinar
e) Send invoice_notification email ao Frederico (com grid detalhado)
f) Send confirmação ao cliente (video_payment_premium ou video_payment_masterclass)
g) Send email de recursos (video_recursos_premium/masterclass/bundle)
h) Unmatched → payment_events com event_type "unmatched_payment"
```

### `send-email` — Hub Centralizado de Email
```text
Hierarquia de envio:
1. Brevo (primário) → brevo.com/v3/smtp/email
2. Resend (fallback 1) → resend.com/emails
3. E-goi Transactional V2 (fallback 2) → slingshot.egoiapp.com

Auth: service_role key OU x-cron-secret header
Sender: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>"
```

### `invoice-upsert` — Guardar Dados Fiscais
```text
1. Validate edit_token (30-day expiry)
2. Validate 6 campos (regex NIF, código postal, email)
3. Upsert invoice_details
4. Se paid_at → auto-emit invoice via create-invoice
5. Notify Frederico via send-email
6. Log "invoice_filled_notification" em message_logs
```

### `create-invoice` — Emissão via InvoiceExpress
```text
1. Fetch registration + invoice_details
2. Derive preço base: paid_amount / 1.23 (para NIFs PT)
3. Determine quantity (groups: N × price, single: 1)
4. Create invoice-receipt no InvoiceExpress API
5. Se !draft_only → change state to "finalized" → email to client
6. Log "invoice_created"/"invoice_finalized" em message_logs
```

### `resolve-payment` — Validação de Links
```text
1. Lookup by order_id
2. Se paid_at → redirect /upgrade/sucesso
3. Validate EuPago link (GET + redirect:manual, 8s timeout)
   - 200 ou 3xx com Location checkout → valid
   - 404/410 → regenerate via EuPago API
4. Return { redirectUrl, status }
```

### `send-invoice-request` — Solicitação de NIF
```text
1. Filter: paid + edit_token + sem invoice_details
2. Optional: filter by webinar ou registration_ids
3. Para cada: enviar email via send-email com link /fatura?rid={id}&t={token}
4. Log "invoice_request" em message_logs
```

---

## 10. Padrões Técnicos Importantes

### Normalização de Planos
```typescript
// DB armazena: "video-premium", "video-masterclass", "video-bundle"
// Frontend normaliza: remove "video-" prefix → "premium", "masterclass", "bundle"
plan.replace(/^video-/, "")
// "masterclass-group-pending" → "masterclass"
// "gravacao" → "premium" (equivalente funcional)
```

### Detecção de Género
```typescript
// src/lib/genderDetection.ts
// Dicionário de ~180 nomes portugueses (MALE/FEMALE sets)
// detectGender("Maria") → "F"
// detectGender("Unknown") → "U"
// Usado para personalização de emails: "Olá Maria" vs "Olá João"
```

### Cálculo de Payment Status
```typescript
payment_status = paid_at ? "paid"
  : (upgrade_clicked_at || eupago_ref) && plan !== "free" ? "awaiting_payment"
  : plan_selected && plan !== "free" ? "selected"
  : "free"
```

### Auto-save do InvoiceForm
```typescript
// Debounce de 600ms no useEffect
// Validação Zod inline → se válido → invoke("invoice-upsert")
// Indicadores visuais: Loader2 (saving), Check "Guardado", AlertCircle "Falha"
```

### Idempotência no Webhook
```typescript
// idempotency_key UNIQUE em payment_events
// "webhook-{txID}-{ref}" para dedup de webhooks
// "confirmed-{txID}-{regId}" para dedup de confirmações
// INSERT com ON CONFLICT ignora duplicados (23505)
```

### Filtro de Webinar no CRM
```typescript
// config/webinarConfig.ts
function filterByWebinar(items, context) {
  if (context === "consolidado") return items;
  if (context === "video") return items.filter(i => i.webinar === "video");
  return items.filter(i => !i.webinar || i.webinar === "imagens");
}
```

---

## 11. Integrações de API — Endpoints

### EuPago
- `POST https://clientes.eupago.pt/api/v1.02/paybylink/create` — criar link
- Webhook callback: `POST /functions/v1/eupago-webhook`
- Auth: `ApiKey {EUPAGO_API_KEY}`

### InvoiceExpress
- Base: `https://fomentarsonhos.app.invoicexpress.com`
- `POST /invoice_receipts.json?api_key=` — criar invoice-receipt
- `PUT /invoice_receipts/{id}/change-state.json?api_key=` — finalizar/enviar
- `PUT /invoice_receipts/{id}/email-document.json?api_key=` — enviar por email

### E-goi
- `GET https://api.egoiapp.com/lists/5/contacts?email=` — lookup contacto
- `POST https://api.egoiapp.com/lists/5/contacts/actions/attach-tag` — attach tag
- `POST https://slingshot.egoiapp.com/api/v2/email/messages/action/send/single` — email transaccional

### Brevo
- `POST https://api.brevo.com/v3/smtp/email` — envio de email

### Resend
- `POST https://api.resend.com/emails` — envio de email

### SMSOnline
- Usado via Edge Function `send-sms`

---

## 12. Template Labels (`templateLabels.ts`)

57 template keys mapeados para labels humanas em PT. Função auxiliar `getTemplateLabel(key)` com fallback de humanização automática (`_` → espaço, capitalize).

Utilidade `fmtTimeAgo(iso)` — formata datas relativas: "agora", "há 5min", "há 3h", "há 2d".

---

## 13. Configuração Central (`webinarConfig.ts`)

```typescript
WEBINAR_CONFIG = {
  imagens: { label, emoji:"📷", date, startDate, color:"#1e40af", ... },
  video:   { label, emoji:"🎬", date, startDate, color:"#16a34a", ... },
}

EGOI_CONFIG = {
  baseUrl: "https://api.egoiapp.com",
  listId: 5,
  tags: { videoWebinar: 34, premiumPass: 35, masterclass: 33 },
}

// Datas-chave
VIDEO_WEBINAR_DATE = 2026-03-05T10:00:00Z
VIDEO_QA_DATE = 2026-03-10T14:30:00Z
VIDEO_MASTERCLASS_DATE = 2026-03-12T10:00:00Z
```

---

## 14. Secrets Configurados (16)

| Secret | Uso |
|--------|-----|
| `EUPAGO_API_KEY` | Pagamentos |
| `INVOICEEXPRESS_API_KEY` | Faturação |
| `INVOICEEXPRESS_ACCOUNT` | Faturação (account name) |
| `RESEND_API_KEY` | Email (fallback 1) |
| `BREVO_API_KEY` | Email (primário) |
| `EGOI_API_KEY` | CRM marketing / tags |
| `SMSONLINE_API_KEY` | SMS |
| `CRON_SECRET` | Autenticação de cron jobs |
| `CRM_ADMIN_SECRET` | Acesso admin |
| `PUBLIC_SITE_URL` | URLs de callback |
| `LOVABLE_API_KEY` | Lovable AI |
| `SUPABASE_URL` | Auto-configurado |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-configurado |
| `SUPABASE_ANON_KEY` | Auto-configurado |
| `SUPABASE_PUBLISHABLE_KEY` | Auto-configurado |
| `SUPABASE_DB_URL` | Auto-configurado |

---

## 15. Convenções de Código

- **Tipagem**: `as any` usado frequentemente para contornar tipos auto-gerados do Supabase (tabelas `invoice_details`, campos novos)
- **Optimistic updates**: State local actualizado antes da resposta do DB
- **Non-blocking calls**: Operações secundárias (E-goi sync, emails) executadas com `.catch()` sem bloquear o fluxo principal
- **Idempotência**: Verificação de duplicados antes de envios (check `message_logs` por `template_key` + `registration_id`)
- **Dual logging**: Emails registados tanto em `message_logs` (timeline CRM) como em `email_send_logs` (auditoria detalhada)
- **Error handling**: Try/catch com logging extensivo em `console.log/warn/error` nas Edge Functions

