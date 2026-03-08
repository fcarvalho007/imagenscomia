

# Inserir Templates video_masterclass_thankyou e video_masterclass_day1

## O que vamos fazer

Inserir 2 templates na tabela `email_templates` via SQL migration (RLS bloqueia INSERT via cliente). Os templates já terão o HTML completo formatado como email profissional (padrão verde Masterclass).

A `TemplatesView` já exibe automaticamente qualquer template com prefixo `video_` quando o contexto é "video" — não precisa de alterações no frontend.

## Alterações

### Migration SQL — INSERT 2 templates

Usar `INSERT ... ON CONFLICT (template_key) DO NOTHING` para segurança:

1. **`video_masterclass_thankyou`**
   - name: "Pós-Masterclass — Obrigado"
   - subject: "Obrigado, {{fname}} — foi um prazer ter-te na Masterclass"
   - html_body: Email completo com header verde, CTA "Aceder aos meus recursos", assinatura Frederico
   - text_body: Versão plain text
   - variables: `["fname"]`

2. **`video_masterclass_day1`**
   - name: "Masterclass Day 1 — Recursos + Avaliação"
   - subject: "{{fname}}, a gravação já está disponível"
   - html_body: Email com CTA "Ver a gravação" + CTA secundário "Deixar avaliação no Google"
   - text_body: Versão plain text
   - variables: `["fname"]`

Ambos com `is_active: true`, `version: 1`, `channel: 'email'`.

### Ficheiros alterados
- Apenas 1 migration SQL (nenhuma alteração de código frontend necessária)

