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
<body style="margin:0;padding:0;background:#f0f0f0;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#064e3b 0%,#16a34a 100%);padding:44px 32px 36px;text-align:center;">
    <p style="color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;margin:0 0 14px;">✅ Masterclass · Vídeo Profissional com IA</p>
    <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0;letter-spacing:-0.3px;">Obrigado pela presença</h1>
  </div>

  <!-- Body -->
  <div style="padding:40px 32px 32px;">
    <p style="color:#1a1a1a;font-size:16px;line-height:1.8;margin:0 0 18px;">Olá ${fname},</p>
    <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 18px;">Chegou ao fim a Masterclass de Vídeo Profissional com Inteligência Artificial e a sequência de conteúdos ao tema de conteúdo visual.</p>
    <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 28px;">Para quem teve a oportunidade de assistir ao vivo, obrigado pela presença e participação.</p>

    <!-- Callout box -->
    <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:24px 24px;border-radius:0 10px 10px 0;margin:0 0 32px;">
      <p style="color:#1a1a1a;font-size:15px;line-height:1.8;margin:0;"><span style="font-size:20px;vertical-align:middle;">📦</span>&nbsp; Nas próximas <strong>24 horas</strong>, vou enviar novo email, com o acesso à gravação completa, materiais e conteúdo complementar do que foi partilhado durante a sessão.</p>
    </div>

    <!-- Resources -->
    <p style="color:#1a1a1a;font-size:16px;line-height:1.8;margin:0 0 16px;font-weight:600;">Adicionalmente:</p>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 12px;">
      <tr>
        <td style="padding:16px 20px;background:#fafafa;border-radius:10px;border:1px solid #eee;">
          <p style="margin:0 0 8px;font-size:15px;color:#333;line-height:1.6;"><span style="font-size:18px;vertical-align:middle;">📚</span>&nbsp; Para rever o conteúdo e ficheiros do webinar <strong>Imagens com IA</strong> (18 Fev):</p>
          <a href="https://imagenscomia.com/recursos" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:14px;font-weight:600;padding:10px 24px;border-radius:6px;text-decoration:none;letter-spacing:0.3px;">Aceder a Recursos — Imagens</a>
        </td>
      </tr>
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 28px;">
      <tr>
        <td style="padding:16px 20px;background:#fafafa;border-radius:10px;border:1px solid #eee;">
          <p style="margin:0 0 8px;font-size:15px;color:#333;line-height:1.6;"><span style="font-size:18px;vertical-align:middle;">🎬</span>&nbsp; Para rever o conteúdo e ficheiros do webinar <strong>Vídeo com IA</strong> (12 Fev):</p>
          <a href="https://imagenscomia.com/recursos-video" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:14px;font-weight:600;padding:10px 24px;border-radius:6px;text-decoration:none;letter-spacing:0.3px;">Aceder a Recursos — Vídeo</a>
        </td>
      </tr>
    </table>

    <p style="color:#888;font-size:14px;line-height:1.7;margin:0 0 24px;font-style:italic;">Acesso através do email registado na plataforma.</p>
    <p style="color:#333;font-size:16px;line-height:1.8;margin:0 0 32px;">Acredito que a documentação e os processos vão trazer valor acrescentado.</p>

    <!-- Signature -->
    <div style="border-top:1px solid #eee;padding-top:24px;margin-top:8px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="vertical-align:middle;padding-right:16px;">
            <img src="https://imagenscomia.com/frederico-avatar.jpg" alt="Frederico Carvalho" width="52" height="52" style="border-radius:50%;display:block;object-fit:cover;" />
          </td>
          <td style="vertical-align:middle;">
            <p style="color:#1a1a1a;font-size:15px;font-weight:700;margin:0 0 2px;">Frederico Carvalho</p>
            <p style="color:#999;font-size:12px;margin:0;">DIGITALFC · <a href="https://fredericocarvalho.pt" style="color:#999;text-decoration:none;">fredericocarvalho.pt</a></p>
          </td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Footer -->
  <div style="background:#fafafa;padding:20px 32px;text-align:center;border-top:1px solid #eee;">
    <p style="color:#bbb;font-size:11px;line-height:1.6;margin:0;">DIGITALFC · Porto, Portugal<br>Este email foi enviado porque participou num evento Imagens com IA.</p>
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
      .select("id, email, first_name, paid_at, premium_granted_at, plan_selected, webinar")
      .eq("do_not_contact", false)
      .in("plan_selected", ["masterclass", "bundle", "video-masterclass", "video-bundle"]);

    if (queryErr) throw queryErr;

    const eligible = (registrants || []).filter(
      (r) => r.paid_at || r.premium_granted_at
    );

    // Deduplicate by email (user may have registrations in both webinars)
    const seenEmails = new Set<string>();
    const deduped = eligible.filter((r) => {
      if (seenEmails.has(r.email)) return false;
      seenEmails.add(r.email);
      return true;
    });

    if (deduped.length === 0) {
      return new Response(JSON.stringify({ sent: 0, skipped: 0, errors: 0, reason: "no_eligible" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emails = deduped.map((r) => r.email);
    const { data: alreadySent } = await supabase
      .from("email_send_logs")
      .select("recipient_email")
      .eq("email_key", EMAIL_KEY)
      .eq("status", "sent")
      .in("recipient_email", emails);

    const sentSet = new Set((alreadySent || []).map((m) => m.recipient_email));
    const toSend = deduped.filter((r) => !sentSet.has(r.email));

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
        const subject = (tpl?.subject ?? "A Masterclass terminou — obrigado, {{fname}}.").replace(/\{\{fname\}\}/g, fname);

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
