import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const WEBINAR_END = new Date("2026-03-05T11:00:00Z");
const EARLY_BIRD_END = new Date("2026-03-06T00:00:00Z"); // midnight UTC = midnight Lisbon (UTC+0 in winter)

const GOOGLE_CAL_URL = "https://calendar.app.google/kyhFPoficXByZf5S8";

const ICS_CONTENT = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260305T100000Z
DTEND:20260305T110000Z
SUMMARY:Cria Vídeo Profissional com IA
DESCRIPTION:Link de acesso: https://imagenscomia.com/live-video
LOCATION:https://imagenscomia.com/live-video
END:VEVENT
END:VCALENDAR`;

const ICS_DATA_URI = `data:text/calendar;charset=utf-8,${encodeURIComponent(ICS_CONTENT)}`;

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

function isPostEvent(): boolean {
  return new Date() > WEBINAR_END;
}

function isEarlyBird(): boolean {
  return new Date() < EARLY_BIRD_END;
}

function getPriceInfo(): { price: string; priceLabel: string } {
  if (isEarlyBird()) {
    return { price: "€15+IVA", priceLabel: "Early Bird — só hoje" };
  }
  return { price: "€27+IVA", priceLabel: "" };
}

function buildHtml(fname: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:system-ui,-apple-system,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#ffffff;padding:32px 28px;">
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 16px;">Olá ${fname},</p>
  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 24px;">Obrigado pela inscrição — está confirmada. ✅</p>

  <div style="border-top:1px solid #eee;border-bottom:1px solid #eee;padding:20px 0;margin:0 0 24px;">
    <p style="color:#333;font-size:18px;font-weight:700;margin:0 0 4px;">Webinar ao vivo</p>
    <p style="color:#555;font-size:15px;margin:0 0 12px;">Aprende a criar vídeos com Inteligência Artificial para marketing</p>
    <p style="color:#333;font-size:15px;margin:0;">📅 Quinta-feira, 5 de Março de 2026</p>
    <p style="color:#333;font-size:15px;margin:4px 0;">🕙 10h00 (Portugal)</p>
    <p style="color:#333;font-size:15px;margin:4px 0;">⏱️ 45–60 minutos</p>
  </div>

  <div style="text-align:center;margin:0 0 12px;">
    <a href="${GOOGLE_CAL_URL}" target="_blank" style="display:inline-block;background:#16a34a;color:#fff;padding:13px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:15px;">Adicionar ao Google Calendar</a>
  </div>
  <p style="text-align:center;margin:0 0 24px;">
    <a href="${ICS_DATA_URI}" download="webinar-video-ia.ics" style="color:#16a34a;font-size:14px;text-decoration:underline;">Adicionar ao Apple Calendar (.ics)</a>
  </p>

  <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 8px;">Link de acesso ao webinar ao vivo (guardar para dia 5):</p>
  <p style="margin:0 0 8px;"><a href="https://imagenscomia.com/live-video" style="color:#16a34a;font-weight:700;font-size:16px;">https://imagenscomia.com/live-video</a></p>
  <p style="color:#666;font-size:14px;line-height:1.5;margin:0 0 24px;">O link da transmissão estará disponível nessa página e será reenviado por email perto da hora de início.</p>

  <div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 8px;">Se fizer sentido, convida colegas ou amigos que trabalhem com marketing e precisem de produzir vídeo com mais consistência.</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 12px;">Ao convidar 2 pessoas que se inscrevam, ganhas o livro físico "Guia Essencial de SEO".</p>
    <p style="margin:0;"><a href="https://imagenscomia.com/convites" style="color:#16a34a;font-weight:600;font-size:15px;">Ver programa de convites →</a></p>
  </div>

  <div style="border-top:1px solid #eee;padding-top:16px;margin-top:32px;">
    <p style="color:#333;font-size:16px;margin:0 0 4px;">Até dia 5 de Março,</p>
    <p style="color:#333;font-size:16px;font-weight:700;margin:0 0 4px;">Frederico Carvalho</p>
    <p style="color:#999;font-size:12px;margin:0;">DIGITALFC</p>
  </div>
</div>
</body></html>`;
}

function buildPostEventHtml(fname: string, _price: string, _priceLabel: string): string {
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
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 8px;">Obrigado pela inscrição. ✅</p>
    <p style="color:#333;font-size:16px;line-height:1.6;margin:0 0 28px;">Tens à tua disposição uma sessão prática de 70 minutos onde mostro o processo completo — do briefing ao clip publicável — com ferramentas prontas a usar.</p>

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
    const { email, fname } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ success: false, error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const postEvent = isPostEvent();
    const history = await getSubscriberHistory(email, supabaseAdmin);
    const variant = determineVariant(history);

    // Determine template key
    let templateKey: string;
    if (postEvent) {
      templateKey = "video_confirmation_post_event";
    } else if (variant !== "A") {
      templateKey = "video_confirmation_returning";
    } else {
      templateKey = "video_confirmation";
    }

    const { data: tpl } = await supabaseAdmin
      .from("email_templates")
      .select("subject, html_body")
      .eq("template_key", templateKey)
      .maybeSingle();

    // Build subject and HTML with dynamic pricing for post-event
    const { price, priceLabel } = getPriceInfo();

    const emailSubject = (tpl?.subject ?? (postEvent
      ? `A sessão prática de vídeo com IA — acesso imediato, ${fname || ""}`
      : "Inscrição confirmada ✅ — Vídeo com IA para marketing"
    )).replace(/\{\{fname\}\}/g, fname || "").replace(/\{\{price\}\}/g, price);

    const rawHtml = tpl?.html_body ?? (postEvent
      ? buildPostEventHtml(fname || "", price, priceLabel)
      : buildHtml(fname || "")
    );
    const html = rawHtml
      .replace(/\{\{fname\}\}/g, fname || "")
      .replace(/\{\{price\}\}/g, price)
      .replace(/\{\{priceLabel\}\}/g, priceLabel);

    const result = await callSendEmail(supabaseUrl, serviceRoleKey, email, emailSubject, html);
    const ok = result.success === true;

    console.log(`[${templateKey}] Send-email response:`, JSON.stringify(result));

    try {
      const { data: reg } = await supabaseAdmin
        .from("registrations")
        .select("id")
        .eq("email", email.toLowerCase().trim())
        .eq("webinar", "video")
        .maybeSingle();

      if (reg) {
        await supabaseAdmin.from("message_logs").insert({
          registration_id: reg.id,
          template_key: templateKey,
          provider: result.provider || "unknown",
          channel: "email",
          status: ok ? "sent" : "failed",
          provider_message_id: result.messageId || null,
          error: ok ? null : JSON.stringify(result.error || result),
        });

        await supabaseAdmin.from("email_send_logs").insert({
          webinar: "video",
          email_key: "confirmation",
          recipient_email: email.toLowerCase().trim(),
          fname: fname || "",
          status: ok ? "sent" : "failed",
          resend_id: result.messageId || null,
          error_message: ok ? null : JSON.stringify(result.error || result),
          metadata: JSON.stringify({
            variant,
            post_event: postEvent,
            early_bird: isEarlyBird(),
            had_imagens_history: history !== null,
            imagens_plan: history?.plan_selected || null,
          }),
        });
      }
    } catch (logErr) {
      console.error("Logging failed (non-blocking):", logErr);
    }

    return new Response(
      JSON.stringify({ success: ok, error: ok ? undefined : result.error }),
      { status: ok ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
