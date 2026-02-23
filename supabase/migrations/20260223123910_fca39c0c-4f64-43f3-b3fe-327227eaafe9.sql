ALTER TABLE registrations ADD COLUMN IF NOT EXISTS role text;
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS team_size text;