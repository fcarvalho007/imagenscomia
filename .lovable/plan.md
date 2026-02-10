

# Sistema de Convites "Traz 2 Amigos, Ganha Premium"

## Resumo

Criar um sistema de referral onde cada utilizador que se inscreve gratuitamente recebe um link unico para convidar 2 amigos. Quando ambos se registam, o convidador ganha acesso Premium automaticamente. Inclui uma pagina de acompanhamento dos convites e integracao visivel na landing page.

---

## Arquitectura do Sistema

```text
Utilizador regista-se (gratuito)
        |
        v
Edge Function: register-free
  - Guarda na tabela registrations
  - Gera referral_code unico (6 chars)
  - Devolve { referralCode, referralLink }
        |
        v
Modal de confirmacao mostra:
  - "Convida 2 amigos e ganha Premium gratis!"
  - Link de partilha copiavel
  - Botao WhatsApp / email
        |
        v
Amigo clica link /?ref=ABC123
  - Parametro ref e capturado
  - Ao registar-se, referred_by = ABC123
        |
        v
Edge Function: register-free
  - Guarda registo com referred_by
  - Conta quantos amigos ja se registaram para esse referral_code
  - Se count >= 2: marca convidador como premium_unlocked = true
  - (Opcional: envia email ao convidador)
        |
        v
Pagina /convites?email=xxx
  - Utilizador ve o estado dos seus convites
  - Mostra: link, quantos registados (0/2, 1/2, 2/2)
  - Se 2/2: mostra badge "Premium Desbloqueado!"
```

---

## 1. Tabela de Base de Dados: `registrations`

```sql
CREATE TABLE public.registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  referral_code TEXT NOT NULL UNIQUE,
  referred_by TEXT DEFAULT NULL,
  premium_unlocked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Politica: leitura publica limitada (a edge function usa service role)
-- Nao precisa de RLS para select publico pois o acesso e feito via edge functions
```

Notas:
- `referral_code`: codigo unico de 6 caracteres (ex: ABC123)
- `referred_by`: o referral_code de quem convidou (nullable)
- `premium_unlocked`: true quando 2 amigos se registaram
- Sem auth.users — isto nao requer login, apenas email de registo do webinar

---

## 2. Edge Function: `register-free`

Ficheiro: `supabase/functions/register-free/index.ts`

Recebe POST com `{ name, email, referredBy? }`

Logica:
1. Verifica se email ja existe (se sim, devolve o referral_code existente)
2. Gera referral_code aleatorio de 6 caracteres (A-Z0-9)
3. Insere na tabela `registrations` com `referred_by` se presente
4. Se `referred_by` existe: conta quantos registos tem esse referral_code como referred_by
5. Se count >= 2: UPDATE o registo do convidador para `premium_unlocked = true`
6. Devolve `{ referralCode, referralLink, alreadyRegistered }`

---

## 3. Edge Function: `check-referrals`

Ficheiro: `supabase/functions/check-referrals/index.ts`

Recebe POST com `{ email }`

Logica:
1. Procura o registo pelo email
2. Se nao encontra: devolve erro
3. Busca todos os registos com `referred_by = referral_code` deste utilizador
4. Devolve `{ referralCode, referralLink, referrals: [{ name, createdAt }], premiumUnlocked, totalNeeded: 2 }`

---

## 4. Alteracoes no Modal de Registo

### Fluxo gratuito actualizado:

Antes: `handleSubmitFree` fazia apenas um setTimeout fake.
Agora: chama a edge function `register-free` e guarda o resultado.

### ConfirmationView actualizado:

Apos confirmacao gratuita, mostrar novo bloco:

```text
+------------------------------------------+
|  🎁 Ganha Premium Grátis!                |
|                                          |
|  Convida 2 amigos e desbloqueia o        |
|  Premium Pass (valor €15) sem pagar.     |
|                                          |
|  [  Copiar link de convite  📋  ]        |
|                                          |
|  [WhatsApp]  [Email]                     |
|                                          |
|  0/2 amigos registados                   |
|  Ver estado dos convites →               |
+------------------------------------------+
```

