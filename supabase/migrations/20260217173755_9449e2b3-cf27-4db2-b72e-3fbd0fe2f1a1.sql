
-- Add order_id column to registrations
ALTER TABLE public.registrations ADD COLUMN order_id text UNIQUE;

-- Backfill existing registrations with order_id
UPDATE public.registrations SET order_id = LEFT(REPLACE(gen_random_uuid()::text, '-', ''), 12) WHERE order_id IS NULL;

-- Make order_id NOT NULL after backfill
ALTER TABLE public.registrations ALTER COLUMN order_id SET DEFAULT LEFT(REPLACE(gen_random_uuid()::text, '-', ''), 12);
