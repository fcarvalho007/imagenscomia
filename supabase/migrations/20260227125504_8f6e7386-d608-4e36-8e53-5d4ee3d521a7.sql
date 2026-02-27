ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS lost_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS lost_reason text DEFAULT NULL;