
-- Add edit_token to registrations
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS edit_token text,
  ADD COLUMN IF NOT EXISTS edit_token_created_at timestamptz;

-- Remove permissive INSERT/UPDATE on invoice_details (keep SELECT for CRM reads)
DROP POLICY IF EXISTS "allow_anon_insert_invoice_details" ON invoice_details;
DROP POLICY IF EXISTS "allow_anon_update_invoice_details" ON invoice_details;
