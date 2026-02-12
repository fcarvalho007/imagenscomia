CREATE POLICY "allow_anon_select" ON public.registrations
  FOR SELECT USING (true);