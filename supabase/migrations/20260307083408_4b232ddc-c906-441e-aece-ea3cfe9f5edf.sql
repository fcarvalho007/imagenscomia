CREATE TABLE public.webinar_settings (
  webinar TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#1e40af',
  event_date TIMESTAMPTZ,
  price_premium NUMERIC DEFAULT 0,
  price_masterclass NUMERIC DEFAULT 0,
  price_bundle NUMERIC DEFAULT 0,
  landing_visitors INTEGER DEFAULT 0,
  cutoff_date TIMESTAMPTZ,
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

CREATE POLICY "allow_anon_select_webinar_settings"
  ON public.webinar_settings FOR SELECT USING (true);

CREATE POLICY "allow_anon_update_webinar_settings"
  ON public.webinar_settings FOR UPDATE USING (true) WITH CHECK (true);

INSERT INTO public.webinar_settings (webinar, label, emoji, color, event_date, price_premium, price_masterclass, price_bundle, landing_visitors, cutoff_date, live_views, live_avg_duration, live_peak_viewers, live_likes, live_new_subs, live_date)
VALUES
  ('imagens', 'Imagens IA', '📷', '#1e40af', '2026-02-18T10:00:00Z', 18.45, 57.81, 76.26, 2686, '2026-02-20T23:59:59Z', 268, '27:35', 109, 14, 11, '18 Fev'),
  ('video', 'Vídeo IA', '🎬', '#16a34a', '2026-03-02T23:59:59Z', 33.21, 82.41, 115.62, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL);