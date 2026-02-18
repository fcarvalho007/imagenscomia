ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS invoice_sent BOOLEAN NOT NULL DEFAULT false;