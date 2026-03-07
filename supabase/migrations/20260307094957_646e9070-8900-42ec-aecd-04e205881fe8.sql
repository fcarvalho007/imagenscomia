CREATE TABLE public.scheduled_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL DEFAULT 'email',
  subject text,
  html_body text,
  text_body text,
  recipients jsonb NOT NULL DEFAULT '[]'::jsonb,
  scheduled_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_authenticated_insert_scheduled_sends" ON public.scheduled_sends
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "allow_authenticated_select_scheduled_sends" ON public.scheduled_sends
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "allow_authenticated_update_scheduled_sends" ON public.scheduled_sends
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "allow_authenticated_delete_scheduled_sends" ON public.scheduled_sends
  FOR DELETE TO authenticated USING (true);