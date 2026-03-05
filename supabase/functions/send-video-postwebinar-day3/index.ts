import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const TEMPLATE_KEY = "video_postwebinar_day3";
const EMAIL_KEY = "video_postwebinar_day3";
const PREV_EMAIL_KEY = "video_postwebinar_day1";

function buildFallbackHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Este é o último email que envio sobre o Premium Pass do webinar "Cria Vídeo Profissional com IA".</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 24px;">Se ainda tens interesse, aqui fica o resumo:</p>

  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#555;font-size:15px;font-weight:700;margin:0 0 12px;">Premium Pass — €27+IVA</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Sessão completa (70 min, sem cortes)</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Sessão Q&A ao vivo — 10 Março, 14h30</p>
    <p style="color:#333;font-size:15px;margin:0 0 16px;">✓ Guia de prompts para vídeo (PDF)</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Obter o Premium Pass — €27+IVA →</a>
    </div>
  </div>

  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 8px;">Queres ir mais fundo?</p>
    <p style="color:#555;font-size:15px;font-weight:700;margin:0 0 8px;">Masterclass Vídeo com IA — €47+IVA</p>
    <p style="color:#555;font-size:15px;margin:0 0 12px;">3 horas ao vivo com demonstrações avançadas, casos reais e acompanhamento personalizado.</p>
    <p style="color:#333;font-size:15px;margin:0 0 16px;">📅 Quinta-feira, 12 de Março às 10h00</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Saber mais sobre a Masterclass →</a>
    </div>
  </div>

  <p style="color:#999;font-size:13px;line-height:1.5;margin:16px 0 0;">Até breve,</p>
  <p style="color:#333;font-size:16px;font-weight:700;margin:4px 0 0;">Frederico Carvalho</p>
  <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
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

    const { data: day1Sent } = await supabase
      .from("email_send_logs")
      .select("recipient_email")
      .eq("email_key", PREV_EMAIL_KEY)
      .eq("status", "sent");

    const day1Emails = new Set((day1Sent || []).map((r) => r.recipient_email));
    if (day1Emails.size === 0) {
      return new Response(JSON.stringify({ sent: 0, skipped: 0, errors: 0, reason: "no_day1_recipients" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: registrants, error: queryErr } = await supabase
      .from("registrations")
      .select("id, email, first_name")
      .eq("webinar", "video")
      .is("paid_at", null)
      .eq("do_not_contact", false);

    if (queryErr) throw queryErr;
    const eligible = (registrants || []).filter((r) => day1Emails.has(r.email));

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
      await new Promise(r => setTimeout(r, 600));
      try {
          const fname = reg.first_name || "";
          const rawHtml = tpl?.html_body ?? buildFallbackHtml(fname);
          const html = rawHtml.replace(/\{\{fname\}\}/g, fname);
          const subject = (tpl?.subject ?? "Último email sobre o Premium Pass, {{fname}}").replace(/\{\{fname\}\}/g, fname);

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

          if (ok) sent++; else errors++;
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
