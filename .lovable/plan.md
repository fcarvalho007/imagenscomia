

# Criar conteúdo dos 3 templates de email + edge function de envio

## Templates a criar

Vou seguir o design system **Navy-Indigo** (gradient `#1e1b4b → #312e81 → #4338ca`) idêntico ao `video_payment_premium` já existente na base de dados.

### a) `video_recursos_premium` — 10 clientes Premium

**Assunto:** `{{fname}}, os teus recursos do webinar Vídeo com IA estão prontos 🎬`

**Estrutura:**
- Header: "Os teus recursos estão prontos 🎬"
- Saudação + agradecimento pelo Premium Pass
- Caixa azul com lista dos 5 recursos incluídos:
  - Sessão prática completa (70 min, sem cortes)
  - Workbook PDF — estrutura e exercícios
  - Guia de GEMs (Google Gemini)
  - Ficheiro GEM pronto a usar
  - Áudio da sessão
- CTA principal: **Aceder aos Recursos →** (link para `/recursos-video`)
- Upsell Masterclass: caixa roxa com detalhes (12 Março, 10h00, 3h, €47+IVA)
- CTA verde: **Reservar lugar na Masterclass →** (link para `/upgrade-video`)
- WhatsApp de suporte

### b) `video_recursos_masterclass` — 2 clientes Masterclass

**Assunto:** `{{fname}}, confirmação e próximos passos — Masterclass Vídeo com IA 🎓`

**Estrutura:**
- Header: "O teu lugar está confirmado 🎓"
- Saudação + agradecimento pela reserva
- Caixa roxa com detalhes logísticos:
  - 📅 Quarta-feira, 12 de Março de 2026
  - 🕙 10h00 — 13h00 (3 horas)
  - 💻 Online, ao vivo (link na véspera)
  - 🎥 Gravação incluída
- Programa da sessão (workflow, ferramentas, casos práticos, Q&A)
- CTA: **Guardar no Calendário →**
- Upsell Premium Pass: caixa verde com lista dos recursos (gravação + workbook + guias, €27+IVA)
- CTA verde: **Obter o Premium Pass →**
- WhatsApp de suporte

### c) `video_recursos_bundle` — 5 clientes Bundle

**Assunto:** `{{fname}}, está tudo pronto — acesso completo Vídeo com IA ✅`

**Estrutura:**
- Header: "Está tudo pronto ✅"
- Saudação + agradecimento pelo acesso completo
- Caixa azul com lista completa (6 recursos + Masterclass)
- CTA: **Aceder aos Recursos →** (link para `/recursos-video`)
- Secção Masterclass com detalhes logísticos (12 Março, 10h00, 3h)
- CTA: **Guardar no Calendário →**
- **Sem upsell** — já tem tudo
- WhatsApp de suporte

## Edge function: `send-video-recursos-access`

**Ficheiro:** `supabase/functions/send-video-recursos-access/index.ts`

**Lógica:**
1. **Upsert** dos 3 templates na tabela `email_templates` (para ficarem editáveis no CRM)
2. **Modo dry_run** (por defeito) — upsert templates mas não envia emails
3. Quando chamado com `dry_run: false`:
   - Consulta `registrations` por segmento (`video-premium`, `video-masterclass`, `video-bundle`)
   - Idempotência: verifica `email_send_logs` para não duplicar
   - Envia via `send-email` centralizado (Brevo → Resend)
   - Regista em `message_logs` + `email_send_logs`
   - Throttling de 500ms entre envios

**Config:** `verify_jwt = false` em `supabase/config.toml`

## Ficheiros a criar/editar

1. `supabase/functions/send-video-recursos-access/index.ts` — edge function completa
2. `supabase/config.toml` — adicionar `[functions.send-video-recursos-access]` com `verify_jwt = false`

## Fluxo de teste

Após deploy, invocar com `dry_run: true` para inserir os templates na BD sem enviar nada — permite conferir o design no CRM (Automações → Histórico) e no Email Editor Panel.

