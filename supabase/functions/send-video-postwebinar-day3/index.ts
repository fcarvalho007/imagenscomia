import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const RESEND_FROM = "Frederico Carvalho <frederico.carvalho@digitalfc.pt>";
const TEMPLATE_KEY = "video_postwebinar_day3";
const EMAIL_KEY = "video_postwebinar_day3";
const PREV_EMAIL_KEY = "video_postwebinar_day1";

function buildFallbackHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Só um lembrete rápido: o acesso ao Premium Pass fecha dentro de 2 dias.</p>

  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Inclui a gravação completa do webinar, o Q&A ao vivo e o guia de prompts para vídeo.</p>

  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#555;font-size:15px;font-weight:700;margin:0 0 12px;">Premium Pass — €27+IVA</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Garantir acesso antes que feche →</a>
    </div>
  </div>

  <p style="color:#999;font-size:13px;line-height:1.5;margin:16px 0 0;">Até breve,</p>
  <p style="color:#333;font-size:16px;font-weight:700;margin:4px 0 0;">Frederico Carvalho</p>
  <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
</div>
</body></html>`;
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

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    // Get who received day1
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

    // Recipients: still free + received day1
    const { data: registrants, error: queryErr } = await supabase
      .from("registrations")
      .select("id, email, first_name")
      .eq("webinar", "video")
      .is("paid_at", null)
      .eq("do_not_contact", false);

    if (queryErr) throw queryErr;
    const eligible = (registrants || []).filter((r) => day1Emails.has(r.email));

    // Idempotency
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

    for (let i = 0; i < toSend.length; i += 5) {
      const batch = toSend.slice(i, i + 5);
      const results = await Promise.all(batch.map(async (reg) => {
        try {
          const fname = reg.first_name || "";
          const rawHtml = tpl?.html_body ?? buildFallbackHtml(fname);
          const html = rawHtml.replace(/\{\{fname\}\}/g, fname);
          const subject = (tpl?.subject ?? "Antes que feche, {{fname}}").replace(/\{\{fname\}\}/g, fname);

          const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({ from: RESEND_FROM, to: [reg.email], subject, html }),
          });
          const resendData = await resendRes.json();
          const ok = resendRes.ok;

          await supabase.from("message_logs").insert({
            registration_id: reg.id,
            template_key: TEMPLATE_KEY,
            provider: "resend",
            channel: "email",
            status: ok ? "sent" : "failed",
            provider_message_id: resendData.id || null,
            error: ok ? null : JSON.stringify(resendData),
          });

          await supabase.from("email_send_logs").insert({
            webinar: "video",
            email_key: EMAIL_KEY,
            recipient_email: reg.email,
            fname,
            status: ok ? "sent" : "failed",
            resend_id: resendData.id || null,
            error_message: ok ? null : JSON.stringify(resendData),
          });

          return ok ? "sent" : "failed";
        } catch (err) {
          console.error(`Failed for ${reg.email}:`, err);
          return "failed";
        }
      }));

      for (const r of results) {
        if (r === "sent") sent++; else errors++;
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
