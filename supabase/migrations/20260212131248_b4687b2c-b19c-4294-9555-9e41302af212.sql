ALTER TABLE public.registrations ADD COLUMN step_reached integer DEFAULT 1;

-- Allow anon to update registrations (for step tracking from frontend)
CREATE POLICY "allow_anon_update"
ON public.registrations
FOR UPDATE
USING (true)
WITH CHECK (true);