

# Phase 3 — Contadores reais de envios na timeline

## Resumo

Criar a tabela `email_send_logs`, actualizar as 5 edge functions de video para escreverem nela, ligar os contadores da timeline a dados reais, e adicionar um tab "Historico de envios" no painel do editor.

---

## 1. Migracao SQL — nova tabela `email_send_logs`

Criar tabela append-only com indices:

```sql
CREATE TABLE IF NOT EXISTS email_send_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  webinar text NOT NULL,
  email_key text NOT NULL,
  recipient_email text NOT NULL,
  fname text,
  status text NOT NULL,
  resend_id text,
  error_message text,
  sent_at timestamptz DEFAULT now()
);
CREATE INDEX ON email_send_logs(webinar, email_key);
CREATE INDEX ON email_send_logs(sent_at);
```

RLS: habilitar RLS com politica SELECT para anon (CRM le com client regular) e INSERT para service_role (edge functions escrevem com admin).

```sql
ALTER TABLE email_send_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_anon_select_email_send_logs" ON email_send_logs
  FOR SELECT USING (true);
CREATE POLICY "allow_anon_insert_email_send_logs" ON email_send_logs
  FOR INSERT WITH CHECK (true);
```

---

## 2. Edge functions — escrever em `email_send_logs`

Alterar as 5 edge functions de video. Apos cada chamada ao Resend (sucesso ou falha), inserir uma row em `email_send_logs` alem do `message_logs` existente.

**Padrao a adicionar em cada funcao (apos o insert em message_logs):**

```ts
await supabase.from("email_send_logs").insert({
  webinar: "video",
  email_key: "confirmation", // varia por funcao
  recipient_email: reg.email,
  fname: reg.first_name || "",
  status: resendRes.ok ? "sent" : "failed",
  resend_id: resendData.id || null,
  error_message: resendRes.ok ? null : JSON.stringify(resendData),
});
```

Mapa de email_key por funcao:

| Edge function | email_key |
|---|---|
| send-video-confirmation | `confirmation` |
| send-video-reminder-48h | `reminder_48h` |
| send-video-reminder-24h | `reminder_24h` |
| send-video-reminder-1h | `reminder_1h` |
| send-video-postwebinar | `postwebinar` |

Nota: `send-video-confirmation` tem estrutura diferente (recebe email/fname no body, nao itera registrants). O insert adapta-se a essa estrutura.

Nao existem edge functions de imagens — nenhuma alteracao la.

---

## 3. CRM — Fetch de contagens por email_key

**Ficheiro:** `src/components/crm/FollowUpView.tsx`

Adicionar novo fetch on mount:

```ts
const [emailStats, setEmailStats] = useState<Record<string, { sent: number; failed: number }>>({});

useEffect(() => {
  supabase
    .from("email_send_logs")
    .select("email_key, status, webinar")
    .then(({ data }) => {
      if (!data) return;
      const stats: Record<string, { sent: number; failed: number }> = {};
      for (const row of data) {
        const key = `${row.webinar}_${row.email_key}`;
        if (!stats[key]) stats[key] = { sent: 0, failed: 0 };
        if (row.status === "sent") stats[key].sent++;
        else if (row.status === "failed") stats[key].failed++;
      }
      setEmailStats(stats);
    });
}, []);
```

Passar `emailStats` como prop ao `AutomationFlowTab`.

---

## 4. Timeline — contadores reais

**Ficheiro:** `src/components/crm/AutomationFlowTab.tsx`

Adicionar prop `emailStats?: Record<string, { sent: number; failed: number }>`.

Em cada EMAIL node, construir a key `${webinar}_${email_key}` (usando o primeiro item de `templateKeyMatch` normalizado: `confirmation`, `reminder_48h`, etc.) e ler os contadores de `emailStats`.

Se `emailStats` presente e tem dados para a key:
- Mostrar `"N enviados"` em cor `#16a34a` (se > 0) ou `#999`
- Mostrar `"M falhas"` em cor `#ef4444` (se > 0) ou `#999`
- Se falhas > 0: icone de warning e left border vermelho `#ef4444`

Se nao ha dados: manter o fallback actual que le de `message_logs` (backward compatible).

Na `StatusBar`:
- Calcular totais a partir de `emailStats` (somando todos os valores) em vez dos `logs` do `message_logs`
- Logica de cor do badge "Sistema operacional":
  - Verde se taxa de falha < 5%
  - Laranja se 5-15%
  - Vermelho se > 15% ou falha nas ultimas 24h

---

## 5. Historico de envios no EmailEditorPanel

**Ficheiro:** `src/components/crm/EmailEditorPanel.tsx`

Adicionar um terceiro modo alem de "editar" e "pre-visualizar": "historico".

Implementacao:
- 3 botoes toggle na area de conteudo: `[Editar] [Pre-visualizar] [Historico de envios]`
- Quando "historico" activo:
  - Fetch: `supabase.from("email_send_logs").select("*").eq("webinar", webinar).eq("email_key", emailKey).order("sent_at", { ascending: false }).limit(50)`
  - Extrair webinar e email_key do `template_key` (ex: `video_confirmation` -> webinar=`video`, email_key=`confirmation`)
- Barra de resumo acima da tabela: `"Total: N enviados - M falharam - Taxa de sucesso: X%"`
- Tabela simples com colunas:
  - Data/Hora (formatado "5 Mar - 10:02")
  - Email (truncado 32 chars)
  - Nome (fname ou "—")
  - Estado (badge verde "Enviado" ou vermelho "Falhou" com tooltip do error_message)
  - ID Resend (monospace, truncado, copiavel via navigator.clipboard)
- Empty state: "Nenhum envio registado ainda para este email"
- Nota informativa abaixo da tabela: "Nota: logs disponiveis apenas a partir de [data de hoje]. Envios anteriores nao foram registados."

---

## 6. Loading states

- Timeline nodes: inline spinner "..." animado enquanto `emailStats` nao carregou (nao usar skeletons)
- Historico tab: spinner centralizado durante fetch

---

## Ficheiros a criar/modificar

| Ficheiro | Alteracao |
|---|---|
| Migracao SQL | CREATE TABLE email_send_logs + indices + RLS |
| `supabase/functions/send-video-confirmation/index.ts` | Insert em email_send_logs apos envio |
| `supabase/functions/send-video-reminder-48h/index.ts` | Insert em email_send_logs apos envio |
| `supabase/functions/send-video-reminder-24h/index.ts` | Insert em email_send_logs apos envio |
| `supabase/functions/send-video-reminder-1h/index.ts` | Insert em email_send_logs apos envio |
| `supabase/functions/send-video-postwebinar/index.ts` | Insert em email_send_logs apos envio |
| `src/components/crm/FollowUpView.tsx` | Fetch emailStats, passar como prop |
| `src/components/crm/AutomationFlowTab.tsx` | Receber emailStats, usar nos contadores e StatusBar |
| `src/components/crm/EmailEditorPanel.tsx` | Novo tab "Historico de envios" com tabela |

Nenhuma alteracao a Dashboard, Pipeline, Tabela, Lixo, autenticacao ou outras views.

