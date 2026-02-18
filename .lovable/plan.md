
## 3 Melhorias: Suporte na Página de Recursos, Acesso Premium no CRM e Voucher no Checkout

---

### A) PÁGINA DE RECURSOS — Secção de Suporte

**Situação actual:** A página `/recursos` tem FAQ mas nenhum canal de contacto directo.

**O que fazer:** Adicionar uma secção "Suporte" no final de `RecursosConteudo.tsx`, antes do "Sair", com:
- Texto: "Se tiveres dificuldades no acesso ou nos links, contacta o suporte."
- Botão WhatsApp: abre `https://wa.me/351915015508?text=Preciso%20de%20ajuda%20com%20a%20minha%20área%20de%20recursos` — ícone SVG verde, mesmo estilo do `WhatsAppSupportButton`
- Botão Email: `mailto:frederico@digitalfc.pt?subject=Ajuda%20Recursos%20Imagens%20com%20IA` — ícone `Mail`

**Ficheiro alterado:** `src/components/recursos/RecursosConteudo.tsx` — nova `<section>` entre o Upsell e o botão "Sair".

---

### B) CRM — OFERECER ACESSO PREMIUM (OFERTA)

#### B1. Migration SQL — 2 novas colunas em `registrations`

```sql
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS premium_granted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS premium_granted_by TEXT DEFAULT NULL;
```

Sem `premium_grant_reason` por enquanto (simplificado). Se necessário no futuro, é uma coluna adicional trivial.

Sem novas tabelas. O acesso premium de oferta é considerado válido sempre que `premium_granted_at IS NOT NULL`.

#### B2. Tipo `Inscrito` — `mockData.ts`

Adicionar:
```ts
premium_granted_at: string | null;
premium_granted_by: string | null;
```

#### B3. `mapRegistration` — `useInscritos.ts`

```ts
premium_granted_at: r.premium_granted_at || null,
premium_granted_by: r.premium_granted_by || null,
```

#### B4. Nova função `grantPremium` — `useInscritos.ts`

```ts
const grantPremium = useCallback(async (inscritoId: string, adminEmail: string) => {
  const current = inscritos.find((i) => i.id === inscritoId);
  if (!current) return;

  const isGranted = !!current.premium_granted_at;
  const now = new Date().toISOString();
  
  if (isGranted) {
    // Revogar: limpar os campos
    await supabase.from("registrations")
      .update({ premium_granted_at: null, premium_granted_by: null })
      .eq("id", inscritoId);
    
    // Log
    await supabase.from("message_logs").insert({
      registration_id: inscritoId,
      template_key: "crm_premium_granted",
      status: "sent",
      provider: "internal",
      channel: "email",
    });
    
    setInscritos(prev => prev.map(i =>
      i.id === inscritoId
        ? { ...i, premium_granted_at: null, premium_granted_by: null }
        : i
    ));
  } else {
    // Conceder
    await supabase.from("registrations")
      .update({ premium_granted_at: now, premium_granted_by: adminEmail })
      .eq("id", inscritoId);
    
    // Log
    await supabase.from("message_logs").insert({
      registration_id: inscritoId,
      template_key: "crm_premium_granted",
      status: "sent",
      provider: "internal",
      channel: "email",
    });
    
    setInscritos(prev => prev.map(i =>
      i.id === inscritoId
        ? { ...i, premium_granted_at: now, premium_granted_by: adminEmail }
        : i
    ));
  }
}, [inscritos]);
```

#### B5. UI — InscritoModal: novo bloco "Acesso Premium (Oferta)"

Localização: no painel esquerdo escuro do `InscritoModal`, após o separador "Acções" e antes dos botões existentes — ou em alternativa, no painel direito após `InvoiceSection`. Escolho o **painel direito** para não sobrecarregar o painel escuro.

O bloco é colocado após `<InvoiceSection>` e antes de `<ActivityTimeline>`:

```tsx
{/* Premium Grant Control */}
<div className="my-4 p-4 rounded-xl border border-border bg-card">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Gift size={14} className="text-purple-600" />
      <span className="text-[13px] font-semibold text-foreground">Acesso Premium (Oferta)</span>
      {inscrito.premium_granted_at && (
        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
          Activo
        </span>
      )}
    </div>
    <button
      onClick={() => onGrantPremium?.(inscrito.id)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        inscrito.premium_granted_at
          ? "bg-purple-600"
          : "bg-input"
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        inscrito.premium_granted_at ? "translate-x-6" : "translate-x-1"
      }`} />
    </button>
  </div>
  {inscrito.premium_granted_at && (
    <p className="text-[11px] text-muted-foreground mt-1.5">
      Concedido por {inscrito.premium_granted_by || "—"} • {fmtDate(inscrito.premium_granted_at)}
    </p>
  )}
