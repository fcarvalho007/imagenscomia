
# Correcoes: Confirmacao + Followup + Calendario

## 3 Problemas Identificados

### Problema 1 -- Texto "Upgrade Realizado!" para inscritos gratuitos

A pagina `/confirmacao` (Confirmacao.tsx) mostra sempre "Upgrade Realizado!" e "Vamos aguardar a confirmacao do seu pagamento" independentemente do plano. Quando o utilizador escolheu tudo gratuito, o texto correcto e "O seu lugar esta reservado!".

**Solucao**: Verificar o parametro `plan` na URL. Se `plan` estiver vazio ou for "free"/"video-free", mostrar:
- Titulo: "O seu lugar esta reservado, {nome}!" (ou "O seu lugar esta reservado!")
- Subtitulo: "A tua inscricao foi confirmada." (em vez de "Vamos aguardar a confirmacao do pagamento")

Se `plan` tiver valor pago (premium, masterclass, bundle, etc.), manter o texto actual.

**Ficheiro**: `src/pages/Confirmacao.tsx`, linhas 85-98

```tsx
const isFree = !plan || plan === "free" || plan === "video-free";

// Titulo
{isFree
  ? (userName ? `O seu lugar está reservado, ${userName}!` : "O seu lugar está reservado!")
  : (userName ? `Upgrade Realizado, ${userName}!` : "Upgrade Realizado!")}

// Subtitulos
{isFree ? "A tua inscrição foi confirmada." : "Obrigado pela confiança."}
{isFree ? "Adiciona ao calendário para não te esqueceres." : "Vamos aguardar a confirmação do seu pagamento."}
```

### Problema 2 -- Followup envia emails de pagamento a inscritos gratuitos

O `followup-abandoned` filtra candidatos com `.neq("plan_selected", "free")` (linha 484). Mas o upgrade de video guarda `plan_selected: "video-free"` (UpgradeVideo.tsx linha 338). Como `"video-free" !== "free"`, estes utilizadores sao apanhados pelo followup e recebem emails a pedir pagamento.

**Solucao**: Alterar o filtro no `followup-abandoned` para excluir todos os planos gratuitos:

```typescript
// Antes (linha 484):
.neq("plan_selected", "free");

// Depois:
.neq("plan_selected", "free")
.neq("plan_selected", "video-free");
```

Tambem corrigir o redirect no step 3 skip (UpgradeVideo.tsx linha 359) para passar os parametros correctos:

```typescript
window.location.href = `/confirmacao?webinar=video&name=${encodeURIComponent(userData.nome)}&email=${encodeURIComponent(userData.email)}&plan=video-free`;
```

**Ficheiros**: `supabase/functions/followup-abandoned/index.ts` (linha 484), `src/pages/UpgradeVideo.tsx` (linha 359)

### Problema 3 -- Calendario nao e adicionado

O `ConfirmacaoExtras` tem um link Google Calendar hardcoded (linha 44-45) que aponta para um evento especifico (provavelmente o webinar de imagens). Para o webinar de video, o link e o mesmo — pode nao existir ou estar errado.

**Solucao**: Gerar o link do Google Calendar dinamicamente usando os dados do `VIDEO_WEBINAR_CONFIG` ou `WEBINAR_CONFIG` conforme o tipo de webinar:

```tsx
const calendarUrl = (() => {
  const start = config.startDate;
  const end = new Date(start.getTime() + config.durationMinutes * 60000);
  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(config.title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(config.summary)}`;
})();
```

Isto garante que o link de calendario e correcto para ambos os webinars (imagens e video).

**Ficheiro**: `src/components/landing/ConfirmacaoExtras.tsx` (linhas 44-52)

---

## Resumo de alteracoes

| Ficheiro | Alteracao |
|---|---|
| `src/pages/Confirmacao.tsx` | Texto condicional: "lugar reservado" vs "upgrade realizado" |
| `src/pages/UpgradeVideo.tsx` | Redirect step 3 skip: adicionar params name/email/plan |
| `src/components/landing/ConfirmacaoExtras.tsx` | Google Calendar link dinamico baseado no config do webinar |
| `supabase/functions/followup-abandoned/index.ts` | Filtro: excluir tambem "video-free" |

## O que NAO muda

- Layout desktop ou mobile (fixes anteriores)
- Logica de pagamento ou E-goi
- Outras paginas ou componentes
- Schema da base de dados
