import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const RESEND_FROM = "Frederico Carvalho <frederico.carvalho@digitalfc.pt>";
const TEMPLATE_KEY = "video_postwebinar_day1";
const EMAIL_KEY = "video_postwebinar_day1";

function buildFallbackHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">O webinar de hoje foi intenso — cobrimos muito terreno em pouco tempo.</p>

  <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 12px;">Resumo rápido:</p>
  <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 4px;">→ Sistema de delegação: briefing + checklist + critérios de qualidade</p>
  <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 4px;">→ Ferramentas recomendadas e como combiná-las</p>
  <p style="color:#333;font-size:15px;line-height:1.7;margin:0 0 24px;">→ O que a IA faz bem e onde precisas de controlo humano</p>

  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Se quiseres rever tudo com calma, a gravação completa está disponível no Premium Pass.</p>

  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#555;font-size:15px;font-weight:700;margin:0 0 12px;">Premium Pass — €27+IVA</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Gravação HD da sessão completa</p>
    <p style="color:#333;font-size:15px;margin:0 0 4px;">✓ Sessão Q&A em grupo (10 Mar, 14h30)</p>
    <p style="color:#333;font-size:15px;margin:0 0 16px;">✓ Guia de prompts para vídeo (PDF)</p>
    <div style="text-align:center;">
      <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Obter acesso à gravação — €27+IVA →</a>
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

    // Recipients: all free video registrants, no attended_live_at filter (YouTube public)
    const { data: registrants, error: queryErr } = await supabase
      .from("registrations")
      .select("id, email, first_name")
      .eq("webinar", "video")
      .is("paid_at", null)
      .eq("do_not_contact", false);

    if (queryErr) throw queryErr;
    if (!registrants || registrants.length === 0) {
      return new Response(JSON.stringify({ sent: 0, skipped: 0, errors: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Idempotency via email_send_logs
    const emails = registrants.map((r) => r.email);
    const { data: alreadySent } = await supabase
      .from("email_send_logs")
      .select("recipient_email")
      .eq("email_key", EMAIL_KEY)
      .eq("status", "sent")
      .in("recipient_email", emails);

    const sentSet = new Set((alreadySent || []).map((m) => m.recipient_email));
    const toSend = registrants.filter((r) => !sentSet.has(r.email));

    // Fetch template from DB
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
          const subject = (tpl?.subject ?? "O webinar de hoje, {{fname}}").replace(/\{\{fname\}\}/g, fname);

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
