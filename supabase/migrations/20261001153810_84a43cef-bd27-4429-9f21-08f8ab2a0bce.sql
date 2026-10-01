ALTER TABLE public.course_editions ADD COLUMN IF NOT EXISTS archived_at timestamptz;

CREATE TABLE IF NOT EXISTS public.course_edition_archive (
  edition text PRIMARY KEY REFERENCES public.course_editions(id),
  previous jsonb NOT NULL,
  reason text NOT NULL,
  archived_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.course_edition_archive TO authenticated;
GRANT ALL ON public.course_edition_archive TO service_role;
ALTER TABLE public.course_edition_archive ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins with MFA read edition archive" ON public.course_edition_archive
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') AND coalesce(auth.jwt()->>'aal','')='aal2');

INSERT INTO public.course_edition_archive(edition, previous, reason)
SELECT id, jsonb_build_object('availability',availability,'sales_enabled',sales_enabled,'automation_enabled',automation_enabled,'sms_enabled',sms_enabled,'invoicing_enabled',invoicing_enabled,'archived_at',archived_at),
  'Oferta substituída em 2026-10-01T15:11:25Z pela página única publicada no WordPress'
FROM public.course_editions WHERE id IN ('lisboa-2026','porto-2026','online-2026')
ON CONFLICT (edition) DO NOTHING;

-- Reversal: restore columns from course_edition_archive.previous and set archived_at = NULL.
UPDATE public.course_editions
SET availability='closed', automation_enabled=false, archived_at=coalesce(archived_at,'2026-10-01T15:11:25Z')
WHERE id IN ('lisboa-2026','porto-2026','online-2026');