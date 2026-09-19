import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.3";
import { resolveCourseAdmin } from "../_shared/course/admin.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const env = (key: string) => Deno.env.get(key);
const ACTIONS = ["status", "prepare", "install", "uninstall"] as const;
type Action = (typeof ACTIONS)[number];

// Copies the already-stored worker secret into Vault and converges the schedule.
// Never returns or logs a secret value. Creates no credential of its own.
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  if (req.method !== "POST") return json(405, { error: "POST required" });

  const db = createClient(env("SUPABASE_URL")!, env("SUPABASE_SERVICE_ROLE_KEY")!);
  const admin = await resolveCourseAdmin(req, db);
  if (!admin) return json(401, { error: "Unauthorized" });

  let action: Action = "status";
  try {
    const body = await req.json();
    const requested = String(body?.action || "status");
    if (!ACTIONS.includes(requested as Action)) return json(400, { error: "Invalid action" });
    action = requested as Action;
  } catch {
    return json(400, { error: "Invalid body" });
  }

  const secret = env("COURSE_CRON_SECRET") || "";
  const base = env("SUPABASE_URL") || "";
  const endpoint = `${base.replace(/\/$/, "")}/functions/v1/course-operations`;

  if (action === "status") {
    const { data, error } = await db.rpc("course_cron_installed");
    return json(200, {
      secret_configured: secret.length >= 32,
      endpoint_valid: /^https:\/\/[a-z0-9]+\.supabase\.co\/functions\/v1\/course-operations$/.test(endpoint),
      cron_installed: error ? null : Boolean(data),
    });
  }

  if (action === "uninstall") {
    const { data, error } = await db.rpc("course_cron_uninstall");
    if (error) return json(500, { error: "Uninstall failed" });
    return json(200, { state: data });
  }

  if (secret.length < 32) return json(409, { error: "worker_secret_missing" });
  const { error: syncError } = await db.rpc("course_cron_sync", { p_secret: secret, p_url: endpoint });
  if (syncError) return json(500, { error: "prepare_failed" });
  if (action === "prepare") return json(200, { state: "prepared" });

  const { data, error } = await db.rpc("course_cron_install");
  if (error) return json(500, { error: "install_failed" });
  return json(200, { state: data });
});
