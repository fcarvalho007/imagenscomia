import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret, x-crm-admin-email, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cronSecret = req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("authorization") || "";
    const isCron = cronSecret && cronSecret === Deno.env.get("CRON_SECRET");

    const body = await req.json().catch(() => ({}));
    const templateKey = body.template_key || "video_reminder_24h";
    const emailKey = body.email_key || "reminder_24h";
    const limit = body.limit || 50;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const srvKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const hasServiceRole = srvKey && authHeader.includes(srvKey);
    if (!isCron && !hasServiceRole) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, srvKey);

    // Get failed message_logs for this template
    const { data: failedLogs, error: logsErr } = await supabase
      .from("message_logs")
      .select("registration_id")
      .eq("template_key", templateKey)
      .eq("status", "failed");

    if (logsErr) throw logsErr;
    if (!failedLogs || failedLogs.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No failed emails to resend", sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Deduplicate and exclude those that were already successfully sent
    const failedRegIds = [...new Set(failedLogs.map((l) => l.registration_id))];

    const { data: alreadySent } = await supabase
      .from("message_logs")
      .select("registration_id")
      .eq("template_key", templateKey)
      .eq("status", "sent")
      .in("registration_id", failedRegIds);

    const sentSet = new Set((alreadySent || []).map((m) => m.registration_id));
    const toResendIds = failedRegIds.filter((id) => !sentSet.has(id));

    if (toResendIds.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "All failed emails were already resent", sent: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get registration details
    const { data: registrants, error: regErr } = await supabase
      .from("registrations")
      .select("id, email, first_name")
      .in("id", toResendIds)
      .eq("do_not_contact", false)
      .limit(limit);

    if (regErr) throw regErr;

    // Get template
    const { data: tpl } = await supabase
      .from("email_templates")
      .select("subject, html_body")
      .eq("template_key", templateKey)
      .maybeSingle();

    let sent = 0;
    let errors = 0;
    const results: Array<{ email: string; status: string; error?: string }> = [];

    for (const reg of (registrants || [])) {
      await new Promise((r) => setTimeout(r, 600));
      try {
        const rawHtml = tpl?.html_body || `<p>Olá ${reg.first_name || ""},</p><p>Este é um lembrete do webinar.</p>`;
        const html = rawHtml.replace(/\{\{fname\}\}/g, reg.first_name || "");
        const emailSubject = (tpl?.subject || "Lembrete do webinar").replace(/\{\{fname\}\}/g, reg.first_name || "");

        const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${srvKey}`,
          },
          body: JSON.stringify({ to: reg.email, subject: emailSubject, html }),
        });

        const result = await res.json();
        const ok = result.success === true;

        await supabase.from("message_logs").insert({
          registration_id: reg.id,
          template_key: templateKey,
          provider: result.provider || "unknown",
          channel: "email",
          status: ok ? "sent" : "failed",
          provider_message_id: result.messageId || null,
          error: ok ? null : JSON.stringify(result.error || result),
        });

        await supabase.from("email_send_logs").insert({
          webinar: "video",
          email_key: emailKey,
          recipient_email: reg.email,
          fname: reg.first_name || "",
          status: ok ? "sent" : "failed",
          resend_id: result.messageId || null,
          error_message: ok ? null : JSON.stringify(result.error || result),
        });

        if (ok) sent++;
        else errors++;
        results.push({ email: reg.email, status: ok ? "sent" : "failed", error: ok ? undefined : result.error });
      } catch (err) {
        console.error(`Failed for ${reg.email}:`, err);
        errors++;
        results.push({ email: reg.email, status: "error", error: String(err) });
      }
    }

    const remaining = toResendIds.length - (registrants?.length || 0);
    console.log(`resend-failed-emails [${templateKey}]: sent=${sent}, errors=${errors}, total=${registrants?.length || 0}, remaining=${remaining}`);
    return new Response(JSON.stringify({ success: true, sent, errors, total: registrants?.length || 0, remaining, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
