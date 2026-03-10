

# Passo 6 — Lembrete Q&A no Fluxo Pós-Evento

## Contexto

Hoje (10 Mar) é dia de Q&A às 14:30h. É preciso adicionar um novo passo no fluxo **Pós-Evento** com email + SMS de lembrete para clientes Premium, agendado para as 13h.

## Alterações

### 1. `AutomationFlowTab.tsx` — Novo day group + 2 nodes

Adicionar day group:
```
post_qa: { label: "Q&A · 10 MARÇO · 14H30", number: "6", borderColor: "#3b82f6", bgColor: "#eff6ff" }
```

Inserir 2 nodes no `getPostEventNodes()` **antes** do node "end", após os SMS de recursos:

**Email lembrete Q&A** (`video_qa_reminder`):
- Audiência: `planFilter: ["premium", "masterclass", "bundle"], requirePaid: true`
- Tag: `"10 MAR · 13H"`, azul
- Subtitle: "10 de Março · 13h · clientes pagos"

**SMS lembrete Q&A** (`sms_reminder_qa_post`):
- Audiência: Premium/MC/Bundle pagos com telefone
- Tag: `"10 MAR · 13H · SMS"`
- Texto: `"Lembrete: a sessao Q&A comeca as 14:30. O link de acesso foi enviado por email. Ate ja! — Frederico"`

### 2. `templateLabels.ts` — Adicionar labels

- `video_qa_reminder`: `"Email lembrete Q&A — 10 Mar"`
- `sms_reminder_qa_post`: `"SMS lembrete Q&A — 10 Mar"`

### 3. `FollowUpView.tsx` — Registar template key

Adicionar `"video_qa_reminder"` ao array `TEMPLATE_KEYS`.

### 4. Database — Criar email template `video_qa_reminder`

INSERT na tabela `email_templates` com:
- **Assunto**: `{{nome}}, a sessão Q&A começa às 14:30 — hoje!`
- **Corpo**: Design Navy-Indigo. Tom pessoal do Frederico. Conteúdo:
  - Lembrete que a sessão Q&A é hoje às 14:30h
  - Reforço do valor: perguntas ao vivo, feedback personalizado
  - CTA para aceder ao link (enviado previamente por email)
  - Fecho simpático e motivacional

### Ficheiros alterados
- `src/components/crm/AutomationFlowTab.tsx`
- `src/components/crm/templateLabels.ts`
- `src/components/crm/FollowUpView.tsx`
- Database: INSERT template `video_qa_reminder`

