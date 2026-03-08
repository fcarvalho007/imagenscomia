

# Documentação Completa do Projecto — Imagens com IA / Vídeo com IA

---

## 1. Visão Geral do Projecto

Este é o ecossistema digital completo do **Frederico Carvalho** para a venda e gestão de formações sobre Inteligência Artificial aplicada a imagens e vídeo. O projecto abrange:

- **Landing pages** de captação de leads
- **Funis de upgrade/compra** com integração de pagamentos
- **Páginas de webinar ao vivo** (imagens e vídeo)
- **Portal de recursos** para alunos pagantes
- **CRM interno completo** com dashboard, pipeline, tabela, automações de email/SMS, faturação e comunicação
- **Sistema de faturação automatizada** via InvoiceExpress
- **Sistema de pagamentos** via EuPago (Multibanco, MB WAY, Cartão)
- **Automações de email** via Resend e integração com E-goi
- **Envio de SMS** via SMSOnline
- **Sistema de referrals/convites** com gamificação

O domínio principal é **imagenscomia.com** (publicado como imagenscomia.lovable.app).

---

## 2. Os Dois Webinars

O projecto gere **dois webinars distintos** sob a mesma plataforma:

### 2.1 Webinar "Imagens com IA" (webinar: "imagens")
- **Data:** 18 Fevereiro 2026
- **Tema:** Criar imagens profissionais com IA para empresas
- **Estado actual:** Pós-evento. A landing page (`/`) redireciona para `/gravacao` (página de venda do pack de gravação)
- **Cor identificativa:** Azul (#1e40af)

### 2.2 Webinar "Vídeo com IA" (webinar: "video")
- **Data do webinar:** 5 Março 2026
- **Data Q&A:** 10 Março 2026, 14h30
- **Data Masterclass:** 12 Março 2026, 10h-13h
- **Tema:** Criar vídeo profissional com IA
- **Estado actual:** Pós-evento, em fase de monetização activa
- **Cor identificativa:** Verde (#16a34a)

---

## 3. Páginas Públicas (Funil do Utilizador)

### 3.1 Landing Pages de Captação

| Página | Rota | Descrição |
|--------|------|-----------|
| Landing Imagens | `/inicial` | Landing page completa do webinar de imagens com Hero, Desafios, Programa, Galeria, Transformação, Audiência, Apresentador, Testemunhos, Preços, FAQ, CTA final |
| Landing Vídeo (pré-evento) | `/video-lp` | Landing page do webinar de vídeo com countdown, inscrição gratuita, early-bird pricing |
| Landing Vídeo (pós-evento) | `/video` | Landing page de venda da "Sessão Prática" de vídeo (sem linguagem de webinar) |
| Gravação Imagens | `/gravacao` | Página de venda do pack de gravação de imagens (27€). É o destino actual da rota `/` |
| Comprar | `/comprar` | Página de escolha de planos (Sessão Prática €27, Masterclass €67, Pack Completo €107) com cards comparativos |

### 3.2 Funis de Conversão (Upgrade)

| Página | Rota | Descrição |
|--------|------|-----------|
| Upgrade Imagens | `/upgrade` | Funil de 4 passos com summary panel lateral: Qualificação → Premium → Masterclass → Checkout |
| Upgrade Vídeo | `/upgrade-video` | Funil de 5 passos em single card: Qualificação → Masterclass → Gravação → Dúvida → Checkout |
| Upgrade Gravação | `/upgrade-gravacao` | Funil pós-compra de gravação de imagens com upsell de Masterclass |

### 3.3 Páginas de Evento

| Página | Rota | Descrição |
|--------|------|-----------|
| Webinar Live Imagens | `/live` | Página do webinar ao vivo de imagens com vídeo YouTube embed, sidebar com programa, countdown |
| Webinar Live Vídeo | `/live-video` | Página do webinar ao vivo de vídeo com gate de acesso (LiveVideoGate), auto-refresh |
| Confirmação | `/confirmacao` | Página pós-inscrição/pagamento com animação, próximos passos, pixel de Purchase do Facebook |

### 3.4 Páginas Pós-Evento

| Página | Rota | Descrição |
|--------|------|-----------|
| Recursos Imagens | `/recursos` | Portal de recursos para quem pagou (login via email+token), acesso a vídeos e materiais |
| Recursos Vídeo | `/recursos-video` | Portal de recursos para webinar de vídeo (login via email+token) |
| Convites | `/convites` | Programa de referrals/convites com leaderboard, progresso, partilha WhatsApp/email |

### 3.5 Páginas Transaccionais

| Página | Rota | Descrição |
|--------|------|-----------|
| Pagar | `/pagar?o={order_id}` | Página intermediária de pagamento: valida link EuPago, redireciona para checkout, com fallbacks de timeout/erro |
| Fatura | `/fatura?rid={id}&t={token}` | Portal de recolha de dados de faturação (NIF). Formulário de 6 campos com auto-save |
| Termos | `/termos` | Termos e condições + Política de privacidade |

---

## 4. Produtos e Preços

### 4.1 Webinar Imagens
- **Premium Pass:** €15 + IVA (€18,45) — gravação + materiais
- **Masterclass:** €47 + IVA (€57,81)
- **Bundle:** €62 + IVA (€76,26) — Premium + Masterclass

### 4.2 Webinar Vídeo (preços pós-evento)
- **Sessão Prática (Premium):** €27 + IVA (€33,21) — sessão HD ~70min + workbook + guia GEMs + Q&A
- **Masterclass Vídeo:** €67 + IVA (€82,41) — 3h ao vivo com Frederico
- **Pack IA Completo (Bundle):** €107 + IVA (€131,61) — tudo de vídeo + tudo de imagens. Preço riscado €121, badge "Poupas €14"

### 4.3 Inscrições de Grupo
- Até 10 pessoas por grupo
- 10% de desconto para grupos de 3+
- Vinculados por `group_payment_ref` (UUID)
- Pagamento único actualiza todos os membros

### 4.4 Programa de Referrals
- Meta: 2 inscrições referidas para desbloquear prémio (livro físico)
- Leaderboard público com top 10
- Link pessoal com código de referral único

---

## 5. CRM Interno (`/crm`)

### 5.1 Autenticação
- Login via email/password com Supabase Auth
- MFA obrigatório (verifica AAL level)
- Verificação de role `admin` via função `has_role()`
- Auto-assign de admin para `fredericodigital@gmail.com`

### 5.2 Vistas do CRM

| Vista | Descrição |
|-------|-----------|
| **Dashboard** | KPIs principais (inscritos, receita, conversão), gráficos de evolução, resultados live do YouTube, filtro por período (7d/14d/30d/all), dados de visitantes da landing |
| **Pipeline** | Vista Kanban com colunas por plano (Free, Premium, Masterclass, Bundle). Drag-and-drop. Financials por coluna (pago vs pendente). Filtro por fonte (webinar/gravação) |
| **Tabela** | Vista tabelar de todos os inscritos com filtros, busca, badges de status, último email enviado, flag de NIF em falta |
| **Faturação** | KPIs financeiros, gráficos de receita, breakdown por plano, custos de aquisição (editáveis), tabela de faturas, P&L summary. Toggle IVA incluído/excluído |
| **Automações** | Fluxo visual de automações de email (pré e pós-webinar), métricas de envio, gestão de pessoas, editor de templates HTML |
| **Comunicação** | Envio manual de email e SMS com filtros por webinar/plano, selecção de destinatários por chips, histórico de envios |
| **Lixo** | Inscritos arquivados com opção de restaurar ou eliminar |

### 5.3 Modal do Inscrito
O modal individual tem 4 tabs:
- **Resumo:** Dados pessoais, plano, status de pagamento, notas, badges de webinar/grupo
- **Actividade:** Timeline de acções (emails enviados, pagamentos, notas)
- **Histórico:** Logs de mensagens (email/SMS) com detalhes do provider
- **Pagamento:** Gestão de links de pagamento, reenvio de emails, regeneração de links

Acções disponíveis no modal:
- Alterar plano, marcar como pago, marcar como lost
- Conceder premium manualmente
- Regenerar link de pagamento (com validação de 12h)
- Reenviar email de pagamento (cooldown de 6h)
- Toggle do-not-contact, follow-up, invoice-sent
- Editar nome e género
- Arquivar e eliminar

### 5.4 Webinar Switcher
O CRM suporta filtragem por webinar via selector na sidebar:
- **Consolidado (⊕):** Mostra todos os inscritos
- **Imagens IA (📷):** Filtra por webinar imagens
- **Vídeo IA (🎬):** Filtra por webinar vídeo

---

## 6. Sistema de Automações de Email

### 6.1 Fluxo Webinar Vídeo — Pré-Evento
1. `video_confirmation` — Email de confirmação imediato após inscrição
2. `video_followup_prewebinar` — Follow-up pré-webinar
3. `video_reminder_48h` — Lembrete 48h antes
4. `video_reminder_24h` — Lembrete 24h antes
5. `video_reminder_1h` — Lembrete 1h antes

### 6.2 Fluxo Webinar Vídeo — Pós-Evento
1. `video_postwebinar` — Email imediato pós-webinar
2. `video_postwebinar_day1` — Dia 1 (recursos + upsell)
3. `sms_followup_day1` — SMS manual follow-up Dia 1
4. `video_postwebinar_day3` — Dia 3
5. `video_postwebinar_closing` — Email de encerramento

### 6.3 Emails Transaccionais
- `video_payment_premium` / `video_payment_masterclass` — Links de pagamento
- `video_recursos_premium` / `video_recursos_masterclass` / `video_recursos_bundle` — Acesso a recursos
- `invoice_request` — Solicitação de dados de faturação (NIF)

### 6.4 Fluxo Webinar Imagens
- `imagens_confirmation`, `imagens_reminder_48h/24h/1h`, `imagens_postwebinar`

### 6.5 Templates Editáveis
Os templates de email são armazenados na tabela `email_templates` e podem ser editados directamente no CRM via um editor HTML integrado (EmailEditorPanel).

---

## 7. Sistema de Pagamentos

### 7.1 Fluxo de Pagamento
1. Utilizador escolhe plano na landing ou no funil de upgrade
2. Sistema cria registo via Edge Function `create-payment` ou `create-group-payment`
3. EuPago gera referência de pagamento (MB, MB WAY ou Cartão)
4. Link estável criado: `/pagar?o={order_id}`
5. Página `/pagar` invoca `resolve-payment` que valida o link EuPago (threshold 12h, validação activa 200/3xx)
6. Webhook `eupago-webhook` recebe notificação de pagamento
7. Sistema actualiza `paid_at`, `paid_amount` na tabela `registrations`
8. Se dados de faturação existem → emissão automática de fatura via InvoiceExpress

### 7.2 EuPago
- Métodos: Multibanco, MB WAY, Cartão de Crédito
- Webhook automático para confirmação de pagamento
- Links regeneráveis com validação de URL activo

### 7.3 InvoiceExpress
- Emissão automática de faturas quando NIF disponível
- Funções: `create-invoice`, `bulk-create-invoices`, `bulk-emit-invoices`, `bulk-finalize-invoices`
- Portal `/fatura` para recolha de dados fiscais pós-pagamento

---

## 8. Sistema de Faturação

### 8.1 Fluxo
1. Após pagamento confirmado, sistema verifica se há `invoice_details` para o registo
2. Se sim → emite fatura automaticamente via InvoiceExpress
3. Se não → envia email `invoice_request` com link para `/fatura?rid={id}&t={token}`
4. Utilizador preenche formulário (6 campos: Nome/Empresa, NIF, Morada, Código Postal, Localidade, Email)
5. Formulário tem auto-save com debounce de 600ms
6. Após preenchimento → fatura emitida automaticamente + notificação ao Frederico
7. Envio registado na timeline do CRM com `template_key: "invoice_request"`

### 8.2 Segurança
- Acesso ao formulário protegido por `edit_token` de 32 caracteres
- Escrita na tabela `invoice_details` bloqueada por RLS — apenas via Edge Function `invoice-upsert`
- Validação do token no servidor

---

## 9. Integrações Externas

| Serviço | Utilização | Secret |
|---------|-----------|--------|
| **EuPago** | Processamento de pagamentos (MB, MB WAY, Cartão) | `EUPAGO_API_KEY` |
| **InvoiceExpress** | Emissão e envio automático de faturas | `INVOICEEXPRESS_API_KEY`, `INVOICEEXPRESS_ACCOUNT` |
| **Resend** | Envio de emails transaccionais e marketing | `RESEND_API_KEY` |
| **SMSOnline** | Envio de SMS de follow-up | `SMSONLINE_API_KEY` |
| **E-goi** | CRM de email marketing, sincronização de contactos e tags | `EGOI_API_KEY` |
| **Brevo** | Email marketing (secundário) | `BREVO_API_KEY` |
| **Facebook Pixel** | Tracking de conversões (Lead, Purchase) | Client-side via `fbq()` |
| **Google** | Badge de avaliações (1194 avaliações, 5.0★) | Estático |

---

## 10. Edge Functions (Backend)

O projecto tem **43 Edge Functions** organizadas por funcionalidade:

### Registo e Autenticação
- `register-free` — Registo gratuito de novos inscritos

### Pagamentos
- `create-payment` — Criar pagamento individual via EuPago
- `create-group-payment` — Criar pagamento de grupo
- `resolve-payment` — Validar e resolver link de pagamento
- `eupago-webhook` — Webhook de confirmação de pagamento

### Emails
- `send-email` — Envio genérico de email via Resend
- `test-send-email` — Teste de envio
- `send-video-confirmation` — Confirmação de inscrição vídeo
- `send-video-followup-prewebinar` — Follow-up pré-webinar
- `send-video-reminder-48h/24h/1h` — Lembretes
- `send-video-postwebinar` — Pós-webinar imediato
- `send-video-postwebinar-day1` — Dia 1 pós
- `send-video-postwebinar-day1-sms` — SMS Dia 1
- `send-video-postwebinar-day3` — Dia 3 pós
- `send-video-postwebinar-closing` — Encerramento
- `send-video-recursos-access` — Acesso a recursos
- `send-payment-link` — Envio de link de pagamento
- `send-invoice-request` — Solicitação de NIF/dados faturação
- `resend-failed-emails` — Reenvio de emails falhados
- `generate-reminder` — Geração de lembretes
- `followup-abandoned` — Follow-up de carrinhos abandonados
- `backfill-video-confirmations` — Backfill de confirmações em falta

### Faturação
- `invoice-upsert` — Guardar dados de faturação + emitir fatura
- `create-invoice` — Criar fatura no InvoiceExpress
- `bulk-create-invoices` — Criação em lote
- `bulk-emit-invoices` — Emissão em lote
- `bulk-finalize-invoices` — Finalização em lote

### E-goi
- `egoi-sync` / `sync-egoi` — Sincronização de contactos
- `bulk-sync-egoi` — Sincronização em lote
- `bulk-tag-egoi` — Tagging em lote
- `cleanup-egoi-tags` — Limpeza de tags
- `grant-premium-egoi` — Conceder premium via E-goi

### SMS
- `send-sms` — Envio de SMS via SMSOnline
- `backfill-sms-logs` — Backfill de logs de SMS

### Outros
- `check-referrals` — Verificar estado de referrals
- `get-leaderboard` — Leaderboard de referrals
- `get-analytics-visitors` — Visitantes da landing
- `delete-registration` — Eliminar registo
- `redeem-voucher` — Resgatar voucher/gift code

---

## 11. Modelo de Dados

### Tabela `registrations` (tabela principal)
Contém todos os inscritos de ambos os webinars. Campos principais:
- Identificação: `id`, `name`, `email`, `first_name`, `last_name`, `whatsapp`
- Webinar: `webinar` ("imagens" ou "video")
- Plano: `plan_selected`, `paid_at`, `paid_amount`, `eupago_ref`, `order_id`
- Funil: `step_reached`, `upgrade_clicked_at`, `sources`, `duvida`, `role`, `team_size`
- Follow-up: `followup_stage`, `last_followup_at`, `next_followup_at`, `do_not_contact`
- Pagamento: `last_payment_link`, `payment_link_created_at`, `last_payment_link_sent_at`
- Faturação: `invoice_sent`, `invoice_document_id`, `edit_token`
- Premium: `premium_unlocked`, `premium_granted_at`, `premium_granted_by`
- Referrals: `referral_code`, `referred_by`
- Grupo: `group_payment_ref`, `is_gift`, `gift_code`
- Estado: `lost_at`, `lost_reason`, `attended_live_at`
- Origem: `registration_source` ("webinar" ou "gravacao")

### Outras Tabelas
- `invoice_details` — Dados fiscais (NIF, morada, etc.)
- `message_logs` — Logs de todos os emails/SMS enviados
- `email_send_logs` — Logs detalhados de emails (webinar, status, resend_id)
- `email_templates` — Templates de email editáveis no CRM
- `payment_events` — Eventos de pagamento do webhook EuPago
- `scheduled_sends` — Envios agendados
- `acquisition_costs` — Custos de aquisição (ads, etc.) por plataforma
- `webinar_settings` — Configurações dinâmicas por webinar (preços, datas, métricas live)
- `analytics_cache` — Cache de métricas (visitantes)
- `user_roles` — Roles de admin (com RLS)

---

## 12. Funcionalidades de UX Notáveis

### Design e Animações
- Framer Motion em todas as landing pages (fade-up, stagger, spring)
- Componentes visuais especiais: `ColorBends`, `ElectricBorder`, `AuroraBackground`, `SpotlightCard`, `CardSwap`
- Logo marquee com scroll infinito
- Countdown timers para eventos
- Three.js (`@react-three/fiber` + `@react-three/drei`) disponível mas uso não extenso

### Responsividade
- Hook `useIsMobile()` para adaptação mobile
- Ordem de cards diferente em mobile vs desktop (ex: `/comprar`)
- Sidebar do CRM colapsável em mobile

### Comunicação
- Botão WhatsApp flutuante em todas as páginas públicas
- Suporte via WhatsApp integrado nos fluxos de erro
- Copy para clipboard de links e mensagens pré-formatadas

### Localização
- Todo o projecto está em Português de Portugal
- Detecção automática de género (`genderDetection.ts`) para personalização de emails
- Formatação de datas em PT (ex: "18 Fev 2026")

---

## 13. Configuração E-goi

- **List ID:** 5
- **Tags configuradas:**
  - `34` — webinar_video_com_ia_5_marco
  - `35` — premium_pass_webinar_video
  - `33` — masterclass (partilhada)

---

## 14. Estado Actual do Projecto (Março 2026)

- O webinar de imagens já ocorreu (18 Fev). A landing redireciona para venda da gravação.
- O webinar de vídeo já ocorreu (5 Mar). Fase activa de monetização pós-evento.
- Preços da Sessão Prática: early-bird €15+IVA (até 5 Mar) → preço normal €27+IVA
- Masterclass de vídeo agendada para 12 de Março (ou já ocorreu, depende da data actual)
- CRM activo com gestão de ~100+ inscritos entre os dois webinars
- Sistema de faturação activo com emissão automática + portal de recolha de NIF
- Automações de email pós-evento a funcionar (Day 1, Day 3, Closing)

---

## 15. Identidade e Marca

- **Marca:** Frederico Carvalho / DIGITALFC
- **Email principal:** fredericodigital@gmail.com
- **Email profissional:** frederico@digitalfc.pt
- **WhatsApp suporte:** +351 915 015 508
- **Google Reviews:** 1194 avaliações, 5.0★ (badge usado nas landing pages)
- **Tom de comunicação:** Profissional mas acessível. Emails assinados pelo Frederico em 1ª pessoa.
- **Público-alvo:** Responsáveis de marketing, empresários, PMEs, criadores de conteúdo, gestores de e-commerce

