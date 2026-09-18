import { authorizedDelivery } from "../_shared/delivery-auth.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TEMPLATE_KEY = "video_postwebinar";

async function getSubscriberHistory(email: string, sb: any) {
  try {
    const { data } = await sb
      .from("registrations")
      .select("plan_selected, paid_at")
      .eq("email", email.toLowerCase().trim())
      .eq("webinar", "imagens")
      .order("created_at", { ascending: false })
      .limit(1);
    return data?.[0] || null;
  } catch { return null; }
}

function determineVariant(history: any): string {
  if (!history) return "A";
  const plan = history.plan_selected;
  const paid = !!history.paid_at;
  if ((plan === "masterclass" || plan === "bundle") && paid) return "D";
  if (plan === "premium" && paid) return "C";
  return "B";
}

function buildHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;">

  <div style="background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4338ca 100%);padding:36px 28px 28px;text-align:center;">
    <p style="color:rgba(255,255,255,0.7);font-size:13px;letter-spacing:1px;text-transform:uppercase;margin:0 0 8px;">Sessão Prática · Vídeo Profissional com IA</p>
    <h1 style="color:#ffffff;font-size:22px;font-weight:700;margin:0;line-height:1.3;">Tudo pronto para começares</h1>
  </div>

  <div style="padding:32px 28px;">
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Tens à tua disposição uma sessão prática de 70 minutos onde mostro o processo completo — do briefing ao clip publicável — com ferramentas prontas a usar.</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 28px;">Se quiseres aplicar os exercícios ao teu ritmo e usar as ferramentas que partilhei, o <strong>Premium Pass</strong> inclui tudo o que precisas.</p>

    <div style="border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:28px;">
      <p style="color:#4338ca;font-size:13px;letter-spacing:1px;text-transform:uppercase;font-weight:700;margin:0 0 12px;">Premium Pass — €27+IVA</p>
      <table cellpadding="0" cellspacing="0" border="0" style="width:100%;">
        <tr><td style="padding:8px 0;vertical-align:top;width:28px;"><span style="font-size:18px;">🎬</span></td><td style="padding:8px 0;"><p style="margin:0;color:#333;font-size:15px;font-weight:600;">Sessão prática completa em HD</p><p style="margin:2px 0 0;color:#666;font-size:13px;">70 minutos, sem cortes</p></td></tr>
        <tr><td style="padding:8px 0;vertical-align:top;"><span style="font-size:18px;">📘</span></td><td style="padding:8px 0;"><p style="margin:0;color:#333;font-size:15px;font-weight:600;">Workbook Resumo da Sessão</p><p style="margin:2px 0 0;color:#666;font-size:13px;">PDF com estrutura, exercícios e checklist</p></td></tr>
        <tr><td style="padding:8px 0;vertical-align:top;"><span style="font-size:18px;">💎</span></td><td style="padding:8px 0;"><p style="margin:0;color:#333;font-size:15px;font-weight:600;">Guia técnico de GEMs para vídeo</p><p style="margin:2px 0 0;color:#666;font-size:13px;">Passo-a-passo para criar GEMs de vídeo</p></td></tr>
        <tr><td style="padding:8px 0;vertical-align:top;"><span style="font-size:18px;">⚡</span></td><td style="padding:8px 0;"><p style="margin:0;color:#333;font-size:15px;font-weight:600;">Ficheiro GEM pronto a importar</p><p style="margin:2px 0 0;color:#666;font-size:13px;">Importa directamente para o Gemini</p></td></tr>
        <tr><td style="padding:8px 0;vertical-align:top;"><span style="font-size:18px;">🎧</span></td><td style="padding:8px 0;"><p style="margin:0;color:#333;font-size:15px;font-weight:600;">Áudio da sessão em MP3</p><p style="margin:2px 0 0;color:#666;font-size:13px;">Ouve em qualquer lugar</p></td></tr>
      </table>
      <div style="text-align:center;margin-top:20px;">
        <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#4338ca;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Obter o Premium Pass — €27+IVA →</a>
      </div>
    </div>

    <div style="border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:28px;">
      <p style="color:#16a34a;font-size:13px;letter-spacing:1px;text-transform:uppercase;font-weight:700;margin:0 0 8px;">Queres ir mais fundo?</p>
      <p style="color:#333;font-size:17px;font-weight:700;margin:0 0 8px;">Masterclass Vídeo com IA — €47+IVA</p>
      <p style="color:#555;font-size:15px;line-height:1.5;margin:0 0 16px;">3 horas de sessão avançada com demonstrações, casos reais e acompanhamento personalizado.</p>
      <div style="text-align:center;">
        <a href="https://imagenscomia.com/upgrade-video" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Saber mais sobre a Masterclass →</a>
      </div>
    </div>

    <div style="border-top:1px solid #eee;padding-top:20px;margin-top:8px;">
      <p style="color:#555;font-size:14px;line-height:1.5;margin:0 0 4px;">Dúvidas? Responde a este email ou escreve-me no <a href="https://wa.me/351919127479" style="color:#4338ca;text-decoration:none;font-weight:600;">WhatsApp</a>.</p>
      <p style="color:#333;font-size:15px;font-weight:700;margin:16px 0 0;">Frederico Carvalho</p>
      <p style="color:#999;font-size:12px;margin:2px 0 0;">DIGITALFC</p>
    </div>
  </div>
