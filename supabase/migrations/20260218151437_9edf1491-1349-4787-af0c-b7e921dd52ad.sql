
CREATE TABLE public.analytics_cache (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_select_analytics_cache" ON public.analytics_cache
  FOR SELECT USING (true);

INSERT INTO public.analytics_cache (key, value, source, updated_at)
VALUES ('landing_visitors', 2226, 'lovable_analytics_api', '2026-02-18T14:00:00Z');
