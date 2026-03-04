import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TEMPLATE_KEY = "video_followup_prewebinar";
const EMAIL_KEY = "video_followup_prewebinar";

const WINDOW_START = new Date("2026-02-27T00:00:00Z");
const WINDOW_END = new Date("2026-03-04T00:00:00Z");

function buildFallbackHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>

  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Reparei que te inscreveste no webinar <strong>"Vídeo com IA"</strong> mas ainda estás no plano gratuito.</p>

  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Queria só lembrar-te que o <strong>early bird termina a 3 de Março</strong> — depois disso o preço sobe e perdes acesso a alguns bónus exclusivos.</p>

  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 8px;">Com o upgrade, recebes:</p>
  <ul style="color:#333;font-size:15px;line-height:1.8;margin:0 0 24px;padding-left:20px;">
    <li>Acesso à gravação completa do webinar</li>
    <li>Templates e prompts exclusivos</li>
    <li>Sessão Q&A ao vivo comigo</li>
    <li>Acesso à comunidade premium</li>
  </ul>

  <div style="text-align:center;margin:0 0 24px;">
    <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Fazer upgrade agora →</a>
  </div>

  <p style="color:#555;font-size:14px;margin:0 0 24px;">Se tiveres alguma dúvida, responde a este email — leio tudo pessoalmente.</p>

  <div style="border-top:1px solid #eee;padding-top:16px;margin-top:32px;">
    <p style="color:#333;font-size:16px;margin:0 0 4px;">Até já,</p>
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 4px;">Frederico Carvalho</p>
    <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
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
    if (cronSecret !== Deno.env.get("CRON_SECRET")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    if (now < WINDOW_START || now >= WINDOW_END) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "outside_window" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const cutoff = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();

    const { data: registrants, error: queryErr } = await supabase
      .from("registrations")
      .select("id, email, first_name")
      .eq("webinar", "video")
      .is("paid_at", null)
      .eq("do_not_contact", false)
      .lt("created_at", cutoff);

    if (queryErr) throw queryErr;
    if (!registrants || registrants.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, skipped: 0, errors: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const emails = registrants.map((r) => r.email);
    const { data: alreadySent } = await supabase
      .from("email_send_logs")
      .select("recipient_email")
      .eq("email_key", EMAIL_KEY)
      .eq("status", "sent")
      .in("recipient_email", emails);

    const sentSet = new Set((alreadySent || []).map((r) => r.recipient_email));
    const toSend = registrants.filter((r) => !sentSet.has(r.email));

    if (toSend.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, skipped: sentSet.size, errors: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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
        const fallbackHtml = buildFallbackHtml(fname);
        const rawHtml = tpl?.html_body ?? fallbackHtml;
        const html = rawHtml.replace(/\{\{fname\}\}/g, fname);
        const rawSubject = tpl?.subject ?? "{{fname}}, ainda dá tempo ⏳";
        const emailSubject = rawSubject.replace(/\{\{fname\}\}/g, fname);

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

    console.log(`${TEMPLATE_KEY}: sent=${sent}, skipped=${sentSet.size}, errors=${errors}`);
    return new Response(
      JSON.stringify({ sent, skipped: sentSet.size, errors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
