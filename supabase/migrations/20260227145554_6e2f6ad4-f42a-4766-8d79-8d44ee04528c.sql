ALTER TABLE registrations 
  ADD COLUMN IF NOT EXISTS group_payment_ref uuid DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_group_payment_ref 
  ON registrations(group_payment_ref) 
  WHERE group_payment_ref IS NOT NULL;