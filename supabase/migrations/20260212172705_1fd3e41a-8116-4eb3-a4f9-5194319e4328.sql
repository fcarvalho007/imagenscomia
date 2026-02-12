CREATE POLICY "allow_anon_delete"
  ON public.registrations
  FOR DELETE
  USING (true);