</div>
```

#### B6. Log na Timeline

Adicionar `"crm_premium_granted"` ao array `MANUAL_KEYS` na `ActivityTimeline.tsx` e ao `TEMPLATE_LABELS` em `templateLabels.ts`:

```ts
crm_premium_granted: "Acesso Premium concedido (Oferta)",
```

#### B7. Efeito do grant nas páginas protegidas

A página `/recursos` já valida `paid_at IS NOT NULL`. Para respeitar o `premium_granted_at`, a query de validação em `RecursosLogin.tsx` precisa de ser expandida:

```ts
// Antes:
.select("edit_token, first_name, plan_selected, paid_at")
// check: data?.paid_at

// Depois:
.select("edit_token, first_name, plan_selected, paid_at, premium_granted_at")
// check: data?.paid_at || data?.premium_granted_at
```

A mesma lógica aplica-se à revalidação silenciosa em `Recursos.tsx`.

#### B8. Prop chain

- `CRM.tsx`: `onGrantPremium={grantPremium}` → `InscritoModal`
- `InscritoModal`: aceita `onGrantPremium?: (id: string) => void` + passa o email do admin (via `supabase.auth.getUser()`)
- Para obter o email do admin dentro do modal, fazer `supabase.auth.getUser()` no momento do clique — sem estado extra no componente pai

---

### C) VOUCHER "fredgratis" — `/upgrade-gravacao` (último passo)

#### Arquitectura de segurança

A validação do voucher é feita **server-side** via nova Edge Function `redeem-voucher`:

```
Cliente clica "Tenho um voucher"
  → input de código aparece
  → submit → POST /redeem-voucher { code, email, plan }
  → Edge Function valida o código (não está em código JS do browser)
  → Se válido: actualiza registrations (is_gift=true, gift_code, gifted_at, paid_at=now)
                insere message_logs (voucher_redeemed)
                retorna { success: true }
  → Frontend: redireciona para página de sucesso (sem EuPago)
```

O código `"fredgratis"` **nunca é enviado para o browser** — está apenas no servidor.

#### C1. Migration SQL — novas colunas em `registrations`

```sql
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS is_gift BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS gift_code TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS gifted_at TIMESTAMPTZ DEFAULT NULL;
```

#### C2. Nova Edge Function `redeem-voucher`

Ficheiro: `supabase/functions/redeem-voucher/index.ts`

```ts
const VALID_CODES: Record<string, { product: string; description: string }> = {
  "fredgratis": { product: "gravacao", description: "Gravação + Pack de Apoio — Oferta" },
};

// Validações:
// 1. code existe em VALID_CODES (case-insensitive)
// 2. email existe em registrations
// 3. registration.paid_at IS NULL (não pagou ainda) e is_gift IS NOT true (não usou voucher)
// 4. Se válido:
//    UPDATE registrations SET
//      paid_at = NOW(),
//      is_gift = true,
//      gift_code = code,
//      gifted_at = NOW(),
//      plan_selected = 'gravacao'  -- ou o plan do código
//    INSERT message_logs (template_key: 'voucher_redeemed', status: 'sent', provider: 'internal')
```

Config (`supabase/config.toml`):
```toml
[functions.redeem-voucher]
verify_jwt = false
```

Resposta de sucesso:
```json
{ "success": true, "redirectUrl": "/upgrade/sucesso?rid=...&t=..." }
```

Resposta de erro:
```json
{ "error": "Código inválido." }
// ou: "Este voucher já foi utilizado."
// ou: "Esta conta já tem acesso pago."
```

#### C3. `GravacaoConfirmation.tsx` — UI do voucher

**Localização:** Abaixo do botão verde "Confirmar e pagar", antes do "🔒 Pagamento seguro EuPago". Um link discreto e pequeno:

```tsx
// Estado
const [showVoucher, setShowVoucher] = useState(false);
const [voucherCode, setVoucherCode] = useState("");
const [voucherLoading, setVoucherLoading] = useState(false);
const [voucherError, setVoucherError] = useState<string | null>(null);