- Botao "Copiar link" copia `https://site.com/?ref=ABC123`
- Botao WhatsApp abre wa.me com mensagem pre-preenchida
- Botao Email abre mailto com subject e body
- Link "Ver estado dos convites" navega para `/convites?email=xxx`

---

## 5. Nova Pagina: `/convites`

Ficheiro: `src/pages/Convites.tsx`
Rota: `/convites`

### Fluxo:
1. Pede email ao utilizador (ou recebe via query param `?email=xxx`)
2. Chama edge function `check-referrals`
3. Mostra painel com:

```text
+------------------------------------------+
|  Os Teus Convites                        |
|                                          |
|  O teu link: site.com/?ref=ABC123       |
|  [Copiar]                                |
|                                          |
|  Progresso: ████░░░░ 1/2                 |
|                                          |
|  ✓ Maria Silva — registou-se 10 Fev     |
|  ○ A aguardar 2º convite...              |
|                                          |
|  Falta 1 amigo para desbloquear o        |
|  Premium Pass grátis!                    |
+------------------------------------------+
```

Se 2/2:
```text
|  🎉 Premium Desbloqueado!               |
|  Já tens acesso a tudo do Premium Pass.  |
|  Não precisas de pagar.                  |
```

Design: mesmo estilo editorial da landing page, centrado, max-w-520px.

---

## 6. Captura do parametro `ref` na landing page

### Alteracao em `Index.tsx` ou `useRegistrationModal`:

- Ao carregar a pagina, ler `?ref=XXX` da URL
- Guardar em state/context
- Quando o utilizador se regista (free), passar `referredBy: refCode` ao `register-free`

### Alteracao no `useRegistrationModal.tsx`:
- Adicionar `referralCode` ao contexto (capturado da URL)

---

## 7. Seccao na Landing Page: "Traz Amigos"

### Nova seccao ou bloco no PricingCardsSection:

Adicionar abaixo dos cartoes de pricing um bloco visivel:

```text
+------------------------------------------+
|  OU GANHA PREMIUM GRÁTIS                 |
|                                          |
|  Inscreve-te grátis e convida 2 amigos.  |
|  Se ambos se registarem, ganhas acesso   |
|  Premium (€15) sem pagar nada.           |
|                                          |
|  [Inscrever e receber link de convite]   |
+------------------------------------------+
```

Posicao: entre os cartoes de pricing e o FAQ, ou como nota dentro do cartao gratuito.

---

## 8. Ficheiros a criar/alterar

### Novos ficheiros:
| Ficheiro | Descricao |
|----------|-----------|
| `supabase/functions/register-free/index.ts` | Edge function de registo gratuito |
| `supabase/functions/check-referrals/index.ts` | Edge function de verificacao de convites |
| `src/pages/Convites.tsx` | Pagina de acompanhamento de convites |

### Ficheiros alterados:
| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/landing/RegistrationModal.tsx` | handleSubmitFree chama edge function; ConfirmationView mostra bloco de convites |
| `src/hooks/useRegistrationModal.tsx` | Captura `ref` da URL e expoe referralCode |
| `src/pages/Index.tsx` | Le parametro `?ref` da URL |
| `src/App.tsx` | Adicionar rota `/convites` |
| `src/components/landing/PricingCardsSection.tsx` | Adicionar bloco "Ganha Premium gratis" |

### Migracao DB:
- Criar tabela `registrations` com RLS

### Config:
- `supabase/config.toml` — registar as 2 novas edge functions com `verify_jwt = false`

---

## 9. Sequencia de implementacao

1. Criar tabela `registrations` (migracao DB)
2. Criar edge function `register-free`
3. Criar edge function `check-referrals`
4. Actualizar `useRegistrationModal` para capturar `?ref` da URL
5. Actualizar `RegistrationModal` — handleSubmitFree + ConfirmationView com convites
6. Criar pagina `/convites`
7. Adicionar rota no App.tsx
8. Adicionar bloco referral na seccao de pricing
9. Deploy edge functions e testar fluxo completo

