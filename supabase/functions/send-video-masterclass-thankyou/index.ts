import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret, x-crm-admin-email, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TEMPLATE_KEY = "video_masterclass_thankyou";
const EMAIL_KEY = "video_masterclass_thankyou";

function buildFallbackHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Georgia,serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#064e3b 0%,#16a34a 100%);padding:36px 28px 28px;text-align:center;">
    <p style="color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">Masterclass · Vídeo Profissional com IA</p>
    <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;line-height:1.3;">Obrigado, ${fname}.</h1>
  </div>
  <div style="padding:32px 28px;">
    <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 16px;">Olá ${fname},</p>
    <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 16px;">Foi um prazer ter-te na Masterclass de hoje.</p>
    <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 20px;">Espero que tenhas saído com ideias claras sobre como usar IA para criar vídeo profissional.</p>

    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:20px 20px;border-radius:0 8px 8px 0;margin:0 0 24px;">
      <p style="color:#333;font-size:15px;line-height:1.7;margin:0;">📦 Nas próximas <strong>24 horas</strong>, vou enviar-te o acesso à página de recursos da Masterclass — com a gravação completa, materiais e tudo o que foi partilhado durante a sessão.</p>
    </div>

    <p style="color:#333;font-size:16px;line-height:1.7;margin:0 0 24px;">Entretanto, se tiveres alguma dúvida, responde directamente a este email.</p>

    <div style="border-top:1px solid #eee;padding-top:20px;margin-top:24px;">
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
    const cronSecret = req.headers.get("x-cron-secret");
    const authHeader = req.headers.get("authorization") || "";
    const isCron = cronSecret === Deno.env.get("CRON_SECRET");
    const isServiceRole = authHeader.includes(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "__none__");

    if (!isCron && !isServiceRole) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: registrants, error: queryErr } = await supabase
      .from("registrations")
      .select("id, email, first_name, paid_at, premium_granted_at, plan_selected")
      .eq("webinar", "video")
      .eq("do_not_contact", false)
      .in("plan_selected", ["masterclass", "bundle", "video-masterclass", "video-bundle"]);

    if (queryErr) throw queryErr;

    const eligible = (registrants || []).filter(
      (r) => r.paid_at || r.premium_granted_at
    );

    if (eligible.length === 0) {
      return new Response(JSON.stringify({ sent: 0, skipped: 0, errors: 0, reason: "no_eligible" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emails = eligible.map((r) => r.email);
    const { data: alreadySent } = await supabase
      .from("email_send_logs")
      .select("recipient_email")
      .eq("email_key", EMAIL_KEY)
      .eq("status", "sent")
      .in("recipient_email", emails);

    const sentSet = new Set((alreadySent || []).map((m) => m.recipient_email));
    const toSend = eligible.filter((r) => !sentSet.has(r.email));

    const { data: tpl } = await supabase
      .from("email_templates")
      .select("subject, html_body")
      .eq("template_key", TEMPLATE_KEY)
      .maybeSingle();

    let sent = 0;
    let errors = 0;

    for (const reg of toSend) {
      await new Promise((r) => setTimeout(r, 600));
      try {
        const fname = reg.first_name || "";
        const rawHtml = tpl?.html_body ?? buildFallbackHtml(fname);
        const html = rawHtml.replace(/\{\{fname\}\}/g, fname);
        const subject = (tpl?.subject ?? "Estás dentro, {{fname}}. Masterclass confirmada.").replace(/\{\{fname\}\}/g, fname);

        const result = await callSendEmail(supabaseUrl, serviceRoleKey, reg.email, subject, html);
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
          email_key: EMAIL_KEY,
          recipient_email: reg.email,
          fname,
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

    console.log(`${TEMPLATE_KEY}: sent=${sent}, errors=${errors}, skipped=${sentSet.size}`);
    return new Response(JSON.stringify({ sent, skipped: sentSet.size, errors }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
