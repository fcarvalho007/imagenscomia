

## Refinamento: Proteccao de tracking e tratamento de erros

### Ficheiros a alterar

| Ficheiro | Accao |
|----------|-------|
| `src/components/landing/RegistrationModal.tsx` | Reforcar fbq, normalizar telefone, melhorar erros |
| `src/components/webinar/PurchaseModal.tsx` | Reforcar fbq |

### 1. RegistrationModal.tsx

**a) fbq mais robusto (linhas 72-74)**

Substituir `typeof fbq !== "undefined"` por acesso via `window` + execucao fora do fluxo principal:

```text
// ANTES:
if (typeof fbq !== "undefined") {
  try { fbq('track', 'Lead'); } catch (_) {}
}

// DEPOIS:
setTimeout(() => {
  try {
    const fbqSafe = (window as any)?.fbq;
    if (typeof fbqSafe === "function") fbqSafe("track", "Lead");
  } catch {}
}, 0);
```

Isto garante que:
- Nenhum `ReferenceError` e possivel (acesso via `window`)
- A execucao corre fora do stack do submit (setTimeout 0)
- Nunca entra no `catch` do `handleCapture`

**b) Normalizar telefone (linha 32)**

Usar regex mais agressivo que remove tudo excepto digitos:

```text
// ANTES:
whatsapp.replace(/[\s\-\(\)\.]/g, "")

// DEPOIS:
whatsapp.replace(/[^\d]/g, "")
```

Isto trata tambem `+`, `/`, e qualquer caracter inesperado.

**c) Erro de rede (linhas 75-84)**

Adicionar caso para falhas de rede no `catch`:

```text
if (message.includes("already") || message.includes("duplicate")) {
  setError("Este email já está inscrito.");
} else if (message.includes("obrigatório") || message.includes("required")) {
  setError("Preencha todos os campos obrigatórios.");
} else if (message.includes("fetch") || message.includes("network") || message.includes("Failed")) {
  setError("Ligação instável. Verifique a sua internet e tente novamente.");
} else {
  setError("Não foi possível concluir. Verifique os dados e tente novamente.");
}
```

**d) Duplicado com CTA (linhas 78-79)**

Quando o email ja existe, mostrar link para /live:

```text
// ANTES:
setError("Este email já está inscrito.");

// DEPOIS:
setError("Este email já está inscrito. Aceda à página do webinar em /live.");
```

Nota: como `error` e uma string renderizada num `<p>`, para ter um link clicavel seria preciso mudar o render. Alternativa simples: manter como texto com o caminho. Alternativa melhor: mudar o render do erro para suportar JSX.

Opcao escolhida (mais limpa): mudar `error` de `string | null` para `ReactNode | null` e renderizar JSX no caso de duplicado:

```text
setError(
  <>
    Este email já está inscrito.{" "}
    <a href="/live" className="underline font-medium hover:text-red-700">
      Aceder ao webinar
    </a>
  </>
);
```

O render do erro (ja existente como `<p className="text-sm text-red-500 ...">`) suporta ReactNode sem alteracoes.

### 2. PurchaseModal.tsx

**fbq mais robusto (linhas 79-81)**

Mesma abordagem:

```text
// ANTES:
if (typeof fbq !== "undefined") {
  try { fbq('track', 'Purchase', { value: prices[plan] || 0, currency: 'EUR' }); } catch (_) {}
}

// DEPOIS:
setTimeout(() => {
  try {
    const fbqSafe = (window as any)?.fbq;
    if (typeof fbqSafe === "function") fbqSafe("track", "Purchase", { value: prices[plan] || 0, currency: "EUR" });
  } catch {}
}, 0);
```

### O que NAO muda

- Backend / edge functions (ja corrigidos na iteracao anterior)
- Logica de navegacao e fluxo
- Componentes de UI existentes
- Copy do site (excepto mensagens de erro)

