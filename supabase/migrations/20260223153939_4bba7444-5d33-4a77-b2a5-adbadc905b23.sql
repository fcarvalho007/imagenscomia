
CREATE TABLE IF NOT EXISTS public.email_send_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  webinar text NOT NULL,
  email_key text NOT NULL,
  recipient_email text NOT NULL,
  fname text,
  status text NOT NULL,
  resend_id text,
  error_message text,
  sent_at timestamptz DEFAULT now()
);

CREATE INDEX idx_email_send_logs_webinar_key ON public.email_send_logs(webinar, email_key);
CREATE INDEX idx_email_send_logs_sent_at ON public.email_send_logs(sent_at);

ALTER TABLE public.email_send_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_select_email_send_logs" ON public.email_send_logs
  FOR SELECT USING (true);

CREATE POLICY "allow_anon_insert_email_send_logs" ON public.email_send_logs
  FOR INSERT WITH CHECK (true);
