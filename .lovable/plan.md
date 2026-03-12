

# Actualizar templates: Reminder 2h antes + Thank-you pós-Masterclass

## 1. Reminder (`send-video-masterclass-reminder`)

O template actual é genérico. Melhorar para ser um reminder **2 horas antes** (8h00) com informação útil:

**Assunto**: `🎬 Daqui a 2 horas — a Masterclass começa às 10h`

**Conteúdo do email**:
- Saudação pessoal
- "A Masterclass 'Vídeo Profissional com IA' começa às **10h00** (hora de Portugal)"
- Bloco com informação prática:
  - 🕐 Horário: 10h00–13h00
  - 💻 Plataforma: Zoom (link directo)
  - 📋 Preparação: ter o computador pronto, bloco de notas
  - 🎧 Recomendação: usar auscultadores para melhor áudio
- Botão CTA verde: "Entrar na Masterclass →" com link Zoom
- Nota: "A sala abre ~5 min antes do início"
- Assinatura Frederico Carvalho

**Alteração no subtitle do node CRM**: `"12 de Março · 8h00 · 2h antes da sessão"`

## 2. Thank-you (`send-video-masterclass-thankyou`)

O template actual diz "Estás dentro" e aponta para recursos — desajustado para **pós-evento**. Substituir por email de agradecimento genuíno:

**Assunto**: `Obrigado por estares presente, {{fname}}.`

**Conteúdo do email**:
- Header verde com "Masterclass · Vídeo Profissional com IA" + "Obrigado, {{fname}}."
- "Foi um prazer ter-te na Masterclass de hoje."
- "Espero que tenhas saído com ideias claras sobre como usar IA para criar vídeo profissional."
- Bloco destacado: "📦 Nas próximas **24 horas**, vou enviar-te o acesso à página de recursos da Masterclass — com a gravação completa, materiais e tudo o que foi partilhado durante a sessão."
- "Entretanto, se tiveres alguma dúvida, responde a este email."
- Assinatura Frederico Carvalho / DIGITALFC

## Ficheiros alterados

| Ficheiro | Alteração |
|----------|-----------|
| `supabase/functions/send-video-masterclass-reminder/index.ts` | Novo HTML com info prática 2h antes, novo assunto |
| `supabase/functions/send-video-masterclass-thankyou/index.ts` | Novo HTML de agradecimento pós-evento, promessa de recursos em 24h |
| `src/components/crm/AutomationFlowTab.tsx` | Actualizar subtitle do node reminder |

