CREATE TABLE public.invoice_details (
  registration_id uuid PRIMARY KEY REFERENCES public.registrations(id) ON DELETE CASCADE,
  invoice_name text NOT NULL,
  invoice_vat text NOT NULL,
  invoice_address text NOT NULL,
  invoice_zip text NOT NULL,
  invoice_city text NOT NULL,
  invoice_email text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.invoice_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_anon_select_invoice_details" ON public.invoice_details FOR SELECT USING (true);
CREATE POLICY "allow_anon_insert_invoice_details" ON public.invoice_details FOR INSERT WITH CHECK (true);
CREATE POLICY "allow_anon_update_invoice_details" ON public.invoice_details FOR UPDATE USING (true) WITH CHECK (true);