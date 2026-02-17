-- Remove dangerous "always true" policies
DROP POLICY IF EXISTS "allow_anon_delete" ON public.registrations;
DROP POLICY IF EXISTS "allow_anon_insert_email_templates" ON public.email_templates;
DROP POLICY IF EXISTS "allow_anon_update_email_templates" ON public.email_templates;