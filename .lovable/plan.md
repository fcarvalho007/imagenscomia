

# Revisão do email `video_masterclass_thankyou`

## Problemas identificados

### 1. Fontes — Sem problema real
Verifiquei o template no código (fallback) e na base de dados. Ambos usam `Georgia, serif` com o gradiente verde padrão — **idêntico** aos outros emails da Masterclass (reminder, day1, etc.). Se o preview no CRM parece diferente, é porque o editor mostra código HTML bruto, não o email renderizado. Não há alteração de fontes a fazer.

### 2. Copy assume presença — Precisa de reescrita
O email actual diz "Foi um prazer ter-te na Masterclass de hoje" — assume que a pessoa esteve presente. Nem todos terão comparecido. O tom deve ser:
- Agradecer a quem esteve presente (sem excluir quem não esteve)
- Informar que a sessão já terminou
- Mencionar que os recursos (incluindo gravação) serão enviados em 24h
- Tom empático, sem pressão

### 3. Horário de envio — 13:10h (após fim da sessão)
A Masterclass é 10h–13h. O email deve sair às **13:10** para ser imediatamente pós-sessão.

---

## Alterações

### A. Reescrever fallback HTML (`supabase/functions/send-video-masterclass-thankyou/index.ts`)

**Subject**: `"A Masterclass terminou — obrigado, {{fname}}."`

**Corpo revisto** (mantendo branding Georgia + gradiente verde):
- Header: `"A sessão terminou."` (neutro, não assume presença)
- Corpo:
  - "A Masterclass 'Vídeo Profissional com IA' chegou ao fim."
  - "Obrigado pela tua participação — espero que tenha sido útil."
  - Callout verde: "Nas próximas 24h vou enviar-te o acesso à gravação completa, materiais e tudo o que foi partilhado."
  - "Mesmo que não tenhas conseguido estar presente, vais receber tudo na mesma."
  - Fecho: "Qualquer dúvida, responde a este email."
  - Assinatura Frederico Carvalho

### B. Actualizar template na base de dados
- UPDATE `email_templates` SET subject e html_body para a versão revista.

### C. Agendar cron job para 13:10 UTC
- Criar cron `video-masterclass-thankyou-20260312` com schedule `10 13 12 3 *` (13:10 do dia 12 de Março).
- Mesma lógica dos outros cron jobs (x-cron-secret, POST ao edge function).

### Ficheiros alterados

| Ficheiro | Alteração |
|----------|-----------|
| `supabase/functions/send-video-masterclass-thankyou/index.ts` | Reescrita do fallback HTML e subject |
| DB `email_templates` | UPDATE subject + html_body |
| DB `cron.schedule` | Novo job às 13:10 |

