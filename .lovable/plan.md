

## Instalar o Meta Pixel no site

### 1. Codigo base no `<head>` (todas as paginas)

**Ficheiro:** `index.html`

Adicionar o Meta Pixel base code (ID `1461563193926022`) na seccao `<head>`, antes do fecho `</head>`. Isto dispara automaticamente `PageView` em todas as paginas (landing, confirmacao, upgrade, webinar, etc.).

### 2. Evento `Lead` apos inscricao gratuita

**Ficheiro:** `src/components/landing/RegistrationModal.tsx`

Apos o registo bem-sucedido (linha 49-52, depois de `registerFree()` retornar com sucesso), adicionar:

```
fbq('track', 'Lead')
```

Isto permite ao Meta saber que houve uma conversao de inscricao.

### 3. Evento `Purchase` apos pagamento iniciado

**Ficheiros:**
- `src/pages/Upsell.tsx` - apos criacao de link de pagamento com sucesso
- `src/components/webinar/PurchaseModal.tsx` - apos criacao de link de pagamento com sucesso

Adicionar apos resposta OK do `create-payment`:

```
fbq('track', 'Purchase', {value: X.XX, currency: 'EUR'})
```

Nota: o valor sera dinamico consoante o plano escolhido.

### 4. Declaracao TypeScript

**Ficheiro:** `src/vite-env.d.ts`

Adicionar declaracao de tipo para `fbq` no `window` global, para evitar erros de TypeScript.

### Resumo de ficheiros a editar

| Ficheiro | Alteracao |
|---|---|
| `index.html` | Meta Pixel base code no `<head>` |
| `src/components/landing/RegistrationModal.tsx` | `fbq('track', 'Lead')` apos registo |
| `src/pages/Upsell.tsx` | `fbq('track', 'Purchase')` apos pagamento |
| `src/components/webinar/PurchaseModal.tsx` | `fbq('track', 'Purchase')` apos pagamento |
| `src/vite-env.d.ts` | Declaracao de tipo para `fbq` |

