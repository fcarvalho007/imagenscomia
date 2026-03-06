CREATE OR REPLACE FUNCTION public.ensure_admin_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  SELECT auth.uid(), 'admin'
  WHERE EXISTS (
    SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'fredericodigital@gmail.com'
  )
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;