// UI
{!showVoucher ? (
  <p
    onClick={() => setShowVoucher(true)}
    className="text-center text-[12px] text-ink-300 mt-3 cursor-pointer hover:text-ink-500 transition-colors"
  >
    Tenho um voucher
  </p>
) : (
  <div className="mt-3 flex gap-2">
    <input
      type="text"
      placeholder="Código de voucher"
      value={voucherCode}
      onChange={(e) => setVoucherCode(e.target.value)}
      className="flex-1 border border-border rounded-lg px-3 py-2 text-[13px] ..."
    />
    <button
      onClick={handleRedeemVoucher}
      disabled={voucherLoading || !voucherCode.trim()}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium ..."
    >
      {voucherLoading ? <Loader2 className="animate-spin" size={14} /> : "Aplicar"}
    </button>
  </div>
)}
{voucherError && <p className="text-center text-[12px] text-red-500 mt-1">{voucherError}</p>}
```

#### C4. `handleRedeemVoucher` em `GravacaoConfirmation.tsx`

```tsx
const handleRedeemVoucher = async () => {
  if (!userEmail || !voucherCode.trim()) return;
  setVoucherLoading(true);
  setVoucherError(null);
  try {
    const { data, error } = await supabase.functions.invoke("redeem-voucher", {
      body: {
        code: voucherCode.trim(),
        email: userEmail,
        plan: plan,
      },
    });
    if (error || !data?.success) {
      setVoucherError(data?.error || "Código inválido. Tenta novamente.");
      return;
    }
    // Sucesso: redirecionar para a página de sucesso
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    }
  } catch {
    setVoucherError("Erro de ligação. Tenta novamente.");
  } finally {
    setVoucherLoading(false);
  }
};
```

#### C5. `templateLabels.ts` — novo label

```ts
voucher_redeemed: "Voucher aplicado (Acesso gratuito)",
```

E adicionar `"voucher_redeemed"` ao `MANUAL_KEYS` da `ActivityTimeline` para aparecer no filtro "Manual".

#### C6. Página de sucesso após voucher

A Edge Function `redeem-voucher` retorna `redirectUrl` no formato `/upgrade/sucesso?rid={id}&t={token}`. A `UpgradeSucesso.tsx` já verifica `paid_at` na DB — como o voucher define `paid_at = NOW()`, a página de sucesso mostra automaticamente o estado "Pagamento confirmado" sem alterações.

---

### Ficheiros a criar/editar

| Ficheiro | Acção | Resumo |
|---|---|---|
| Migration SQL | Criar | `premium_granted_at`, `premium_granted_by`, `is_gift`, `gift_code`, `gifted_at` |
| `src/components/recursos/RecursosConteudo.tsx` | Editar | Adicionar secção Suporte (WhatsApp + Email) |
| `src/components/recursos/RecursosLogin.tsx` | Editar | Validar também `premium_granted_at` no check de acesso |
| `src/pages/Recursos.tsx` | Editar | Validar `premium_granted_at` na revalidação silenciosa |
| `src/pages/crm/mockData.ts` | Editar | Adicionar campos `premium_granted_at`, `premium_granted_by` |
| `src/hooks/useInscritos.ts` | Editar | `mapRegistration` + nova função `grantPremium` + exportar |
| `src/components/crm/InscritoModal.tsx` | Editar | Nova prop `onGrantPremium`, UI do toggle Premium |
| `src/pages/CRM.tsx` | Editar | Passar `grantPremium` ao `InscritoModal` |
| `src/components/crm/templateLabels.ts` | Editar | Adicionar `crm_premium_granted`, `voucher_redeemed` |
| `src/components/crm/modal/ActivityTimeline.tsx` | Editar | `MANUAL_KEYS` + novos template keys |
| `supabase/functions/redeem-voucher/index.ts` | Criar | Edge Function de validação server-side do voucher |
| `supabase/config.toml` | Editar | `[functions.redeem-voucher] verify_jwt = false` |
| `src/components/upgrade/GravacaoConfirmation.tsx` | Editar | UI "Tenho um voucher" + `handleRedeemVoucher` |

---

### Notas importantes

- O código `"fredgratis"` **nunca aparece no JavaScript do browser** — está apenas na Edge Function server-side
- O toggle de Premium no CRM usa o email do admin autenticado (`supabase.auth.getUser()`) para preencher `premium_granted_by`
- A página `/recursos` passa a aceitar acesso se `paid_at OR premium_granted_at` existir
- O voucher define `paid_at = NOW()`, logo o utilizador passa a ter acesso a `/recursos` automaticamente
- Nenhuma alteração às Edge Functions existentes (create-payment, eupago-webhook)