</div>
</body></html>`;
}

function personaliseHtml(html: string, variant: string): string {
  let result = html;

  if (variant === "D") {
    const mcBlockRegex = /<div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">\s*<p[^>]*>Queres ir mais fundo\?<\/p>[\s\S]*?<\/div>\s*<\/div>/;
    result = result.replace(mcBlockRegex, `<div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#555;font-size:14px;line-height:1.6;margin:0;">
      Já tens a Masterclass do nosso trabalho anterior — se quiseres explorar o tema Vídeo em profundidade, entra em contacto directamente: <a href="mailto:frederico@digitalfc.pt" style="color:#16a34a;font-weight:600;">frederico@digitalfc.pt</a>
    </p>
  </div>`);
  }

  if (variant === "C") {
    const premiumMarker = '<p style="color:#333;font-size:16px;font-weight:700;margin:0 0 8px;">Premium Pass</p>';
    const extraLine = '<p style="color:#555;font-size:14px;line-height:1.6;margin:0 0 12px;">Já conheces o valor do Premium Pass — este cobre a sessão completa e materiais específicos do tema Vídeo.</p>\n    ';
    result = result.replace(premiumMarker, extraLine + premiumMarker);
  }

  return result;
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
    const authDb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (!await authorizedDelivery(req, authDb, (key) => Deno.env.get(key))) {
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

    const { data: tpl } = await supabase
      .from("email_templates")
      .select("subject, html_body")
      .eq("template_key", TEMPLATE_KEY)
      .maybeSingle();

    for (const reg of toSend) {
      await new Promise(r => setTimeout(r, 600));
      try {
        const history = await getSubscriberHistory(reg.email, supabase);
        const variant = determineVariant(history);

        const fallbackHtml = buildHtml(reg.first_name || "");
        const rawHtml = tpl?.html_body ?? fallbackHtml;
        let html = rawHtml.replace(/\{\{fname\}\}/g, reg.first_name || "");
        html = personaliseHtml(html, variant);

        const emailSubject = (tpl?.subject ?? "O webinar já decorreu — e o que vem a seguir").replace(/\{\{fname\}\}/g, reg.first_name || "");

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
          email_key: "postwebinar",
          recipient_email: reg.email,
          fname: reg.first_name || "",
          status: ok ? "sent" : "failed",
          resend_id: result.messageId || null,
          error_message: ok ? null : JSON.stringify(result.error || result),
          metadata: JSON.stringify({
            variant,
            had_imagens_history: history !== null,
            imagens_plan: history?.plan_selected || null,
          }),
        });

        if (ok) sent++;
        else errors++;
      } catch (err) {
        console.error(`Failed for ${reg.email}:`, err);
        errors++;
      }
    }

    console.log(`video_postwebinar: sent=${sent}, errors=${errors}, skipped=${sentSet.size}`);
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
