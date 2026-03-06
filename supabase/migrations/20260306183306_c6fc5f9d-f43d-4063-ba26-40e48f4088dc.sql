CREATE TABLE public.acquisition_costs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  description text NOT NULL DEFAULT '',
  amount numeric(10,2) NOT NULL,
  cost_date date NOT NULL DEFAULT CURRENT_DATE,
  category text NOT NULL DEFAULT 'paid_media',
  webinar text NOT NULL DEFAULT 'video',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.acquisition_costs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_select_costs" ON public.acquisition_costs FOR SELECT USING (true);
CREATE POLICY "allow_anon_insert_costs" ON public.acquisition_costs FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_anon_update_costs" ON public.acquisition_costs FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_delete_costs" ON public.acquisition_costs FOR DELETE USING (true);