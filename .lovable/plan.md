

# Persistir dados financeiros e de configuração na base de dados

## Problema

Existem dados financeiros e operacionais hardcoded no código que se perdem ou ficam desactualizados quando há actualizações do sistema ou novos webinars:

1. **Preços dos planos** — hardcoded em `useInscritos.ts` (`PLAN_VALUES_BY_WEBINAR`) e em badges no `DashboardView.tsx`. Servem como fallback quando `paid_amount` é null.
2. **Métricas do dashboard** — `WEBINAR_DASHBOARD_CONFIG` em `webinarConfig.ts` (visitors, live results) hardcoded.
3. **Custos de aquisição** — já estão na base de dados (`acquisition_costs` table) ✓
4. **Dados de faturação** — já estão na base de dados (`invoice_details`, `registrations.invoice_document_id`) ✓
5. **Pagamentos** — `paid_amount` já está na tabela `registrations` ✓

O `paid_amount` na tabela `registrations` já é a fonte de verdade para receita real. O problema são os **metadados de configuração** por webinar que vivem no código.

## Solução

### 1. Criar tabela `webinar_settings` (migration)

```sql
CREATE TABLE public.webinar_settings (
  webinar TEXT PRIMARY KEY,           -- 'imagens', 'video', etc.
  label TEXT NOT NULL,                -- 'Imagens IA'
  emoji TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#1e40af',
  event_date TIMESTAMPTZ,
  
  -- Pricing per plan (preço com IVA)
  price_premium NUMERIC DEFAULT 0,
  price_masterclass NUMERIC DEFAULT 0,
  price_bundle NUMERIC DEFAULT 0,
  
  -- Dashboard metrics
  landing_visitors INTEGER DEFAULT 0,
  live_views INTEGER,
  live_avg_duration TEXT,
  live_peak_viewers INTEGER,
  live_likes INTEGER,
  live_new_subs INTEGER,
  live_date TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.webinar_settings ENABLE ROW LEVEL SECURITY;

-- Read-only for anon (edge functions use service role)
CREATE POLICY "allow_anon_select_webinar_settings"
  ON public.webinar_settings FOR SELECT USING (true);

-- Seed existing data
INSERT INTO public.webinar_settings (webinar, label, emoji, color, event_date, price_premium, price_masterclass, price_bundle, landing_visitors, live_views, live_avg_duration, live_peak_viewers, live_likes, live_new_subs, live_date)
VALUES
  ('imagens', 'Imagens IA', '📷', '#1e40af', '2026-02-18T10:00:00Z', 18.45, 57.81, 76.26, 2686, 268, '27:35', 109, 14, 11, '18 Fev'),
  ('video', 'Vídeo IA', '🎬', '#16a34a', '2026-03-02T23:59:59Z', 33.21, 82.41, 115.62, 0, NULL, NULL, NULL, NULL, NULL, NULL);
```

### 2. Actualizar `useInscritos.ts`

- Remover `PLAN_VALUES_BY_WEBINAR` hardcoded
- Fetch `webinar_settings` uma vez no mount
- Usar preços da DB como fallback quando `paid_amount` é null

### 3. Actualizar `DashboardView.tsx`

- Remover `WEBINAR_DASHBOARD_CONFIG` hardcoded de `webinarConfig.ts`
- Fetch `webinar_settings` para obter visitors, live results
- Manter `analytics_cache` para visitors dinâmicos do vídeo (já funciona)

### 4. Actualizar `webinarConfig.ts`

- Remover `WEBINAR_DASHBOARD_CONFIG` (movido para DB)
- Manter `WEBINAR_CONFIG` com dados de UI (dates, colors) que podem também ser lidos da DB futuramente

### 5. Actualizar edge functions de faturação

- `bulk-emit-invoices` já usa `paid_amount` como fonte de verdade ✓
- Para fallback (preço unitário na descrição da fatura), pode ler de `webinar_settings` em vez de hardcoded

## Benefícios

- **Novos webinars**: basta inserir uma linha em `webinar_settings` — sem alterar código
- **Alterações de preço**: actualizas na DB, sem deploy
- **Dados históricos**: cada webinar mantém os seus preços, métricas e custos separados
- **Custos e faturação**: já persistidos na DB, sem alteração necessária

## Ficheiros alterados (4)
- `webinar_settings` — nova tabela (migration)
- `src/hooks/useInscritos.ts` — fetch preços da DB
- `src/components/crm/DashboardView.tsx` — fetch métricas da DB
- `src/config/webinarConfig.ts` — remover `WEBINAR_DASHBOARD_CONFIG`

