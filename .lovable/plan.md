

# Phase 2 — Editor de Email (Painel lateral)

## Resumo

Adicionar um painel lateral deslizante que permite editar o conteudo HTML e assunto de cada email da timeline. Reutilizar a tabela `email_templates` existente (sem criar nova tabela) e actualizar as edge functions para lerem o template da base de dados em vez de HTML hardcoded.

---

## 1. Base de dados — Inserir templates na tabela existente

A tabela `email_templates` ja existe com colunas `template_key`, `subject`, `html_body`, `name`, etc. Nao e necessario criar nova tabela nem adicionar colunas.

Inserir 10 rows (5 video + 5 imagens) usando os template_keys ja usados nas edge functions:

| template_key | name | subject | html_body |
|---|---|---|---|
| `video_confirmation` | Confirmacao Video | Inscricao confirmada... | HTML do `send-video-confirmation` |
| `video_reminder_48h` | Lembrete 48h Video | Faltam 2 dias... | HTML do `send-video-reminder-48h` |
| `video_reminder_24h` | Lembrete 24h Video | E amanha as 10h00... | HTML do `send-video-reminder-24h` |
| `video_reminder_1h` | Lembrete 1h Video | Comeca em 1 hora... | HTML do `send-video-reminder-1h` |
| `video_postwebinar` | Pos-webinar Video | Obrigado por estares... | HTML do `send-video-postwebinar` |
| `imagens_confirmation` | Confirmacao Imagens | (equivalente imagens) | Placeholder HTML |
| `imagens_reminder_48h` | Lembrete 48h Imagens | ... | Placeholder HTML |
| `imagens_reminder_24h` | Lembrete 24h Imagens | ... | Placeholder HTML |
| `imagens_reminder_1h` | Lembrete 1h Imagens | ... | Placeholder HTML |
| `imagens_postwebinar` | Pos-webinar Imagens | ... | Placeholder HTML |

O HTML de cada template video e extraido literalmente do `buildHtml` de cada edge function, com `${fname}` substituido por `{{fname}}`.

Para imagens, como nao existem edge functions correspondentes, inserir HTML placeholder generico.

Migracao via INSERT (sem alterar schema).

---

## 2. Fetch de templates no FollowUpView

**Ficheiro:** `src/components/crm/FollowUpView.tsx`

Adicionar state `emailTemplates` e fetch on mount:

```ts
const [emailTemplates, setEmailTemplates] = useState([]);

useEffect(() => {
  supabase.from("email_templates")
    .select("template_key, subject, html_body, name, updated_at, updated_by")
    .in("template_key", [
      "video_confirmation", "video_reminder_48h", ...
      "imagens_confirmation", ...
    ])
    .then(({ data }) => { if (data) setEmailTemplates(data); });
}, []);
```

Passar `emailTemplates` e `setEmailTemplates` como props ao `AutomationFlowTab`.

Adicionar state `selectedTemplate` (template row ou null) para controlar o painel.

---

## 3. Wiring do botao "Ver email"

**Ficheiro:** `src/components/crm/AutomationFlowTab.tsx`

Alterar a assinatura para receber:
- `emailTemplates` — array de templates
- `onOpenEditor(templateKey: string)` — callback

No Timeline, adicionar prop `onOpenEditor`.

Cada botao "Ver email ->" chama `onOpenEditor` com o template_key correspondente (ex: `video_confirmation`). O mapeamento usa o webinar context + email_key do node.

Mapa de email_key por node:

| Node title | email_key |
|---|---|
| Confirmacao imediata | `confirmation` |
| Lembrete 48h | `reminder_48h` |
| Lembrete 24h | `reminder_24h` |
| Comeca em 1 hora | `reminder_1h` |
| Email pos-webinar | `postwebinar` |

Template key final: `${webinar}_${email_key}` (ex: `video_confirmation`).

---

## 4. Componente EmailEditorPanel

