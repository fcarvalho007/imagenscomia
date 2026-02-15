
-- Add new columns to email_templates
ALTER TABLE public.email_templates
  ADD COLUMN IF NOT EXISTS name text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS variables jsonb NOT NULL DEFAULT '[]'::jsonb;

-- Add check constraint for channel
ALTER TABLE public.email_templates
  ADD CONSTRAINT email_templates_channel_check CHECK (channel IN ('email'));

-- Add unique constraint on (template_key, version)
ALTER TABLE public.email_templates
  ADD CONSTRAINT email_templates_key_version_unique UNIQUE (template_key, version);

-- Add partial unique index: only one active per template_key
CREATE UNIQUE INDEX idx_one_active_per_key ON public.email_templates (template_key) WHERE is_active = true;
