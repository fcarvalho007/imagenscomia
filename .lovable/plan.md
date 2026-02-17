
## Ajuste Final: Validar Location header nos 3xx

Uma unica alteracao cirurgica no `resolve-payment/index.ts`.

---

### O que muda

Na funcao `validateLink` (linhas 18-29), quando o status HTTP for 3xx, o sistema vai ler o header `Location` e so aceitar como valido se apontar para um path de checkout EuPago reconhecido.

**Padroes aceites no Location:**
- `/api/extern/paybylink/form/`
- `/paybylink/`

Se o `Location` estiver vazio ou nao corresponder a nenhum destes padroes, o link e tratado como invalido, forcando regeneracao automatica.

**Identifier:** Mantido como `ORDER-{order_id}` -- sem nome, sem PII.

**Frontend:** Sem alteracoes.

---

### Detalhe tecnico

**Ficheiro:** `supabase/functions/resolve-payment/index.ts`, linhas 18-29

```text
// DE:
const valid = [200, 301, 302, 303, 307, 308].includes(res.status);
return { valid, status: res.status };

// PARA:
if (res.status === 200) {
  return { valid: true, status: 200 };
}
if ([301, 302, 303, 307, 308].includes(res.status)) {
  const location = res.headers.get("location") || "";
  const isCheckout = location.includes("/api/extern/paybylink/form/") || location.includes("/paybylink/");
  return { valid: isCheckout, status: res.status };
}
return { valid: false, status: res.status };
```

Isto evita falsos positivos onde a EuPago devolve 302 para uma pagina de erro ou expirado.
