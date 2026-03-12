import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret, x-crm-admin-email, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ALLOWED_ADMIN = "fredericodigital@gmail.com";
const TEMPLATE_KEY = "video_masterclass_reminder";
const ZOOM_LINK = "https://us06web.zoom.us/j/85839886498";

function buildHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#064e3b 0%,#16a34a 100%);padding:36px 28px 28px;text-align:center;">
    <p style="color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">Masterclass · Vídeo Profissional com IA</p>
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;line-height:1.3;">Daqui a 2 horas, ${fname}.</h1>
  </div>
  <div style="padding:32px 28px;">
    <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 16px;">Olá ${fname},</p>
    <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 20px;">A <strong>Masterclass "Vídeo Profissional com IA"</strong> começa às <strong>10h00</strong> (hora de Portugal). Está quase!</p>

    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:20px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;">
      <p style="color:#333;font-size:15px;line-height:1.8;margin:0;">
        🕐 <strong>Horário:</strong> 10h00 – 13h00<br>
        💻 <strong>Plataforma:</strong> Zoom (link abaixo)<br>
        📋 <strong>Preparação:</strong> computador ligado, bloco de notas à mão<br>
        🎧 <strong>Recomendação:</strong> usa auscultadores para melhor áudio
      </p>
    </div>

    <div style="text-align:center;margin:0 0 24px;">
      <a href="${ZOOM_LINK}" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Entrar na Masterclass →</a>
    </div>

    <p style="color:#555;font-size:14px;margin:0 0 24px;text-align:center;">A sala abre ~5 minutos antes do início.</p>

    <div style="border-top:1px solid #eee;padding-top:20px;margin-top:24px;">
      <p style="color:#333;font-size:16px;margin:0 0 4px;">Até já,</p>
      <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 2px;">Frederico Carvalho</p>
      <p style="color:#999;font-size:12px;margin:0;">DIGITALFC · <a href="https://fredericocarvalho.pt" style="color:#999;text-decoration:none;">fredericocarvalho.pt</a></p>
    </div>
  </div>
</div>
</body></html>`;
}

async function callSendEmail(supabaseUrl: string, serviceRoleKey: string, to: string, subject: string, html: string) {
  const res = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    body: JSON.stringify({ to, subject, html }),
  });
  return await res.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth: accept cron secret OR admin email header
    const cronSecret = req.headers.get("x-cron-secret");
    const adminEmail = req.headers.get("x-crm-admin-email");
    const validCron = cronSecret && cronSecret === Deno.env.get("CRON_SECRET");
    const validAdmin = adminEmail?.toLowerCase() === ALLOWED_ADMIN;

    if (!validCron && !validAdmin) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch masterclass/bundle participants with confirmed payment
    const { data: registrants, error: queryErr } = await supabase
      .from("registrations")
      .select("id, email, first_name")
      .eq("webinar", "video")
      .in("plan_selected", ["masterclass", "bundle"])
      .eq("do_not_contact", false)
      .or("paid_at.not.is.null,premium_granted_at.not.is.null");

    if (queryErr) throw queryErr;
    if (!registrants || registrants.length === 0) {
      return new Response(JSON.stringify({ success: true, sent: 0, errors: 0, reason: "No eligible registrants" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency: skip already sent
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

    // Check for custom template override
    const { data: tpl } = await supabase
      .from("email_templates")
      .select("subject, html_body")
      .eq("template_key", TEMPLATE_KEY)
      .maybeSingle();

    for (const reg of toSend) {
      await new Promise((r) => setTimeout(r, 600));
      try {
        const fallbackHtml = buildHtml(reg.first_name || "");
        const rawHtml = tpl?.html_body ?? fallbackHtml;
        const html = rawHtml.replace(/\{\{fname\}\}/g, reg.first_name || "");
        const emailSubject = (tpl?.subject ?? "🎬 Daqui a 2 horas — a Masterclass começa às 10h").replace(/\{\{fname\}\}/g, reg.first_name || "");

        const result = await callSendEmail(supabaseUrl, serviceRoleKey, reg.email, emailSubject, html);
        const ok = result.success === true;

        await supabase.from("message_logs").insert({
          registration_id: reg.id,
          template_key: TEMPLATE_KEY,
          provider: result.provider || "unknown",
          channel: "email",
          status: ok ? "sent" : "failed",
          provider_message_id: result.messageId || null,
          error: ok ? null : JSON.stringify(result.error || result),
        });

        await supabase.from("email_send_logs").insert({
          webinar: "video",
          email_key: "masterclass_reminder",
          recipient_email: reg.email,
          fname: reg.first_name || "",
          status: ok ? "sent" : "failed",
          resend_id: result.messageId || null,
          error_message: ok ? null : JSON.stringify(result.error || result),
        });

        if (ok) sent++;
        else errors++;
      } catch (err) {
        console.error(`Failed for ${reg.email}:`, err);
        errors++;
      }
    }

    console.log(`video_masterclass_reminder: sent=${sent}, errors=${errors}, skipped=${sentSet.size}`);
    return new Response(JSON.stringify({ success: true, sent, errors, skipped: sentSet.size }), {
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