**Novo ficheiro:** `src/components/crm/EmailEditorPanel.tsx`

### Props

```ts
interface Props {
  template: EmailTemplate | null;  // null = fechado
  onClose: () => void;
  onSaved: (updated: EmailTemplate) => void;
}
```

### Comportamento

- Painel fixo, lado direito, 560px (100% mobile)
- Overlay semitransparente atras (fecha ao clicar)
- Animacao slide-in/out via CSS transition (translateX)
- z-index: 50

### Layout do painel (de cima para baixo)

**Header:**
- Badge do webinar (cor azul/verde conforme contexto)
- Nome do email (ex: "Confirmacao imediata")
- template_key em monospace (#999, 11px)
- Botao X para fechar
- Indicador de alteracoes nao guardadas (ponto laranja + texto)

**Assunto:**
- Label "ASSUNTO" (11px, uppercase, #888)
- Input text, valor local editavel

**Corpo do email:**
- Label "CORPO DO EMAIL (HTML)" 
- Textarea monospace (Courier New, 12px, min-height 360px, resize vertical)
- Nota: "Variaveis disponiveis: {{fname}}, {{email}}"

**Pre-visualizacao:**
- Toggle "Pre-visualizar email" / "Editar HTML"
- Quando activo: iframe com srcdoc para renderizar o HTML de forma segura
- Max-height 400px, overflow-y auto

**Footer:**
- Texto "Ultima edicao: [data formatada]"
- Botao "Cancelar" (ghost, reset local)
- Botao "Guardar alteracoes" (verde #16a34a, loading state)

### Save

```ts
await supabase.from("email_templates")
  .update({
    subject: localSubject,
    html_body: localBodyHtml,
    updated_at: new Date().toISOString(),
    updated_by: "crm_manual"
  })
  .eq("template_key", template.template_key);
```

Sucesso: toast + actualizar state pai + fechar indicador unsaved.
Erro: toast de erro, manter painel aberto.

---

## 5. Edge functions — ler template da DB

Actualizar cada uma das 5 edge functions video para buscar o template a Supabase antes de enviar:

**Padrao comum (adicionar em cada funcao):**

```ts
// Fetch template from DB
const { data: tpl } = await supabase
  .from("email_templates")
  .select("subject, html_body")
  .eq("template_key", TEMPLATE_KEY)
  .maybeSingle();

const subject = tpl?.subject ?? "Fallback subject";
const html = (tpl?.html_body ?? buildHtml(fname))
  .replace(/\{\{fname\}\}/g, fname || "");
```

A funcao `buildHtml` existente serve como fallback caso o template nao exista na DB.

Funcoes a alterar:
- `send-video-confirmation/index.ts`
- `send-video-reminder-48h/index.ts`
- `send-video-reminder-24h/index.ts`
- `send-video-reminder-1h/index.ts`
- `send-video-postwebinar/index.ts`

---

## Ficheiros a criar/modificar

| Ficheiro | Alteracao |
|---|---|
| Migracao SQL | INSERT 10 rows em `email_templates` |
| `src/components/crm/EmailEditorPanel.tsx` | **NOVO** — painel lateral editor |
| `src/components/crm/FollowUpView.tsx` | Fetch templates, state selectedTemplate, renderizar painel |
| `src/components/crm/AutomationFlowTab.tsx` | Receber `onOpenEditor` prop, wiring botoes "Ver email" |
| `supabase/functions/send-video-confirmation/index.ts` | Ler template da DB |
| `supabase/functions/send-video-reminder-48h/index.ts` | Ler template da DB |
| `supabase/functions/send-video-reminder-24h/index.ts` | Ler template da DB |
| `supabase/functions/send-video-reminder-1h/index.ts` | Ler template da DB |
| `supabase/functions/send-video-postwebinar/index.ts` | Ler template da DB |

Nenhuma alteracao a outras views do CRM, autenticacao, ou RLS.

