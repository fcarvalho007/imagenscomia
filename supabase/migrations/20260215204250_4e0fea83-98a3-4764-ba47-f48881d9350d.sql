
-- Migration: Add follow-up and payment link columns to registrations
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS last_payment_link text,
  ADD COLUMN IF NOT EXISTS payment_link_created_at timestamptz,
  ADD COLUMN IF NOT EXISTS followup_stage integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS next_followup_at timestamptz,
  ADD COLUMN IF NOT EXISTS do_not_contact boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_payment_link_sent_at timestamptz;

-- Create message_logs table for audit trail
CREATE TABLE public.message_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
  channel text NOT NULL DEFAULT 'email' CHECK (channel IN ('email','whatsapp')),
  provider text NOT NULL,
  template_key text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sent','failed','bounced','opened','clicked')),
  provider_message_id text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_message_logs_reg_template ON public.message_logs (registration_id, template_key, created_at);
CREATE INDEX idx_message_logs_status ON public.message_logs (status);

ALTER TABLE public.message_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_select_message_logs" ON public.message_logs
  FOR SELECT USING (true);

CREATE POLICY "allow_anon_insert_message_logs" ON public.message_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_anon_update_message_logs" ON public.message_logs
  FOR UPDATE USING (true) WITH CHECK (true);

-- Create payment_events table for idempotent webhook processing
CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid REFERENCES public.registrations(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  eupago_ref text,
  idempotency_key text UNIQUE NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

CREATE INDEX idx_payment_events_eupago_ref ON public.payment_events (eupago_ref);
CREATE INDEX idx_payment_events_received_at ON public.payment_events (received_at);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_select_payment_events" ON public.payment_events
  FOR SELECT USING (true);

CREATE POLICY "allow_anon_insert_payment_events" ON public.payment_events
  FOR INSERT WITH CHECK (true);
