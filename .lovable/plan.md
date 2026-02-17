

## Correcao: Modal de inscricao "nao avanca" apos submissao

### Causa raiz identificada

Na linha 67 de `RegistrationModal.tsx`, apos o registo ser gravado com sucesso na base de dados, o codigo executa:

```text
fbq('track', 'Lead');
```

Se o Facebook Pixel nao estiver carregado (bloqueador de anuncios, ligacao lenta, Safari ITP), `fbq` lanca um `ReferenceError`. Este erro e apanhado pelo `catch`, que mostra "Erro ao processar" -- mas o registo ja foi gravado. O utilizador fica "preso" sem avancar.

**Nota:** O ficheiro `Confirmacao.tsx` ja usa a proteccao correcta (`typeof fbq !== "undefined"`), mas `RegistrationModal.tsx` e `PurchaseModal.tsx` nao.

### Ficheiros a alterar

| Ficheiro | Accao |
|----------|-------|
| `src/components/landing/RegistrationModal.tsx` | Proteger fbq, melhorar erros, normalizar inputs |
| `src/components/webinar/PurchaseModal.tsx` | Proteger fbq |
| `supabase/functions/register-free/index.ts` | Melhorar CORS headers, aceitar lastName vazio, normalizar whatsapp |

---

### 1. RegistrationModal.tsx -- Correcoes

**a) Proteger fbq (causa raiz do bug):**

Mover `fbq` para depois do `close()` e proteger:

```text
// ANTES (linha 67):
fbq('track', 'Lead');

// DEPOIS:
if (typeof fbq !== "undefined") {
  try { fbq('track', 'Lead'); } catch (_) {}
}
```

**b) Normalizar inputs antes do envio:**

- Email: `email.trim().toLowerCase()`
- WhatsApp: remover espacos, tracos, parenteses; normalizar para formato limpo

```text
const normalizedPhone = whatsapp.replace(/[\s\-\(\)\.]/g, "");
```

**c) Melhorar mensagens de erro:**

No `catch`, verificar o tipo de erro e mostrar mensagem mais especifica:

```text
catch (err: unknown) {
  console.error("Registration error:", err);
  const message = err instanceof Error ? err.message : "";
  if (message.includes("already") || message.includes("duplicate")) {
    setError("Este email já está inscrito.");
  } else if (message.includes("obrigatório") || message.includes("required")) {
    setError("Preencha todos os campos obrigatórios.");
  } else {
    setError("Não foi possível concluir. Verifique os dados e tente novamente.");
  }
}
```

**d) Validacao de lastName:**

Aceitar nome com uma unica palavra (sem apelido). Se o utilizador escrever apenas "Maria", enviar `lastName` como string vazia em vez de bloquear:

```text
const lastName = fullName.trim().split(" ").slice(1).join(" ") || "";
```

Isto ja e o comportamento actual no frontend, mas o backend rejeita `!lastName`. Corrigir no backend (ponto 3).

### 2. PurchaseModal.tsx -- Proteger fbq

Linha 79:

```text
// ANTES:
fbq('track', 'Purchase', { value: prices[plan] || 0, currency: 'EUR' });

// DEPOIS:
if (typeof fbq !== "undefined") {
  try { fbq('track', 'Purchase', { value: prices[plan] || 0, currency: 'EUR' }); } catch (_) {}
}
```

### 3. register-free/index.ts -- Backend

**a) Aceitar lastName vazio:**

Linha 32 -- remover `!lastName` da validacao:

```text
// ANTES:
if (!firstName || !lastName || !email) {

// DEPOIS:
if (!firstName || !email) {
```

**b) Normalizar whatsapp no backend:**

Antes de gravar, limpar o numero:

```text
const cleanPhone = whatsapp
  ? whatsapp.replace(/[\s\-\(\)\.]/g, "")
  : null;
```

**c) Melhorar CORS headers:**

Actualizar para incluir os headers que o cliente Supabase envia:

```text
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};
```

### O que NAO muda

- Logica de sync-egoi (ja e non-blocking com try/catch)
- Logica de referrals e premium_unlocked
- Estrutura da base de dados (nenhuma migracao necessaria)
- Copy/texto do site (excepto mensagens de erro)
- Fluxo de upsell/confirmacao

### Resultado esperado

- O utilizador avanca SEMPRE quando a BD confirma o registo, independentemente de ad blockers
- Erros de terceiros (fbq, E-goi) nunca bloqueiam a inscricao
- Mensagens de erro claras e especificas
- Inputs normalizados (email lowercase, telefone limpo)
