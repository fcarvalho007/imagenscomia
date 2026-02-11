
ALTER TABLE public.registrations
ADD COLUMN paid_at timestamp with time zone DEFAULT NULL,
ADD COLUMN eupago_ref text DEFAULT NULL;
