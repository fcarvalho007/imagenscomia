import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const TEMPLATE_KEY = "video_masterclass_day3";
const EMAIL_KEY = "video_masterclass_day3";

function buildFallbackHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">
  <div style="background:linear-gradient(135deg,#064e3b 0%,#16a34a 100%);padding:36px 28px 28px;text-align:center;">
    <p style="color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">Masterclass · Vídeo Profissional com IA</p>
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;line-height:1.3;">O que vem a seguir</h1>
  </div>
  <div style="padding:32px 28px;">
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Já passaram três dias desde a Masterclass.</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Espero que tenhas tido tempo de experimentar pelo menos um dos fluxos que trabalhámos. Não precisa de ser perfeito — precisa de acontecer.</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Tenho recebido mensagens de pessoas que já produziram os primeiros clips com o sistema. Se ainda não chegaste lá, não te preocupes. O acesso aos recursos não tem prazo.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="https://imagenscomia.com/recursos-video" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Aceder à minha área de recursos →</a>
    </div>
    <div style="border-top:1px solid #eee;padding-top:24px;margin-top:24px;">
      <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Nas próximas semanas vou continuar a produzir conteúdo sobre IA aplicada a marketing e criação de vídeo — no podcast, na newsletter e em novos eventos.</p>
      <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 8px;">Se ainda não acompanhas:</p>
      <p style="margin:0 0 8px;"><a href="https://fredericocarvalho.pt/newsletter" style="color:#16a34a;text-decoration:none;font-weight:600;font-size:15px;">→ Newsletter Digital Sprint (semanal)</a></p>
      <p style="margin:0 0 16px;"><a href="https://open.spotify.com/show/marketingporidiiotas" style="color:#16a34a;text-decoration:none;font-weight:600;font-size:15px;">→ Podcast Marketing por Idiotas · RFM</a></p>
      <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">E se tiveres colegas ou clientes que possam beneficiar deste sistema, podes partilhar a página da sessão em <a href="https://imagenscomia.com/video" style="color:#16a34a;text-decoration:none;font-weight:600;">imagenscomia.com/video</a>.</p>
    </div>
    <div style="border-top:1px solid #eee;padding-top:20px;margin-top:24px;">
      <p style="color:#333;font-size:16px;line-height:1.5;margin:0 0 16px;">Obrigado por teres estado presente.</p>
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

    // Get paid masterclass/bundle registrations
    const { data: registrants, error: queryErr } = await supabase
      .from("registrations")
      .select("id, email, first_name, paid_at, premium_granted_at, plan_selected")
      .eq("webinar", "video")
      .eq("do_not_contact", false)
      .in("plan_selected", ["masterclass", "bundle", "video-masterclass", "video-bundle"]);

    if (queryErr) throw queryErr;

    // Filter to paid only
    const eligible = (registrants || []).filter(
      (r) => r.paid_at || r.premium_granted_at
    );

    if (eligible.length === 0) {
      return new Response(JSON.stringify({ sent: 0, skipped: 0, errors: 0, reason: "no_eligible" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Dedup via email_send_logs
    const emails = eligible.map((r) => r.email);
    const { data: alreadySent } = await supabase
      .from("email_send_logs")
      .select("recipient_email")
      .eq("email_key", EMAIL_KEY)
      .eq("status", "sent")
      .in("recipient_email", emails);

    const sentSet = new Set((alreadySent || []).map((m) => m.recipient_email));
    const toSend = eligible.filter((r) => !sentSet.has(r.email));

    // Fetch template from DB
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
        const subject = (tpl?.subject ?? "O que vem a seguir, {{fname}}").replace(/\{\{fname\}\}/g, fname);

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
