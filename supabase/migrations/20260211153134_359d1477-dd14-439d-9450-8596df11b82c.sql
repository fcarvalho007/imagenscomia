
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS plan_selected text;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS sources text;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS duvida text;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS upgrade_clicked_at timestamptz;
