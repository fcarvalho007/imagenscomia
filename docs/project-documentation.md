# Documentação Completa do Projecto — Imagens com IA / Vídeo com IA

---

## FASE 1 — Contexto e Visão Geral

---

### 1. Visão Geral do Projecto

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

### 2. Os Dois Webinars

#### 2.1 Webinar "Imagens com IA" (webinar: "imagens")
- **Data:** 18 Fevereiro 2026
- **Tema:** Criar imagens profissionais com IA para empresas
- **Estado actual:** Pós-evento. A landing page (`/`) redireciona para `/gravacao` (página de venda do pack de gravação)
- **Cor identificativa:** Azul (#1e40af)

#### 2.2 Webinar "Vídeo com IA" (webinar: "video")
- **Data do webinar:** 5 Março 2026
- **Data Q&A:** 10 Março 2026, 14h30
- **Data Masterclass:** 12 Março 2026, 10h-13h
- **Tema:** Criar vídeo profissional com IA
- **Estado actual:** Pós-evento, em fase de monetização activa
- **Cor identificativa:** Verde (#16a34a)

---

### 3. Páginas Públicas (Funil do Utilizador)

#### 3.1 Landing Pages de Captação

| Página | Rota | Descrição |
|--------|------|-----------|
| Landing Imagens | `/inicial` | Landing page completa do webinar de imagens com Hero, Desafios, Programa, Galeria, Transformação, Audiência, Apresentador, Testemunhos, Preços, FAQ, CTA final |
| Landing Vídeo (pré-evento) | `/video-lp` | Landing page do webinar de vídeo com countdown, inscrição gratuita, early-bird pricing |
| Landing Vídeo (pós-evento) | `/video` | Landing page de venda da "Sessão Prática" de vídeo (sem linguagem de webinar) |
| Gravação Imagens | `/gravacao` | Página de venda do pack de gravação de imagens (27€). É o destino actual da rota `/` |
| Comprar | `/comprar` | Página de escolha de planos (Sessão Prática €27, Masterclass €67, Pack Completo €107) com cards comparativos |

#### 3.2 Funis de Conversão (Upgrade)

| Página | Rota | Descrição |
|--------|------|-----------|
| Upgrade Imagens | `/upgrade` | Funil de 4 passos com summary panel lateral: Qualificação → Premium → Masterclass → Checkout |
| Upgrade Vídeo | `/upgrade-video` | Funil de 5 passos em single card: Qualificação → Masterclass → Gravação → Dúvida → Checkout |
| Upgrade Gravação | `/upgrade-gravacao` | Funil pós-compra de gravação de imagens com upsell de Masterclass |

#### 3.3 Páginas de Evento

| Página | Rota | Descrição |
|--------|------|-----------|
| Webinar Live Imagens | `/live` | Página do webinar ao vivo de imagens com vídeo YouTube embed, sidebar com programa, countdown |
| Webinar Live Vídeo | `/live-video` | Página do webinar ao vivo de vídeo com gate de acesso (LiveVideoGate), auto-refresh |
| Confirmação | `/confirmacao` | Página pós-inscrição/pagamento com animação, próximos passos, pixel de Purchase do Facebook |

#### 3.4 Páginas Pós-Evento

| Página | Rota | Descrição |
|--------|------|-----------|
| Recursos Imagens | `/recursos` | Portal de recursos para quem pagou (login via email+token), acesso a vídeos e materiais |
| Recursos Vídeo | `/recursos-video` | Portal de recursos para webinar de vídeo (login via email+token) |
| Convites | `/convites` | Programa de referrals/convites com leaderboard, progresso, partilha WhatsApp/email |

#### 3.5 Páginas Transaccionais

| Página | Rota | Descrição |
|--------|------|-----------|
| Pagar | `/pagar?o={order_id}` | Página intermediária de pagamento: valida link EuPago, redireciona para checkout, com fallbacks de timeout/erro |
| Fatura | `/fatura?rid={id}&t={token}` | Portal de recolha de dados de faturação (NIF). Formulário de 6 campos com auto-save |
| Termos | `/termos` | Termos e condições + Política de privacidade |

---

### 4. Produtos e Preços

#### 4.1 Webinar Imagens
- **Premium Pass:** €15 + IVA (€18,45) — gravação + materiais
- **Masterclass:** €47 + IVA (€57,81)
- **Bundle:** €62 + IVA (€76,26) — Premium + Masterclass

#### 4.2 Webinar Vídeo (preços pós-evento)
- **Sessão Prática (Premium):** €27 + IVA (€33,21) — sessão HD ~70min + workbook + guia GEMs + Q&A
- **Masterclass Vídeo:** €67 + IVA (€82,41) — 3h ao vivo com Frederico
- **Pack IA Completo (Bundle):** €107 + IVA (€131,61) — tudo de vídeo + tudo de imagens. Preço riscado €121, badge "Poupas €14"

#### 4.3 Inscrições de Grupo
- Até 10 pessoas por grupo
- 10% de desconto para grupos de 3+
- Vinculados por `group_payment_ref` (UUID)
- Pagamento único actualiza todos os membros

#### 4.4 Programa de Referrals
- Meta: 2 inscrições referidas para desbloquear prémio (livro físico)
- Leaderboard público com top 10
- Link pessoal com código de referral único

---

### 5. CRM Interno (`/crm`)

#### 5.1 Autenticação
- Login via email/password com Supabase Auth
- MFA obrigatório (verifica AAL level)
- Verificação de role `admin` via função `has_role()`
- Auto-assign de admin para `fredericodigital@gmail.com`

#### 5.2 Vistas do CRM

| Vista | Descrição |
|-------|-----------|
| **Dashboard** | KPIs principais (inscritos, receita, conversão), gráficos de evolução, resultados live do YouTube, filtro por período (7d/14d/30d/all), dados de visitantes da landing |
| **Pipeline** | Vista Kanban com colunas por plano (Free, Premium, Masterclass, Bundle). Drag-and-drop. Financials por coluna (pago vs pendente). Filtro por fonte (webinar/gravação) |
| **Tabela** | Vista tabelar de todos os inscritos com filtros, busca, badges de status, último email enviado, flag de NIF em falta |
| **Faturação** | KPIs financeiros, gráficos de receita, breakdown por plano, custos de aquisição (editáveis), tabela de faturas, P&L summary. Toggle IVA incluído/excluído |
| **Automações** | Fluxo visual de automações de email (pré e pós-webinar), métricas de envio, gestão de pessoas, editor de templates HTML |
| **Comunicação** | Envio manual de email e SMS com filtros por webinar/plano, selecção de destinatários por chips, histórico de envios |
| **Lixo** | Inscritos arquivados com opção de restaurar ou eliminar |

#### 5.3 Modal do Inscrito
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

#### 5.4 Webinar Switcher
O CRM suporta filtragem por webinar via selector na sidebar:
- **Consolidado (⊕):** Mostra todos os inscritos
- **Imagens IA (📷):** Filtra por webinar imagens
- **Vídeo IA (🎬):** Filtra por webinar vídeo

---

### 6. Sistema de Automações de Email

#### 6.1 Fluxo Webinar Vídeo — Pré-Evento
1. `video_confirmation` — Email de confirmação imediato após inscrição
2. `video_followup_prewebinar` — Follow-up pré-webinar
3. `video_reminder_48h` — Lembrete 48h antes
4. `video_reminder_24h` — Lembrete 24h antes
5. `video_reminder_1h` — Lembrete 1h antes

#### 6.2 Fluxo Webinar Vídeo — Pós-Evento
1. `video_postwebinar` — Email imediato pós-webinar
2. `video_postwebinar_day1` — Dia 1 (recursos + upsell)
3. `sms_followup_day1` — SMS manual follow-up Dia 1
4. `video_postwebinar_day3` — Dia 3
5. `video_postwebinar_closing` — Email de encerramento

#### 6.3 Emails Transaccionais
- `video_payment_premium` / `video_payment_masterclass` — Links de pagamento
- `video_recursos_premium` / `video_recursos_masterclass` / `video_recursos_bundle` — Acesso a recursos
- `invoice_request` — Solicitação de dados de faturação (NIF)

#### 6.4 Fluxo Webinar Imagens
- `imagens_confirmation`, `imagens_reminder_48h/24h/1h`, `imagens_postwebinar`

#### 6.5 Templates Editáveis
Os templates de email são armazenados na tabela `email_templates` e podem ser editados directamente no CRM via um editor HTML integrado (EmailEditorPanel).

---

### 7. Sistema de Pagamentos

#### 7.1 Fluxo de Pagamento
1. Utilizador escolhe plano na landing ou no funil de upgrade
2. Sistema cria registo via Edge Function `create-payment` ou `create-group-payment`
3. EuPago gera referência de pagamento (MB, MB WAY ou Cartão)
4. Link estável criado: `/pagar?o={order_id}`
5. Página `/pagar` invoca `resolve-payment` que valida o link EuPago (threshold 12h, validação activa 200/3xx)
6. Webhook `eupago-webhook` recebe notificação de pagamento
7. Sistema actualiza `paid_at`, `paid_amount` na tabela `registrations`
8. Se dados de faturação existem → emissão automática de fatura via InvoiceExpress

#### 7.2 EuPago
- Métodos: Multibanco, MB WAY, Cartão de Crédito
- Webhook automático para confirmação de pagamento
- Links regeneráveis com validação de URL activo

#### 7.3 InvoiceExpress
- Emissão automática de faturas quando NIF disponível
- Funções: `create-invoice`, `bulk-create-invoices`, `bulk-emit-invoices`, `bulk-finalize-invoices`
- Portal `/fatura` para recolha de dados fiscais pós-pagamento

---

### 8. Sistema de Faturação

#### 8.1 Fluxo
1. Após pagamento confirmado, sistema verifica se há `invoice_details` para o registo
2. Se sim → emite fatura automaticamente via InvoiceExpress
3. Se não → envia email `invoice_request` com link para `/fatura?rid={id}&t={token}`
4. Utilizador preenche formulário (6 campos: Nome/Empresa, NIF, Morada, Código Postal, Localidade, Email)
5. Formulário tem auto-save com debounce de 600ms
6. Após preenchimento → fatura emitida automaticamente + notificação ao Frederico
7. Envio registado na timeline do CRM com `template_key: "invoice_request"`

#### 8.2 Segurança
- Acesso ao formulário protegido por `edit_token` de 32 caracteres
- Escrita na tabela `invoice_details` bloqueada por RLS — apenas via Edge Function `invoice-upsert`
- Validação do token no servidor

---

### 9. Integrações Externas

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

### 10. Edge Functions (Backend)

O projecto tem **43 Edge Functions** organizadas por funcionalidade:

#### Registo e Autenticação
- `register-free` — Registo gratuito de novos inscritos

#### Pagamentos
- `create-payment` — Criar pagamento individual via EuPago
- `create-group-payment` — Criar pagamento de grupo
- `resolve-payment` — Validar e resolver link de pagamento
- `eupago-webhook` — Webhook de confirmação de pagamento

#### Emails
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

#### Faturação
- `invoice-upsert` — Guardar dados de faturação + emitir fatura
- `create-invoice` — Criar fatura no InvoiceExpress
- `bulk-create-invoices` — Criação em lote
- `bulk-emit-invoices` — Emissão em lote
- `bulk-finalize-invoices` — Finalização em lote

#### E-goi
- `egoi-sync` / `sync-egoi` — Sincronização de contactos
- `bulk-sync-egoi` — Sincronização em lote
- `bulk-tag-egoi` — Tagging em lote
- `cleanup-egoi-tags` — Limpeza de tags
- `grant-premium-egoi` — Conceder premium via E-goi

#### SMS
- `send-sms` — Envio de SMS via SMSOnline
- `backfill-sms-logs` — Backfill de logs de SMS

#### Outros
- `check-referrals` — Verificar estado de referrals
- `get-leaderboard` — Leaderboard de referrals
- `get-analytics-visitors` — Visitantes da landing
- `delete-registration` — Eliminar registo
- `redeem-voucher` — Resgatar voucher/gift code

---

### 11. Modelo de Dados

#### Tabela `registrations` (tabela principal)
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

#### Outras Tabelas
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

### 12. Funcionalidades de UX Notáveis

#### Design e Animações
- Framer Motion em todas as landing pages (fade-up, stagger, spring)
- Componentes visuais especiais: `ColorBends`, `ElectricBorder`, `AuroraBackground`, `SpotlightCard`, `CardSwap`
- Logo marquee com scroll infinito
- Countdown timers para eventos
- Three.js (`@react-three/fiber` + `@react-three/drei`) disponível mas uso não extenso

#### Responsividade
- Hook `useIsMobile()` para adaptação mobile
- Ordem de cards diferente em mobile vs desktop (ex: `/comprar`)
- Sidebar do CRM colapsável em mobile

#### Comunicação
- Botão WhatsApp flutuante em todas as páginas públicas
- Suporte via WhatsApp integrado nos fluxos de erro
- Copy para clipboard de links e mensagens pré-formatadas

#### Localização
- Todo o projecto está em Português de Portugal
- Detecção automática de género (`genderDetection.ts`) para personalização de emails
- Formatação de datas em PT (ex: "18 Fev 2026")

---

### 13. Configuração E-goi

- **List ID:** 5
- **Tags configuradas:**
  - `34` — webinar_video_com_ia_5_marco
  - `35` — premium_pass_webinar_video
  - `33` — masterclass (partilhada)

---

### 14. Estado Actual do Projecto (Março 2026)

- O webinar de imagens já ocorreu (18 Fev). A landing redireciona para venda da gravação.
- O webinar de vídeo já ocorreu (5 Mar). Fase activa de monetização pós-evento.
- Preços da Sessão Prática: early-bird €15+IVA (até 5 Mar) → preço normal €27+IVA
- Masterclass de vídeo agendada para 12 de Março (ou já ocorreu, depende da data actual)
- CRM activo com gestão de ~100+ inscritos entre os dois webinars
- Sistema de faturação activo com emissão automática + portal de recolha de NIF
- Automações de email pós-evento a funcionar (Day 1, Day 3, Closing)

---

### 15. Identidade e Marca

- **Marca:** Frederico Carvalho / DIGITALFC
- **Email principal:** fredericodigital@gmail.com
- **Email profissional:** frederico@digitalfc.pt
- **WhatsApp suporte:** +351 915 015 508
- **Google Reviews:** 1194 avaliações, 5.0★ (badge usado nas landing pages)
- **Tom de comunicação:** Profissional mas acessível. Emails assinados pelo Frederico em 1ª pessoa.
- **Público-alvo:** Responsáveis de marketing, empresários, PMEs, criadores de conteúdo, gestores de e-commerce

---

## FASE 2 — Documentação Técnica Detalhada

---

### 1. Stack Técnica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Runtime | React + TypeScript | React 18.3.1 |
| Build | Vite | latest |
| CSS | Tailwind CSS + tailwindcss-animate | latest |
| UI Components | Radix UI (26 primitives) + shadcn/ui | latest |
| Routing | react-router-dom | 6.30.1 |
| State/Fetching | @tanstack/react-query | 5.83.0 |
| Animation | Framer Motion 12.33 + GSAP 3.14 | — |
| 3D | @react-three/fiber + drei | 8.18 / 9.122 |
| Forms | react-hook-form + zod + @hookform/resolvers | — |
| Backend | Supabase (Lovable Cloud) | supabase-js 2.95 |
| Calendar | add-to-calendar-button-react | 2.13 |
| Charts | Recharts | 2.15 |

---

### 2. Arquitectura de Ficheiros

```text
src/
├── pages/              # 22 rotas (cada ficheiro = 1 página)
├── components/
│   ├── crm/            # ~40 ficheiros CRM (views, modals, tabs)
│   │   ├── modal/      # Sub-componentes do InscritoModal
│   │   ├── comunicacao/# Email/SMS tabs, previews, send confirmation
│   │   └── faturacao/  # Charts, KPIs, invoice table, P&L
│   ├── landing/        # ~25 componentes de landing pages
│   ├── webinar/        # Live webinar components + configs
│   ├── upgrade/        # Funil de upgrade (steps + invoice)
│   ├── recursos/       # Portal de recursos (login + conteúdo)
│   ├── legal/          # Termos e privacidade (modal)
│   └── ui/             # 50+ shadcn/ui primitives
├── hooks/              # 8 custom hooks
├── contexts/           # WebinarContext (CRM webinar filter)
├── config/             # webinarConfig.ts (constantes centrais)
├── lib/                # utils.ts + genderDetection.ts
├── integrations/supabase/  # client.ts + types.ts (auto-generated)
└── assets/             # Imagens, logos, fotos

supabase/
├── functions/          # 43 Edge Functions (Deno)
├── migrations/         # SQL migrations
└── config.toml         # 31 functions with verify_jwt=false
```

---

### 3. Routing (`src/App.tsx`)

| Rota | Componente | Tipo |
|------|-----------|------|
| `/` | `Index` → redirect para `/gravacao` | Landing |
| `/inicial` | `Inicial` | Landing Imagens |
| `/video` | `VideoPage` | Landing Vídeo pós-evento |
| `/video-lp` | `VideoLPPage` | Landing Vídeo pré-evento |
| `/gravacao` | `Gravacao` | Venda gravação imagens |
| `/comprar` | `Comprar` | Selector de planos vídeo |
| `/confirmacao` | `Confirmacao` | Pós-inscrição/pagamento |
| `/upgrade` | `Upsell` | Funil upgrade imagens |
| `/upgrade-video` | `UpgradeVideo` | Funil upgrade vídeo |
| `/upgrade-gravacao` | `UpgradeGravacao` | Upsell pós-gravação |
| `/upgrade/sucesso` | `UpgradeSucesso` | Confirmação de sucesso |
| `/live` | `WebinarLive` | Webinar ao vivo imagens |
| `/live-video` | `WebinarLiveVideo` | Webinar ao vivo vídeo |
| `/convites` | `Convites` | Programa de referrals |
| `/recursos` | `Recursos` | Portal recursos imagens |
| `/recursos-video` | `RecursosVideo` | Portal recursos vídeo |
| `/pagar` | `Pagar` | Intermediário de pagamento |
| `/fatura` | `Fatura` | Portal NIF/dados fiscais |
| `/termos` | `Termos` | Legal |
| `/crm` | `CRM` | Admin CRM (protegido) |
| `*` | `NotFound` | 404 |

---

### 4. Hooks Customizados

#### `useInscritos()` — `src/hooks/useInscritos.ts`
Hook central do CRM. Gere todo o estado dos inscritos.

- **Fetch**: `supabase.from("registrations").select("*").limit(5000)` com polling a cada 30s
- **Mapping**: `mapRegistration()` normaliza os dados do DB → tipo `Inscrito` (normaliza plan prefixes, calcula `payment_status`, detecta género)
- **Acções expostas**: `addNota`, `removeNota`, `updateStatus`, `toggleFollowUp`, `deleteInscrito`, `setGender`, `updateName`, `toggleDoNotContact`, `fetchMessageLogs`, `fetchPaymentEvents`, `fetchFailedEmailIds`, `sendBacklogCheckin`, `fetchMessageLogsSummary`, `regenerateLink`, `resendPaymentEmail`, `updateStepReached`, `toggleInvoiceSent`, `grantPremium`, `updatePlan`, `markAsPaid`, `markAsLost`
- **Padrão optimista**: Todas as acções actualizam o state local imediatamente e depois persistem no DB

#### `useWebinarSettings()` — `src/hooks/useWebinarSettings.ts`
- Singleton com cache em memória (`_cache`, `_fetchPromise`)
- Fetch único de `webinar_settings` → `Map<string, WebinarSettings>`
- `getPlanPrices(webinar, settingsMap)` — extrai preços por webinar com fallback hardcoded
- Usado no Dashboard, Pipeline, Faturação

#### `useCountdown(targetDate)` — `src/hooks/useCountdown.ts`
- Timer a cada 1s, retorna `{days, hours, minutes, seconds, isUrgent, isVeryUrgent, isExpired}`
- `isUrgent` = <24h, `isVeryUrgent` = <1h

#### `useRegistrationModal()` — `src/hooks/useRegistrationModal.tsx`
- Context Provider com estado do modal de inscrição
- Props: `variant` ("free"|"premium"), `referredBy` (from URL `?ref=`), `redirectPath`, `subtitle`, `webinar`

#### `useCountUp(end, duration)` — Animação de contagem numérica
#### `usePageMeta()` — Gestão de `<title>` e meta tags
#### `useIsMobile()` — `src/hooks/use-mobile.tsx` — Media query `(max-width: 768px)`

---

### 5. Contextos React

#### `WebinarContext` — `src/contexts/WebinarContext.tsx`
- Provider no `CRM.tsx`, wraps `CRMInner`
- Estado: `webinarContext: "imagens" | "video" | "consolidado"` (default: `"video"`)
- Usado pelo `CRMSidebar` (switcher) e por `filterByWebinar()` em todas as views

#### `RegistrationModalProvider` — `src/hooks/useRegistrationModal.tsx`
- Usado nas landing pages para gerir o modal de inscrição
- Suporta `?ref=CODE` para tracking de referrals

---

### 6. Schema da Base de Dados

#### Tabela `registrations` (tabela principal — ~50 colunas)
```sql
-- Chave primária
id          UUID DEFAULT gen_random_uuid()

-- Identificação
name        TEXT NOT NULL
email       TEXT NOT NULL
first_name  TEXT
last_name   TEXT
whatsapp    TEXT

-- Webinar + Plano
webinar           TEXT NOT NULL DEFAULT 'imagens'    -- UNIQUE com email
plan_selected     TEXT                                -- "premium", "video-masterclass", etc.
registration_source TEXT NOT NULL DEFAULT 'webinar'  -- "webinar" | "gravacao"

-- Pagamento
paid_at               TIMESTAMPTZ
paid_amount           NUMERIC
eupago_ref            TEXT
eupago_transaction_id TEXT
order_id              TEXT DEFAULT left(replace(gen_random_uuid()::text,'-',''),12)
last_payment_link     TEXT
payment_link_created_at TIMESTAMPTZ
last_payment_link_sent_at TIMESTAMPTZ

-- Faturação
edit_token          TEXT        -- 40 chars (UUID+8)
edit_token_created_at TIMESTAMPTZ
invoice_sent        BOOLEAN DEFAULT false
invoice_document_id TEXT

-- Funil
step_reached        INTEGER DEFAULT 1
upgrade_clicked_at  TIMESTAMPTZ
sources             TEXT        -- comma-separated
duvida              TEXT
role                TEXT
team_size           TEXT

-- Follow-up
followup_stage      INTEGER DEFAULT 0
last_followup_at    TIMESTAMPTZ
next_followup_at    TIMESTAMPTZ
do_not_contact      BOOLEAN DEFAULT false

-- Premium
premium_unlocked    BOOLEAN DEFAULT false
premium_granted_at  TIMESTAMPTZ
premium_granted_by  TEXT

-- Referrals
referral_code       TEXT NOT NULL   -- 6 chars, unique
referred_by         TEXT

-- Grupo
group_payment_ref   UUID
is_gift             BOOLEAN DEFAULT false
gift_code           TEXT
gifted_at           TIMESTAMPTZ

-- Estado
gender_override     TEXT
lost_at             TIMESTAMPTZ
lost_reason         TEXT
attended_live_at    TIMESTAMPTZ
created_at          TIMESTAMPTZ DEFAULT now()
```

**Índice único**: `(email, webinar)` — permite o mesmo email em webinars diferentes.

**RLS**: SELECT e UPDATE abertos para anon. INSERT e DELETE bloqueados (feitos via Edge Functions com service_role).

#### Tabela `invoice_details`
```sql
registration_id  UUID PRIMARY KEY
invoice_name     TEXT NOT NULL
invoice_vat      TEXT NOT NULL    -- 9 dígitos
invoice_address  TEXT NOT NULL
invoice_zip      TEXT NOT NULL    -- XXXX-XXX
invoice_city     TEXT NOT NULL
invoice_email    TEXT NOT NULL
updated_at       TIMESTAMPTZ
```
**RLS**: SELECT aberto. INSERT/UPDATE/DELETE bloqueados — escrita exclusivamente via `invoice-upsert` com `service_role`.

#### Tabela `message_logs`
```sql
id                  UUID PRIMARY KEY
registration_id     UUID NOT NULL
channel             TEXT DEFAULT 'email'    -- "email" | "sms"
provider            TEXT NOT NULL           -- "resend" | "brevo" | "egoi" | "smsonline" | "internal" | "system"
template_key        TEXT NOT NULL           -- "video_confirmation", "invoice_request", etc.
status              TEXT DEFAULT 'queued'   -- "queued" | "sent" | "failed"
provider_message_id TEXT
error               TEXT
payment_url         TEXT
created_at          TIMESTAMPTZ DEFAULT now()
updated_at          TIMESTAMPTZ DEFAULT now()
```
**RLS**: SELECT, INSERT e UPDATE abertos para anon. DELETE bloqueado.

#### Tabela `email_send_logs`
```sql
id               UUID PRIMARY KEY
webinar          TEXT NOT NULL
email_key        TEXT NOT NULL       -- template key
recipient_email  TEXT NOT NULL
fname            TEXT
status           TEXT NOT NULL       -- "sent" | "failed"
resend_id        TEXT
error_message    TEXT
sent_at          TIMESTAMPTZ
metadata         JSONB
```
**RLS**: SELECT e INSERT abertos. UPDATE e DELETE bloqueados.

#### Tabela `payment_events`
```sql
id              UUID PRIMARY KEY
registration_id UUID
event_type      TEXT NOT NULL    -- "webhook_received" | "link_created" | "payment_confirmed" | "unmatched_payment"
eupago_ref      TEXT
idempotency_key TEXT NOT NULL    -- UNIQUE — garante dedup
payload         JSONB DEFAULT '{}'
received_at     TIMESTAMPTZ DEFAULT now()
processed_at    TIMESTAMPTZ
```
**RLS**: SELECT e INSERT abertos. UPDATE e DELETE bloqueados.

#### Tabela `email_templates`
```sql
id           UUID PRIMARY KEY
template_key TEXT NOT NULL
name         TEXT NOT NULL
channel      TEXT DEFAULT 'email'
subject      TEXT NOT NULL
html_body    TEXT
text_body    TEXT
variables    JSONB DEFAULT '[]'
is_active    BOOLEAN DEFAULT true
version      INTEGER DEFAULT 1
updated_by   TEXT
updated_at   TIMESTAMPTZ DEFAULT now()
```
**RLS**: SELECT aberto. INSERT/UPDATE/DELETE bloqueados (protegido contra modificações não autorizadas).

#### Tabela `webinar_settings`
```sql
webinar          TEXT PRIMARY KEY    -- "imagens" | "video"
label            TEXT NOT NULL
emoji            TEXT DEFAULT ''
color            TEXT DEFAULT '#1e40af'
event_date       TIMESTAMPTZ
price_premium    NUMERIC DEFAULT 0
price_masterclass NUMERIC DEFAULT 0
price_bundle     NUMERIC DEFAULT 0
landing_visitors INTEGER DEFAULT 0
cutoff_date      TIMESTAMPTZ
live_views       INTEGER
live_avg_duration TEXT
live_peak_viewers INTEGER
live_likes       INTEGER
live_new_subs    INTEGER
live_date        TEXT
```
**RLS**: SELECT e UPDATE abertos (admin edita preços/métricas no CRM). INSERT e DELETE bloqueados.

#### Tabela `acquisition_costs`
```sql
id          UUID PRIMARY KEY
platform    TEXT NOT NULL
amount      NUMERIC NOT NULL
cost_date   DATE DEFAULT CURRENT_DATE
description TEXT DEFAULT ''
category    TEXT DEFAULT 'paid_media'
webinar     TEXT DEFAULT 'video'
```
**RLS**: CRUD completo aberto.

#### Tabela `scheduled_sends`
```sql
id           UUID PRIMARY KEY
channel      TEXT DEFAULT 'email'
subject      TEXT
html_body    TEXT
text_body    TEXT
recipients   JSONB DEFAULT '[]'
scheduled_at TIMESTAMPTZ NOT NULL
status       TEXT DEFAULT 'pending'
metadata     JSONB
```
**RLS**: CRUD completo para authenticated users.

#### Tabela `analytics_cache`
```sql
key        TEXT PRIMARY KEY
value      INTEGER NOT NULL
source     TEXT DEFAULT 'manual'
updated_at TIMESTAMPTZ DEFAULT now()
```
**RLS**: SELECT aberto. Escrita bloqueada (via Edge Functions).

#### Tabela `user_roles`
```sql
id      UUID PRIMARY KEY
user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
role    app_role NOT NULL   -- ENUM: 'admin' | 'moderator' | 'user'
UNIQUE(user_id, role)
```
**RLS**: SELECT apenas para o próprio utilizador (`auth.uid() = user_id`). INSERT/UPDATE/DELETE bloqueados.

---

### 7. Funções de Base de Dados

#### `has_role(_user_id UUID, _role app_role) → BOOLEAN`
- `SECURITY DEFINER` — executa com privilégios do owner, bypassa RLS
- Usada nas políticas RLS e na verificação de admin no CRM

#### `auto_assign_admin() → TRIGGER`
- Trigger em `auth.users` (on INSERT)
- Se `email = 'fredericodigital@gmail.com'` → insere role `admin` em `user_roles`

#### `ensure_admin_role() → VOID`
- `SECURITY DEFINER` — chamada após MFA verify no login do CRM
- Insere role `admin` se o utilizador autenticado é `fredericodigital@gmail.com`

---

### 8. Autenticação e Segurança do CRM

#### Fluxo de Login (`CRMLogin.tsx`)
```text
1. Email + Password → supabase.auth.signInWithPassword()
2. Check MFA factors → supabase.auth.mfa.listFactors()
   ├── Has verified TOTP → Screen "totp-verify"
   └── No TOTP → supabase.auth.mfa.enroll() → Screen "totp-setup"
3. TOTP Verify:
   a) supabase.auth.mfa.challenge({ factorId })
   b) supabase.auth.mfa.verify({ factorId, challengeId, code })
4. ensure_admin_role() → garante role admin
5. has_role(uid, 'admin') → verifica acesso
6. Se não admin → signOut + erro
```

#### Verificação Contínua (`CRM.tsx`)
```typescript
// On mount:
const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
if (aal?.currentLevel !== aal?.nextLevel) → não autenticado (MFA pendente)

// + verifica has_role('admin')
// + onAuthStateChange para detectar logout
```

#### Protecção de Edge Functions
- Maioria das Edge Functions: `verify_jwt = false` no `config.toml`
- Autenticação manual via:
  - `Authorization: Bearer <service_role_key>` (para chamadas internas)
  - `x-cron-secret` header (para cron jobs)
  - `x-crm-admin-email` + allowlist (para `delete-registration`)

---

### 9. Edge Functions — Detalhes Técnicos

#### `register-free` — Fluxo de Registo
```text
Input: { firstName, lastName, email, whatsapp, referredBy, registrationSource, webinar }

1. Check existing by (email, webinar)
   ├── Exists → return referralCode + sync E-goi (non-blocking)
   │            └── If video webinar & no video registration → create one
   └── Not exists:
       a) Generate unique referral_code (6 chars, A-Z2-9)
       b) Generate edit_token (40 chars UUID)
       c) Generate order_id (12 chars)
       d) INSERT into registrations
       e) If referredBy → check count(referred_by) ≥ 2 → unlock premium
       f) Sync E-goi (imagens: sync-egoi, video: egoi-sync)
       g) Send video confirmation email (non-blocking)

Output: { referralCode, referralLink, alreadyRegistered, premiumUnlocked, editToken }
```

#### `create-payment` — Criação de Pagamento
```text
Input: { plan, email, nome }

1. Derive webinar from plan prefix ("video-" → "video")
2. Idempotency: check recent eupago_ref (< 1h) → reuse
3. Lookup registration (id, edit_token, order_id)
4. Build identifier: "ORD-{name}-{planTag}" (SP/MC/PK)
5. Call EuPago API: paybylink/create
   - Methods: CC, MBWAY, MB
   - successUrl: /upgrade/sucesso?rid={id}&t={token}
   - callbackUrl: /functions/v1/eupago-webhook
6. Save transactionID, payment link to DB
7. Log to payment_events

Output: { paymentLink, reference }
```

#### `eupago-webhook` — Reconciliação de Pagamentos (1154 linhas)
```text
Input: POST/GET com transactionStatus, reference, amount, identifier, paymentMethod, transactionID

Estratégias de matching (em cascata):
1. Strategy 1 (DIAG) — eupago_ref match (raro, IDs diferentes)
2. Strategy 1b — ORD-{name}-{planTag} → lookup por eupago_transaction_id ou planTag
3. Strategy GROUP — GROUP-{ref12} → actualiza todos os membros do grupo
4. Strategy 2 (PRIMARY) — ORDER-{order_id}-{name} → match por order_id (12 chars)
5. Strategy 3 (LEGACY) — extrai email do identifier antigo
6. Strategy 3b — WEBINAR-{PLAN}-{email}-{timestamp}

Pós-match:
a) derivePlanFromAmount() — safety net para corrigir plano baseado no montante pago
b) Auto-invoice: se NIF exists → create-invoice (emit), senão draft
c) Log payment_confirmed em payment_events
d) E-goi: attach tags (premium:35, masterclass:33) por webinar
e) Send invoice_notification email ao Frederico (com grid detalhado)
f) Send confirmação ao cliente (video_payment_premium ou video_payment_masterclass)
g) Send email de recursos (video_recursos_premium/masterclass/bundle)
h) Unmatched → payment_events com event_type "unmatched_payment"
```

#### `send-email` — Hub Centralizado de Email
```text
Hierarquia de envio:
1. Brevo (primário) → brevo.com/v3/smtp/email
2. Resend (fallback 1) → resend.com/emails
3. E-goi Transactional V2 (fallback 2) → slingshot.egoiapp.com

Auth: service_role key OU x-cron-secret header
Sender: "Frederico Carvalho <frederico.carvalho@digitalfc.pt>"
```

#### `invoice-upsert` — Guardar Dados Fiscais
```text
1. Validate edit_token (30-day expiry)
2. Validate 6 campos (regex NIF, código postal, email)
3. Upsert invoice_details
4. Se paid_at → auto-emit invoice via create-invoice
5. Notify Frederico via send-email
6. Log "invoice_filled_notification" em message_logs
```

#### `create-invoice` — Emissão via InvoiceExpress
```text
1. Fetch registration + invoice_details
2. Derive preço base: paid_amount / 1.23 (para NIFs PT)
3. Determine quantity (groups: N × price, single: 1)
4. Create invoice-receipt no InvoiceExpress API
5. Se !draft_only → change state to "finalized" → email to client
6. Log "invoice_created"/"invoice_finalized" em message_logs
```

#### `resolve-payment` — Validação de Links
```text
1. Lookup by order_id
2. Se paid_at → redirect /upgrade/sucesso
3. Validate EuPago link (GET + redirect:manual, 8s timeout)
   - 200 ou 3xx com Location checkout → valid
   - 404/410 → regenerate via EuPago API
4. Return { redirectUrl, status }
```

#### `send-invoice-request` — Solicitação de NIF
```text
1. Filter: paid + edit_token + sem invoice_details
2. Optional: filter by webinar ou registration_ids
3. Para cada: enviar email via send-email com link /fatura?rid={id}&t={token}
4. Log "invoice_request" em message_logs
```

---

### 10. Padrões Técnicos Importantes

#### Normalização de Planos
```typescript
// DB armazena: "video-premium", "video-masterclass", "video-bundle"
// Frontend normaliza: remove "video-" prefix → "premium", "masterclass", "bundle"
plan.replace(/^video-/, "")
// "masterclass-group-pending" → "masterclass"
// "gravacao" → "premium" (equivalente funcional)
```

#### Detecção de Género
```typescript
// src/lib/genderDetection.ts
// Dicionário de ~180 nomes portugueses (MALE/FEMALE sets)
// detectGender("Maria") → "F"
// detectGender("Unknown") → "U"
// Usado para personalização de emails: "Olá Maria" vs "Olá João"
```

#### Cálculo de Payment Status
```typescript
payment_status = paid_at ? "paid"
  : (upgrade_clicked_at || eupago_ref) && plan !== "free" ? "awaiting_payment"
  : plan_selected && plan !== "free" ? "selected"
  : "free"
```

#### Auto-save do InvoiceForm
```typescript
// Debounce de 600ms no useEffect
// Validação Zod inline → se válido → invoke("invoice-upsert")
// Indicadores visuais: Loader2 (saving), Check "Guardado", AlertCircle "Falha"
```

#### Idempotência no Webhook
```typescript
// idempotency_key UNIQUE em payment_events
// "webhook-{txID}-{ref}" para dedup de webhooks
// "confirmed-{txID}-{regId}" para dedup de confirmações
// INSERT com ON CONFLICT ignora duplicados (23505)
```

#### Filtro de Webinar no CRM
```typescript
// config/webinarConfig.ts
function filterByWebinar(items, context) {
  if (context === "consolidado") return items;
  if (context === "video") return items.filter(i => i.webinar === "video");
  return items.filter(i => !i.webinar || i.webinar === "imagens");
}
```

---

### 11. Integrações de API — Endpoints

#### EuPago
- `POST https://clientes.eupago.pt/api/v1.02/paybylink/create` — criar link
- Webhook callback: `POST /functions/v1/eupago-webhook`
- Auth: `ApiKey {EUPAGO_API_KEY}`

#### InvoiceExpress
- Base: `https://fomentarsonhos.app.invoicexpress.com`
- `POST /invoice_receipts.json?api_key=` — criar invoice-receipt
- `PUT /invoice_receipts/{id}/change-state.json?api_key=` — finalizar/enviar
- `PUT /invoice_receipts/{id}/email-document.json?api_key=` — enviar por email

#### E-goi
- `GET https://api.egoiapp.com/lists/5/contacts?email=` — lookup contacto
- `POST https://api.egoiapp.com/lists/5/contacts/actions/attach-tag` — attach tag
- `POST https://slingshot.egoiapp.com/api/v2/email/messages/action/send/single` — email transaccional

#### Brevo
- `POST https://api.brevo.com/v3/smtp/email` — envio de email

#### Resend
- `POST https://api.resend.com/emails` — envio de email

#### SMSOnline
- Usado via Edge Function `send-sms`

---

### 12. Template Labels (`templateLabels.ts`)

57 template keys mapeados para labels humanas em PT. Função auxiliar `getTemplateLabel(key)` com fallback de humanização automática (`_` → espaço, capitalize).

Utilidade `fmtTimeAgo(iso)` — formata datas relativas: "agora", "há 5min", "há 3h", "há 2d".

---

### 13. Configuração Central (`webinarConfig.ts`)

```typescript
WEBINAR_CONFIG = {
  imagens: { label, emoji:"📷", date, startDate, color:"#1e40af", ... },
  video:   { label, emoji:"🎬", date, startDate, color:"#16a34a", ... },
}

EGOI_CONFIG = {
  baseUrl: "https://api.egoiapp.com",
  listId: 5,
  tags: { videoWebinar: 34, premiumPass: 35, masterclass: 33 },
}

// Datas-chave
VIDEO_WEBINAR_DATE = 2026-03-05T10:00:00Z
VIDEO_QA_DATE = 2026-03-10T14:30:00Z
VIDEO_MASTERCLASS_DATE = 2026-03-12T10:00:00Z
```

---

### 14. Secrets Configurados (16)

| Secret | Uso |
|--------|-----|
| `EUPAGO_API_KEY` | Pagamentos |
| `INVOICEEXPRESS_API_KEY` | Faturação |
| `INVOICEEXPRESS_ACCOUNT` | Faturação (account name) |
| `RESEND_API_KEY` | Email (fallback 1) |
| `BREVO_API_KEY` | Email (primário) |
| `EGOI_API_KEY` | CRM marketing / tags |
| `SMSONLINE_API_KEY` | SMS |
| `CRON_SECRET` | Autenticação de cron jobs |
| `CRM_ADMIN_SECRET` | Acesso admin |
| `PUBLIC_SITE_URL` | URLs de callback |
| `LOVABLE_API_KEY` | Lovable AI |
| `SUPABASE_URL` | Auto-configurado |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-configurado |
| `SUPABASE_ANON_KEY` | Auto-configurado |
| `SUPABASE_PUBLISHABLE_KEY` | Auto-configurado |
| `SUPABASE_DB_URL` | Auto-configurado |

---

### 15. Convenções de Código

- **Tipagem**: `as any` usado frequentemente para contornar tipos auto-gerados do Supabase (tabelas `invoice_details`, campos novos)
- **Optimistic updates**: State local actualizado antes da resposta do DB
- **Non-blocking calls**: Operações secundárias (E-goi sync, emails) executadas com `.catch()` sem bloquear o fluxo principal
- **Idempotência**: Verificação de duplicados antes de envios (check `message_logs` por `template_key` + `registration_id`)
- **Dual logging**: Emails registados tanto em `message_logs` (timeline CRM) como em `email_send_logs` (auditoria detalhada)
- **Error handling**: Try/catch com logging extensivo em `console.log/warn/error` nas Edge Functions
