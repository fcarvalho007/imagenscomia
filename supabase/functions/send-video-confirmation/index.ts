import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RESEND_FROM = "Frederico Carvalho <frederico.carvalho@digitalfc.pt>";

const GOOGLE_CAL_URL =
  "https://calendar.google.com/calendar/event?action=TEMPLATE&tmeid=MTI2azhxdmZzMWs0OWsxMWhqcHIyODZoYTQgZnJlZGVyaWNvZGlnaXRhbEBt&tmsrc=fredericodigital%40gmail.com";

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
  return "B"; // gratuito or any non-paid
}

function buildPsBlock(variant: string): string {
  if (variant === "A") return "";

  const texts: Record<string, string> = {
    B: "Já nos conhecemos do webinar de Imagens com IA — obrigado por voltares.<br><br>Este webinar cobre um tema diferente: vídeo curto para marketing, com um sistema de delegação que podes aplicar no dia seguinte.",
    C: "Já és cliente do webinar de Imagens com IA — obrigado pela confiança.<br><br>Como já conheces o formato e a qualidade do trabalho, o Premium Pass deste webinar (€15+IVA) pode fazer sentido para teres também a gravação e o Q&amp;A ao vivo do tema Vídeo.",
    D: "Já és cliente da Masterclass do webinar de Imagens com IA — obrigado pela confiança contínua.<br><br>Neste webinar vais ver como o sistema de vídeo se integra com o que já aprendeste sobre imagem. São dois lados do mesmo processo de produção de conteúdo.",
  };

  return `<div style="border-top:1px solid #eee;padding-top:20px;margin-bottom:24px;">
  <p style="color:#333;font-size:14px;font-weight:700;margin:0 0 8px;">PÓS-ESCRITO</p>
  <p style="color:#555;font-size:14px;line-height:1.6;margin:0;">${texts[variant]}</p>
</div>`;
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

    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch template from DB (fallback to hardcoded)
    const { data: tpl } = await supabaseAdmin
      .from("email_templates")
      .select("subject, html_body")
      .eq("template_key", "video_confirmation")
      .maybeSingle();

    // Check subscriber history for personalisation
    const history = await getSubscriberHistory(email, supabaseAdmin);
    const variant = determineVariant(history);

    const emailSubject = tpl?.subject ?? "Inscrição confirmada ✅ — Vídeo com IA para marketing";
    const rawHtml = tpl?.html_body ?? buildHtml(fname || "");
    let html = rawHtml.replace(/\{\{fname\}\}/g, fname || "");

    // Insert PS block before footer for variants B/C/D
    if (variant !== "A") {
      const psBlock = buildPsBlock(variant);
      const footerMarker = '<div style="border-top:1px solid #eee;padding-top:16px;margin-top:32px;">';
      const footerIdx = html.lastIndexOf(footerMarker);
      if (footerIdx !== -1) {
        html = html.slice(0, footerIdx) + psBlock + html.slice(footerIdx);
      }
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [email],
        subject: emailSubject,
        html,
      }),
    });

    const resendData = await resendRes.json();
    console.log("Resend response:", JSON.stringify(resendData));

    // Log to message_logs + email_send_logs
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
          template_key: "video_confirmation",
          provider: "resend",
          channel: "email",
          status: resendRes.ok ? "sent" : "failed",
          provider_message_id: resendData.id || null,
          error: resendRes.ok ? null : JSON.stringify(resendData),
        });

        await supabaseAdmin.from("email_send_logs").insert({
          webinar: "video",
          email_key: "confirmation",
          recipient_email: email.toLowerCase().trim(),
          fname: fname || "",
          status: resendRes.ok ? "sent" : "failed",
          resend_id: resendData.id || null,
          error_message: resendRes.ok ? null : JSON.stringify(resendData),
          metadata: JSON.stringify({
            variant,
            had_imagens_history: history !== null,
            imagens_plan: history?.plan_selected || null,
          }),
        });
      }
    } catch (logErr) {
      console.error("Logging failed (non-blocking):", logErr);
    }

    return new Response(
      JSON.stringify({ success: resendRes.ok, error: resendRes.ok ? undefined : resendData }),
      { status: resendRes.ok ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
