
-- Create email_templates table
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_key text UNIQUE NOT NULL,
  subject text NOT NULL,
  html_body text,
  text_body text,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- Allow anon read (CRM uses anon key)
CREATE POLICY "allow_anon_select_email_templates"
  ON public.email_templates FOR SELECT
  USING (true);

-- Allow anon update (CRM edits)
CREATE POLICY "allow_anon_update_email_templates"
  ON public.email_templates FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Allow anon insert (for future templates)
CREATE POLICY "allow_anon_insert_email_templates"
  ON public.email_templates FOR INSERT
  WITH CHECK (true);

-- Seed stage 0: 30 min after upgrade click
INSERT INTO public.email_templates (template_key, subject, html_body, text_body) VALUES (
  'followup_stage_0',
  '{{name}}, o teu acesso ao {{plan_selected}} está quase pronto',
  NULL,
  E'Olá {{name}},\n\nReparámos que iniciaste a inscrição no plano {{plan_selected}} mas o pagamento ficou pendente.\n\nSem stress — o teu link de pagamento continua disponível:\n👉 {{payment_link}}\n\nSe tiveres alguma dúvida ou dificuldade, fala connosco por WhatsApp: {{support_whatsapp}}\n\nO webinar acontece dia {{webinar_date}} — garante já o teu lugar.\n\nAbraço,\nFrederico Carvalho'
);

-- Seed stage 1: 6h after
INSERT INTO public.email_templates (template_key, subject, html_body, text_body) VALUES (
  'followup_stage_1',
  'Ainda a tempo: retoma o teu pagamento, {{name}}',
  NULL,
  E'Olá {{name}},\n\nO teu lugar no plano {{plan_selected}} continua reservado, mas o pagamento ainda não foi confirmado.\n\nRetoma aqui em 2 minutos:\n👉 {{payment_link}}\n\nSe preferires pagar por referência multibanco ou tiveres qualquer dúvida, responde a este email ou envia mensagem para o WhatsApp: {{support_whatsapp}}\n\nNão percas o webinar de {{webinar_date}}.\n\nAbraço,\nFrederico Carvalho'
);

-- Seed stage 2: 24h after
INSERT INTO public.email_templates (template_key, subject, html_body, text_body) VALUES (
  'followup_stage_2',
  'Última chamada: o teu acesso {{plan_selected}} expira em breve',
  NULL,
  E'Olá {{name}},\n\nEsta é a última vez que te contactamos sobre o plano {{plan_selected}}.\n\nSe ainda quiseres participar, clica aqui para concluir o pagamento:\n👉 {{payment_link}}\n\nDepois deste email, não enviaremos mais lembretes.\n\nQualquer questão: WhatsApp {{support_whatsapp}}\n\nWebinar: {{webinar_date}}\n\nAbraço e boa sorte,\nFrederico Carvalho'
);
