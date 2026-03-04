import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_FROM = "Frederico Carvalho <frederico.carvalho@digitalfc.pt>";
const VIDEO_WEBINAR_DATE = new Date("2026-03-05T10:00:00Z");
const TEMPLATE_KEY = "video_reminder_1h";

function buildHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 24px;">O webinar começa em 1 hora — às 10h00 (Portugal).</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 24px;">Entra aqui quando estiveres pronto:</p>

  <div style="text-align:center;margin:0 0 24px;">
    <a href="https://imagenscomia.com/live-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Entrar no webinar →</a>
  </div>

  <p style="color:#555;font-size:14px;margin:0 0 24px;">A sala abre alguns minutos antes do início.</p>

  <div style="border-top:1px solid #eee;padding-top:16px;margin-top:32px;">
    <p style="color:#333;font-size:16px;margin:0 0 4px;">Até já,</p>
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 4px;">Frederico Carvalho</p>
    <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
  </div>
</div>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const cronSecret = req.headers.get("x-cron-secret");
    if (cronSecret !== Deno.env.get("CRON_SECRET")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Guard: skip if not on the webinar date
    const now = new Date();
    const webinarDate = VIDEO_WEBINAR_DATE;
    if (
      now.getUTCFullYear() !== webinarDate.getUTCFullYear() ||
      now.getUTCMonth() !== webinarDate.getUTCMonth() ||
      now.getUTCDate() !== webinarDate.getUTCDate()
    ) {
      return new Response(JSON.stringify({ skipped: true, reason: "Not webinar day" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Window: 30min-90min before
    const nowMs = now.getTime();
    const targetStart = webinarDate.getTime() - 90 * 60 * 1000;
    const targetEnd = webinarDate.getTime() - 30 * 60 * 1000;
    if (nowMs < targetStart || nowMs > targetEnd) {
      return new Response(JSON.stringify({ skipped: true, reason: "Outside 1h window" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    const { data: registrants, error: queryErr } = await supabase
      .from("registrations")
      .select("id, email, first_name")
      .eq("webinar", "video")
      .eq("do_not_contact", false);

    if (queryErr) throw queryErr;
    if (!registrants || registrants.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, errors: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const regIds = registrants.map((r) => r.id);
    const { data: alreadySent } = await supabase
      .from("message_logs")
      .select("registration_id")
      .eq("template_key", TEMPLATE_KEY)
      .eq("status", "sent")
      .in("registration_id", regIds);

    const sentSet = new Set((alreadySent || []).map((m) => m.registration_id));
    const toSend = registrants.filter((r) => !sentSet.has(r.id));

    let sent = 0;
    let errors = 0;

    // Fetch template from DB
    const { data: tpl } = await supabase
      .from("email_templates")
      .select("subject, html_body")
      .eq("template_key", TEMPLATE_KEY)
      .maybeSingle();

    for (const reg of toSend) {
      await new Promise(r => setTimeout(r, 600));
      try {
        const fallbackHtml = buildHtml(reg.first_name || "");
        const rawHtml = tpl?.html_body ?? fallbackHtml;
        const html = rawHtml.replace(/\{\{fname\}\}/g, reg.first_name || "");
        const emailSubject = (tpl?.subject ?? "⏰ Começa em 1 hora — link de acesso").replace(/\{\{fname\}\}/g, reg.first_name || "");
        const resendRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            from: RESEND_FROM,
            to: [reg.email],
            subject: emailSubject,
            html,
          }),
        });
        const resendData = await resendRes.json();

        await supabase.from("message_logs").insert({
          registration_id: reg.id,
          template_key: TEMPLATE_KEY,
          provider: "resend",
          channel: "email",
          status: resendRes.ok ? "sent" : "failed",
          provider_message_id: resendData.id || null,
          error: resendRes.ok ? null : JSON.stringify(resendData),
        });

        // Log to email_send_logs
        await supabase.from("email_send_logs").insert({
          webinar: "video",
          email_key: "reminder_1h",
          recipient_email: reg.email,
          fname: reg.first_name || "",
          status: resendRes.ok ? "sent" : "failed",
          resend_id: resendData.id || null,
          error_message: resendRes.ok ? null : JSON.stringify(resendData),
        });

        if (resendRes.ok) sent++;
        else errors++;
      } catch (err) {
        console.error(`Failed for ${reg.email}:`, err);
        errors++;
      }
    }

    console.log(`video_reminder_1h: sent=${sent}, errors=${errors}, skipped=${sentSet.size}`);
    return new Response(JSON.stringify({ success: true, sent, errors }), {
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
