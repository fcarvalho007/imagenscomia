import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

const TEMPLATE_KEY = "video_postwebinar_day1";
const EMAIL_KEY = "video_postwebinar_day1";

function buildFallbackHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">

  <div style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%);padding:36px 28px 28px;text-align:center;">
    <p style="color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">Sessão Prática · Vídeo Profissional com IA</p>
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;line-height:1.3;">Aqui está o teu resumo</h1>
  </div>

  <div style="padding:32px 28px;">
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">O resumo do webinar de ontem está pronto.<br>Mas antes de te partilhar o link, um exemplo rápido do mundo acelerado da Inteligência Artificial:</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Nos últimos 4 dias foram lançados o <strong>Gemini 3.1 Pro</strong>, o <strong>Gemini 3.1 Flash-Lite</strong>, e ontem o <strong>ChatGPT 5.3 Instant</strong> e o <strong>GPT 5.4 Thinking</strong>. Todos já disponíveis.</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">É exactamente este o ritmo.<br>Por isso o webinar foi intenso — propositadamente. Não há tempo a perder.</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 8px;">Conforme prometi, aqui está o resumo gratuito da sessão:</p>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://podes.entrar.pt/workbookgratis" style="display:inline-block;background:#4338ca;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">→ Descarregar o Resumo da Sessão</a>
    </div>

    <p style="color:#555;font-size:15px;line-height:1.6;margin:0 0 16px;">Não é uma lista de slides.<br>É um guia prático, as variáveis-chave do prompt, a comparação entre ferramentas e os erros mais comuns — com as correcções.</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 28px;">Lê com calma.</p>

    <div style="border-top:1px solid #eee;padding-top:24px;margin-bottom:28px;">
      <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Entretanto...<br>Se quiseres o contexto completo, recomendo:</p>
    </div>

    <div style="border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:28px;">
      <p style="color:#4338ca;font-size:13px;letter-spacing:1px;text-transform:uppercase;font-weight:700;margin:0 0 12px;">🎬 Premium Pass — €27 + IVA</p>
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;"><tr><td style="padding:6px 0;color:#333;font-size:15px;">✓ Sessão HD completa (70 min, sem cortes)</td></tr><tr><td style="padding:6px 0;color:#333;font-size:15px;">✓ Workbook detalhado com prompts e os casos de estudo partilhados em aula</td></tr><tr><td style="padding:6px 0;color:#333;font-size:15px;">✓ Guia técnico dos 3 GEMs para vídeo com IA</td></tr><tr><td style="padding:6px 0;color:#333;font-size:15px;">✓ Versão áudio MP3</td></tr></table>
      <div style="text-align:center;margin-top:20px;">
        <a href="https://imagenscomia.com/comprar" style="display:inline-block;background:#4338ca;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Quero acesso à sessão completa →</a>
        <p style="color:#888;font-size:13px;margin:8px 0 0;">27€ + IVA</p>
      </div>
    </div>

    <div style="border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:28px;">
      <p style="color:#333;font-size:15px;line-height:1.5;margin:0 0 8px;">E para quem quer ir mais fundo — agentes de IA, fluxos de montagem automáticos e edição com linguagem natural:</p>
      <p style="color:#16a34a;font-size:13px;letter-spacing:1px;text-transform:uppercase;font-weight:700;margin:0 0 8px;">📽 Masterclass · 12 de Março · 3h ao vivo</p>
      <p style="color:#555;font-size:15px;line-height:1.5;margin:0 0 16px;">Inclui tudo do Premium Pass.</p>
      <div style="text-align:center;">
        <a href="https://imagenscomia.com/comprar" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Saber mais sobre a Masterclass →</a>
        <p style="color:#888;font-size:13px;margin:8px 0 0;">67€ + IVA</p>
      </div>
    </div>

    <div style="border-top:1px solid #eee;padding-top:20px;margin-top:8px;">
      <p style="color:#555;font-size:14px;line-height:1.5;margin:0 0 4px;">Qualquer dúvida, responde directamente a este email.</p>
      <p style="color:#555;font-size:14px;line-height:1.5;margin:0 0 16px;">Bom fim de semana,</p>
      <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 2px;">Frederico Carvalho</p>
      <p style="color:#999;font-size:12px;margin:0;">DIGITALFC · <a href="https://fredericocarvalho.pt" style="color:#4338ca;text-decoration:none;">fredericocarvalho.pt</a></p>
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

    const emails = registrants.map((r) => r.email);
    const { data: alreadySent } = await supabase
      .from("email_send_logs")
      .select("recipient_email")
      .eq("email_key", EMAIL_KEY)
      .eq("status", "sent")
      .in("recipient_email", emails);

    const sentSet = new Set((alreadySent || []).map((m) => m.recipient_email));
    const toSend = registrants.filter((r) => !sentSet.has(r.email));

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
          const subject = (tpl?.subject ?? "Aqui está o teu resumo | Webinar Vídeo com IA").replace(/\{\{fname\}\}/g, fname);

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
