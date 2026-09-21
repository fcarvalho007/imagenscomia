import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { resolveCourseAdmin } from "../_shared/course/admin.ts";

import { corsHeaders } from "../_shared/course/cors.ts";
const env = (key: string) => Deno.env.get(key);
const present = (...keys: string[]) => keys.every((k) => Boolean(env(k)));

// Read-only configuration report. Returns presence booleans only, never values.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST required" }), { status: 405, headers: corsHeaders });

  const db = createClient(env("SUPABASE_URL")!, env("SUPABASE_SERVICE_ROLE_KEY")!);
  const admin = await resolveCourseAdmin(req, db);
  if (!admin)
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  const health = await db.from("course_worker_health").select("last_run_at,result").eq("worker", "course-operations").maybeSingle();
  let cron: boolean | null = null;
  try {
    const { data, error } = await db.rpc("course_cron_installed");
    cron = error ? null : Boolean(data);
  } catch {
    cron = null;
  }

  // Aggregated job counts only — never contacts, ids or content.
  const { data: jobRows } = await db.from("course_jobs").select("kind,state,course_registrations(edition)");
  const totals: Record<string, number> = {};
  const perEdition: Record<string, Record<string, number>> = {};
  for (const row of jobRows ?? []) {
    const state = String(row.state);
    totals[state] = (totals[state] ?? 0) + 1;
    const reg = row.course_registrations as { edition?: string } | { edition?: string }[] | null;
    const edition = Array.isArray(reg) ? reg[0]?.edition : reg?.edition;
    if (edition) {
      perEdition[edition] = perEdition[edition] ?? {};
      perEdition[edition][state] = (perEdition[edition][state] ?? 0) + 1;
    }
  }

  return new Response(
    JSON.stringify({
      checks: {
        email_configured: present("RESEND_API_KEY", "COURSE_EMAIL_FROM", "COURSE_EMAIL_REPLY_TO"),
        sms_configured: present("SMSONLINE_API_KEY", "COURSE_SMS_FROM"),
        invoice_configured: present("INVOICEEXPRESS_API_KEY", "COURSE_INVOICEEXPRESS_ACCOUNT", "COURSE_INVOICEEXPRESS_TAX_NAME"),
        worker_secret_configured: (env("COURSE_CRON_SECRET") || "").length >= 32,
        public_url_configured: present("COURSE_PUBLIC_URL", "COURSE_APP_URL"),
      },
      switches: {
        email_enabled: env("COURSE_AUTOMATIONS_ENABLED") === "true",
        sms_enabled: env("COURSE_SMS_ENABLED") === "true",
        invoicing_enabled: env("COURSE_INVOICING_ENABLED") === "true",
        payments_enabled: env("COURSE_PAYMENTS_ENABLED") === "true",
        payment_environment: env("COURSE_PAYMENT_ENV") === "production" ? "production" : "sandbox",
      },
      worker: { last_run_at: health.data?.last_run_at ?? null, result: health.data?.result ?? null },
      cron_installed: cron,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } },
  );
});
