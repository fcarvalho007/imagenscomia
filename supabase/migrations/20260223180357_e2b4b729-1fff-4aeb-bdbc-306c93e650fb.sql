ALTER TABLE registrations DROP CONSTRAINT registrations_email_key;
CREATE UNIQUE INDEX registrations_email_webinar_key ON registrations (email, webinar);