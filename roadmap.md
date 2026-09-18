# Roadmap

## Curso IA · integração (rondas anteriores)
- [x] Migration 20260918180000 aplicada; 7 entradas canónicas; 15 funções publicadas
- [x] COURSE_EMAIL_REPLY_TO = info@fredericocarvalho.pt (gravado)
- [ ] COURSE_WP_BRIDGE_SECRET — titular insere mais tarde (formulário pronto a abrir)
- [ ] Calendly/Zoom e condições de cancelamento — por definir com titular
- [ ] Publicar app (aguarda decisão do titular)

## Segurança · correção RLS do legado (em curso)
- [ ] Inventariar chamadas diretas (frontend + edge functions) a: registrations, invoice_details, message_logs, email_send_logs, payment_events, analytics_cache, email_templates, acquisition_costs, webinar_settings
- [ ] Mapear percursos públicos a preservar: inscrição, upgrade, confirmação, recursos (tokens), edição de registo (edit_token)
- [ ] Desenhar correção: RLS fechado + RPCs estreitas com tokens validados no servidor; admin + MFA aal2 para acesso interno; remover bypass por email admin; nunca devolver edit_token por pesquisa de email
- [ ] Redigir migration (NÃO aplicar) + alterações de código + testes
- [ ] Reportar: migração não aplicada, ficheiros alterados, compatibilidade dos links enviados, limitações
